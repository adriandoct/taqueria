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
  categoria     TEXT NOT NULL DEFAULT 'res',
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
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_tacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- profiles: Anyone can read basic profiles, user can update their own
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- menu_tacos: Anyone can read available items
CREATE POLICY "Public can read available menu items"
  ON public.menu_tacos
  FOR SELECT
  USING (disponible = TRUE);

-- pedidos: Anyone can create orders
CREATE POLICY "Anyone can create orders"
  ON public.pedidos
  FOR INSERT
  WITH CHECK (TRUE);

-- pedidos: Anyone can read orders
CREATE POLICY "Public can read pedidos"
  ON public.pedidos
  FOR SELECT
  USING (TRUE);

-- pedidos: Anyone can update order status (or admin/taquero)
CREATE POLICY "Public can update pedidos status"
  ON public.pedidos
  FOR UPDATE
  USING (TRUE);

-- ============================================================
-- SEED DATA — Menú
-- ============================================================
INSERT INTO public.menu_tacos (nombre, descripcion, precio, imagen_url, disponible, categoria) VALUES
(
  'Al Pastor',
  'Cerdo marinado en adobo rojo con piña caramelizada, cebolla morada y cilantro fresco. El clásico de la Ciudad de México.',
  22.00,
  '/tacos/pastor.png',
  TRUE,
  'cerdo'
),
(
  'Suadero',
  'Res cocida a fuego lento hasta lograr una textura melosa y dorada. Servido con cebolla blanca, cilantro y salsa verde.',
  24.00,
  '/tacos/asada.png',
  TRUE,
  'res'
),
(
  'Birria',
  'Res estofada en caldillo de chile guajillo y especias, con queso Oaxaca fundido y consomé para sumergir. Irresistible.',
  32.00,
  '/tacos/birria.png',
  TRUE,
  'res'
),
(
  'Carne Asada',
  'Arrachera de res a las brasas con guacamole casero, pico de gallo fresco y jugo de limón. Sabor a leña real.',
  28.00,
  '/tacos/asada.png',
  TRUE,
  'res'
),
(
  'Carnitas',
  'Cerdo confitado en manteca hasta quedar crujiente por fuera y jugoso por dentro. Con pico de gallo y aguacate.',
  25.00,
  '/tacos/carnitas.png',
  TRUE,
  'cerdo'
),
(
  'Tripa',
  'Tripa de res a la plancha, bien dorada y crujiente. Un taco de carácter para los conocedores.',
  20.00,
  '/tacos/tripa.png',
  TRUE,
  'res'
),
(
  'Campechano',
  'La mezcla perfecta: longaniza y suadero juntos en una tortilla. Con cebolla, cilantro y las dos salsas.',
  26.00,
  '/tacos/campechano.png',
  TRUE,
  'mixto'
),
(
  'Chorizo',
  'Chorizo rojo mexicano desmoronado, salteado con papa en cubos y especias. Colorido, aromático e intenso.',
  22.00,
  '/tacos/chorizo.png',
  TRUE,
  'cerdo'
)
ON CONFLICT DO NOTHING;
