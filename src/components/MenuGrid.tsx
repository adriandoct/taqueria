import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { TacoCard } from './TacoCard';
import { Taco } from '@/lib/types';

// ──────────────────────────────────────────────────────────────────────────────
// MENÚ REAL: Taquería Jefe de Jefes
// Fuente: https://www.lacasadelmenu.com.mx/index.php/taqueria-jefe-de-jefes-2/
// ──────────────────────────────────────────────────────────────────────────────
export const MENU_JEFE: Taco[] = [
  // ── ALAMBRES ────────────────────────────────────────────────────────────────
  {
    id: 'alambre-pastor',
    nombre: 'Alambre al Pastor',
    descripcion: 'Pimiento · Cebolla · Tocino · Carne al pastor · Queso',
    precio: 130,
    imagen_url: '/tacos/pastor.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-bisteck',
    nombre: 'Alambre de Bisteck',
    descripcion: 'Pimiento · Cebolla · Champiñones · Bisteck · Queso',
    precio: 140,
    imagen_url: '/tacos/asada.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-hawaiano',
    nombre: 'Alambre Hawaiano',
    descripcion: 'Sal pastor · Piña · Tocino · Jamón · Queso',
    precio: 120,
    imagen_url: '/tacos/carnitas.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-burra',
    nombre: 'Burra',
    descripcion: 'Chuleta · Jamón · Tocino · Queso',
    precio: 130,
    imagen_url: '/tacos/campechano.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-especial',
    nombre: 'Alambre Especial',
    descripcion: 'Pimiento · Cebolla · Tomate · Chuleta · Carne al pastor · Tocino · Queso',
    precio: 130,
    imagen_url: '/tacos/chorizo.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-tlaconete',
    nombre: 'Tlaconete',
    descripcion: 'Carne al pastor · Tocino · Jamón · Salsa mexicana · Queso',
    precio: 130,
    imagen_url: '/tacos/pastor.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-charro',
    nombre: 'Charro',
    descripcion: 'Chuleta · Tocino · Chorizo · Pimiento · Cebolla · Queso',
    precio: 130,
    imagen_url: '/tacos/chorizo.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-sencillo',
    nombre: 'Alambre Sencillo',
    descripcion: 'Chuleta · Tocino · Queso · Pimiento · Cebolla',
    precio: 120,
    imagen_url: '/tacos/campechano.png',
    disponible: true,
    categoria: 'alambre',
  },
  {
    id: 'alambre-fortachon',
    nombre: 'Fortachón',
    descripcion: 'Bisteck · Tocino · Chorizo · Queso',
    precio: 140,
    imagen_url: '/tacos/tripa.png',
    disponible: true,
    categoria: 'alambre',
  },
  // ── TACOS (órdenes de 5) ─────────────────────────────────────────────────────
  {
    id: 'tacos-tasajo',
    nombre: 'Tacos de Tasajo',
    descripcion: 'Orden de 5 tacos de tasajo. Carne de res seca y sazonada al estilo oaxaqueño.',
    precio: 80,
    imagen_url: '/tacos/asada.png',
    disponible: true,
    categoria: 'taco',
    unidad: 'orden de 5',
  },
  {
    id: 'tacos-chuleta',
    nombre: 'Tacos de Chuleta',
    descripcion: 'Orden de 5 tacos de chuleta de cerdo asada, jugosa y bien sazonada.',
    precio: 80,
    imagen_url: '/tacos/carnitas.png',
    disponible: true,
    categoria: 'taco',
    unidad: 'orden de 5',
  },
  {
    id: 'tacos-pastor',
    nombre: 'Tacos al Pastor',
    descripcion: 'Orden de 5 tacos al pastor. Cerdo marinado en adobo con piña.',
    precio: 70,
    imagen_url: '/tacos/pastor.png',
    disponible: true,
    categoria: 'taco',
    unidad: 'orden de 5',
  },
  // ── SUIZO & SINCRONIZADA ──────────────────────────────────────────────────────
  {
    id: 'suizo',
    nombre: 'Suizo',
    descripcion: 'Suizo de carne con queso gratinado. Clásico y irresistible.',
    precio: 45,
    imagen_url: '/tacos/campechano.png',
    disponible: true,
    categoria: 'suizo',
  },
  {
    id: 'sincronizada',
    nombre: 'Sincronizada',
    descripcion: 'Tortilla de harina con jamón y queso, prensada a la perfección.',
    precio: 40,
    imagen_url: '/tacos/chorizo.png',
    disponible: true,
    categoria: 'sincronizada',
  },
  // ── QUESADILLAS ───────────────────────────────────────────────────────────────
  {
    id: 'quesadilla',
    nombre: 'Quesadilla',
    descripcion: 'Quesadilla de maíz con queso derretido. Elige tu relleno.',
    precio: 40,
    imagen_url: '/tacos/tripa.png',
    disponible: true,
    categoria: 'quesadilla',
  },
  // ── BEBIDAS ───────────────────────────────────────────────────────────────────
  {
    id: 'refresco-desechable',
    nombre: 'Refresco Desechable',
    descripcion: 'Refresco en botella desechable de 600 ml.',
    precio: 35,
    imagen_url: '/tacos/pastor.png',
    disponible: true,
    categoria: 'bebida',
    unidad: '600 ml',
  },
  {
    id: 'refresco-vidrio',
    nombre: 'Refresco en Vidrio',
    descripcion: 'Refresco clásico en botella de vidrio, bien frío.',
    precio: 30,
    imagen_url: '/tacos/pastor.png',
    disponible: true,
    categoria: 'bebida',
    unidad: 'vidrio',
  },
  {
    id: 'boing',
    nombre: 'Boing',
    descripcion: 'Jugo Boing desechable de 354 ml. Natural y refrescante.',
    precio: 30,
    imagen_url: '/tacos/pastor.png',
    disponible: true,
    categoria: 'bebida',
    unidad: '354 ml',
  },
];

// Category metadata for display
export const CATEGORY_INFO: Record<string, { label: string; emoji: string; description: string }> = {
  alambre: { label: 'Alambres', emoji: '🔥', description: 'Platillos preparados con carnes asadas, verduras y queso' },
  taco: { label: 'Tacos', emoji: '🌮', description: 'Órdenes de 5 tacos — tasajo, chuleta o pastor' },
  suizo: { label: 'Suizo', emoji: '🧀', description: 'Suizo de carne con queso gratinado' },
  sincronizada: { label: 'Sincronizada', emoji: '🫓', description: 'Tortilla de harina con jamón y queso' },
  quesadilla: { label: 'Quesadillas', emoji: '🫔', description: 'Quesadillas de maíz con queso y relleno' },
  bebida: { label: 'Bebidas', emoji: '🥤', description: 'Refrescos y jugos para acompañar tu pedido' },
};

async function getTacos(): Promise<Taco[]> {
  // Return mock data if Supabase not configured
  if (!isSupabaseConfigured()) {
    return MENU_JEFE;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('menu_tacos')
      .select('*')
      .eq('disponible', true)
      .order('categoria');

    if (error) throw error;
    return (data as Taco[]) || MENU_JEFE;
  } catch {
    console.warn('Supabase unavailable, using menu data');
    return MENU_JEFE;
  }
}

export async function MenuGrid() {
  const tacos = await getTacos();

  // Group items by category
  const grouped = tacos.reduce<Record<string, Taco[]>>((acc, taco) => {
    if (!acc[taco.categoria]) acc[taco.categoria] = [];
    acc[taco.categoria].push(taco);
    return acc;
  }, {});

  const categoryOrder = ['alambre', 'taco', 'suizo', 'sincronizada', 'quesadilla', 'bebida'];

  return (
    <section id="menu" className="w-full space-y-16">
      {/* Section Header */}
      <div className="text-center">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ background: 'rgba(249,115,22,0.12)', color: '#F97316', border: '1px solid rgba(249,115,22,0.2)' }}
        >
          🌮 Menú Jefe de Jefes
        </span>
        <h2 className="text-white text-4xl font-black mb-4 leading-tight">
          El sabor auténtico
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
          Alambres, tacos, sincronizadas y más. Elige tus favoritos o pide por voz.
          Servicio de 7am a 12 de la noche. ☎️{' '}
          <a
            href="tel:+529511476075"
            className="text-orange-400 hover:text-orange-300 transition-colors font-semibold"
          >
            951 147 60 75
          </a>
        </p>
        <p className="text-white/30 text-sm mt-2">
          📦 Envío a domicilio · Costo mínimo $25 · Zona: Ríos, Volcanes, 7 Regiones, Jardín, Donaji, San Luis Beltrán y Dolores
        </p>
      </div>

      {/* Categories */}
      {categoryOrder.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const info = CATEGORY_INFO[cat] ?? { label: cat, emoji: '🍽️', description: '' };

        return (
          <div key={cat}>
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
                style={{
                  background: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.25)',
                  color: '#F97316',
                }}
              >
                <span>{info.emoji}</span>
                <span>{info.label}</span>
              </div>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <p className="text-white/30 text-xs hidden sm:block">{info.description}</p>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {items.map((taco, index) => (
                <TacoCard key={taco.id} taco={taco} index={index} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// Export tacos for client components (voice assistant)
export async function getTacosForClient(): Promise<Taco[]> {
  return getTacos();
}
