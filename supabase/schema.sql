-- ============================================================
-- TAQUERIA APP — Supabase Schema con Autenticación y 3 Roles
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles (Roles: admin, taquero, cliente)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  nombre        TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'cliente'
                CHECK (role IN ('admin', 'taquero', 'cliente')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: menu_tacos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.menu_tacos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  descripcion   TEXT,
  precio        DECIMAL(10, 2) NOT NULL,
  imagen_url    TEXT,
  disponible    BOOLEAN NOT NULL DEFAULT TRUE,
  categoria     TEXT NOT NULL DEFAULT 'alambre',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: pedidos
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pedidos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_nombre      TEXT NOT NULL,
  detalles_orden      JSONB NOT NULL DEFAULT '[]',
  total               DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estado              TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente', 'en preparación', 'listo', 'entregado', 'cancelado')),
  transcripcion_voz   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: Auto-creación de Perfil al Registrarse (Email o Google)
-- Asigna automáticamente 'admin' si el correo es admin@admin.com
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN LOWER(new.email) = 'admin@admin.com' THEN 'admin'
      WHEN new.raw_user_meta_data->>'role' IN ('admin', 'taquero', 'cliente') THEN new.raw_user_meta_data->>'role'
      ELSE 'cliente'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    nombre = EXCLUDED.nombre,
    avatar_url = EXCLUDED.avatar_url,
    role = CASE 
      WHEN LOWER(EXCLUDED.email) = 'admin@admin.com' THEN 'admin'
      ELSE profiles.role 
    END,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & POLICIES (Idempotent)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_tacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- profiles policies
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- menu_tacos policies
DROP POLICY IF EXISTS "Public can read available menu items" ON public.menu_tacos;
CREATE POLICY "Public can read available menu items"
  ON public.menu_tacos
  FOR SELECT
  USING (disponible = TRUE);

-- pedidos policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.pedidos;
CREATE POLICY "Anyone can create orders"
  ON public.pedidos
  FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Public can read pedidos" ON public.pedidos;
CREATE POLICY "Public can read pedidos"
  ON public.pedidos
  FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Public can update pedidos status" ON public.pedidos;
CREATE POLICY "Public can update pedidos status"
  ON public.pedidos
  FOR UPDATE
  USING (TRUE);

-- ============================================================
-- SEED DATA — Menú Real Taquería Jefe de Jefes (18 Productos)
-- ============================================================
-- Limpiar o insertar los 18 productos reales
INSERT INTO public.menu_tacos (nombre, descripcion, precio, imagen_url, disponible, categoria) VALUES
-- ALAMBRES
('Alambre al Pastor', 'Pimiento · Cebolla · Tocino · Carne al pastor · Queso', 130.00, '/menu/alambre-pastor.png', TRUE, 'alambre'),
('Alambre de Bisteck', 'Pimiento · Cebolla · Champiñones · Bisteck · Queso', 140.00, '/menu/alambre-bistec.png', TRUE, 'alambre'),
('Alambre Hawaiano', 'Sal pastor · Piña · Tocino · Jamón · Queso', 120.00, '/menu/alambre-hawaiano.png', TRUE, 'alambre'),
('Burra', 'Chuleta · Jamón · Tocino · Queso', 130.00, '/menu/alambre-especial.png', TRUE, 'alambre'),
('Alambre Especial', 'Pimiento · Cebolla · Tomate · Chuleta · Carne al pastor · Tocino · Queso', 130.00, '/menu/alambre-especial.png', TRUE, 'alambre'),
('Tlaconete', 'Carne al pastor · Tocino · Jamón · Salsa mexicana · Queso', 130.00, '/menu/alambre-pastor.png', TRUE, 'alambre'),
('Charro', 'Chuleta · Tocino · Chorizo · Pimiento · Cebolla · Queso', 130.00, '/menu/alambre-especial.png', TRUE, 'alambre'),
('Alambre Sencillo', 'Chuleta · Tocino · Queso · Pimiento · Cebolla', 120.00, '/menu/alambre-bistec.png', TRUE, 'alambre'),
('Fortachón', 'Bisteck · Tocino · Chorizo · Queso', 140.00, '/menu/alambre-bistec.png', TRUE, 'alambre'),

-- TACOS (Órdenes de 5)
('Tacos de Tasajo', 'Orden de 5 tacos de tasajo. Carne de res seca y sazonada al estilo oaxaqueño.', 80.00, '/menu/tacos-orden.png', TRUE, 'taco'),
('Tacos de Chuleta', 'Orden de 5 tacos de chuleta de cerdo asada, jugosa y bien sazonada.', 80.00, '/menu/tacos-orden.png', TRUE, 'taco'),
('Tacos al Pastor', 'Orden de 5 tacos al pastor. Cerdo marinado en adobo con piña.', 70.00, '/menu/tacos-orden.png', TRUE, 'taco'),

-- SUIZO Y SINCRONIZADA
('Suizo', 'Suizo de carne con queso gratinado. Clásico y delicioso.', 45.00, '/menu/sincronizada.png', TRUE, 'suizo'),
('Sincronizada', 'Tortilla de harina con jamón y queso, prensada a la perfección.', 40.00, '/menu/sincronizada.png', TRUE, 'sincronizada'),
('Quesadilla', 'Quesadilla de maíz con queso derretido. Elige tu relleno.', 40.00, '/menu/quesadilla.png', TRUE, 'quesadilla'),

-- BEBIDAS
('Refresco Desechable', 'Refresco en botella desechable de 600 ml bien frío.', 35.00, '/menu/bebidas.png', TRUE, 'bebida'),
('Refresco en Vidrio', 'Refresco clásico en botella de vidrio, bien frío.', 30.00, '/menu/bebidas.png', TRUE, 'bebida'),
('Boing', 'Jugo Boing desechable de 354 ml. Natural y refrescante.', 30.00, '/menu/bebidas.png', TRUE, 'bebida')
ON CONFLICT DO NOTHING;
