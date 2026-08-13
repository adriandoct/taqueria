-- ============================================================
-- TAQUERIA APP — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
                      CHECK (estado IN ('pendiente', 'en preparación', 'listo', 'entregado')),
  transcripcion_voz   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on both tables
ALTER TABLE public.menu_tacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- menu_tacos: Anyone can read available items
CREATE POLICY "Public can read available menu items"
  ON public.menu_tacos
  FOR SELECT
  USING (disponible = TRUE);

-- pedidos: Anyone can insert new orders (no auth required)
CREATE POLICY "Anyone can create orders"
  ON public.pedidos
  FOR INSERT
  WITH CHECK (TRUE);

-- pedidos: Anyone can read their own order by id (we return id on creation)
CREATE POLICY "Public can read pedidos"
  ON public.pedidos
  FOR SELECT
  USING (TRUE);

-- ============================================================
-- SEED DATA — 8 Classic Tacos
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
);
