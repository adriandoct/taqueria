import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { TacoCard } from './TacoCard';
import { Taco } from '@/lib/types';

// Mock data for when Supabase is not configured
const MOCK_TACOS: Taco[] = [
  {
    id: '1',
    nombre: 'Al Pastor',
    descripcion: 'Cerdo marinado en adobo rojo con piña caramelizada, cebolla morada y cilantro fresco. El clásico de la Ciudad de México.',
    precio: 22,
    imagen_url: '/tacos/pastor.png',
    disponible: true,
    categoria: 'cerdo',
  },
  {
    id: '2',
    nombre: 'Suadero',
    descripcion: 'Res cocida a fuego lento hasta lograr una textura melosa y dorada. Servido con cebolla blanca, cilantro y salsa verde.',
    precio: 24,
    imagen_url: '/tacos/asada.png',
    disponible: true,
    categoria: 'res',
  },
  {
    id: '3',
    nombre: 'Birria',
    descripcion: 'Res estofada en caldillo de chile guajillo y especias, con queso Oaxaca fundido y consomé para sumergir. Irresistible.',
    precio: 32,
    imagen_url: '/tacos/birria.png',
    disponible: true,
    categoria: 'res',
  },
  {
    id: '4',
    nombre: 'Carne Asada',
    descripcion: 'Arrachera de res a las brasas con guacamole casero, pico de gallo fresco y jugo de limón. Sabor a leña real.',
    precio: 28,
    imagen_url: '/tacos/asada.png',
    disponible: true,
    categoria: 'res',
  },
  {
    id: '5',
    nombre: 'Carnitas',
    descripcion: 'Cerdo confitado en manteca hasta quedar crujiente por fuera y jugoso por dentro. Con pico de gallo y aguacate.',
    precio: 25,
    imagen_url: '/tacos/carnitas.png',
    disponible: true,
    categoria: 'cerdo',
  },
  {
    id: '6',
    nombre: 'Tripa',
    descripcion: 'Tripa de res a la plancha, bien dorada y crujiente. Un taco de carácter para los conocedores.',
    precio: 20,
    imagen_url: '/tacos/tripa.png',
    disponible: true,
    categoria: 'res',
  },
  {
    id: '7',
    nombre: 'Campechano',
    descripcion: 'La mezcla perfecta: longaniza y suadero juntos en una tortilla. Con cebolla, cilantro y las dos salsas.',
    precio: 26,
    imagen_url: '/tacos/campechano.png',
    disponible: true,
    categoria: 'mixto',
  },
  {
    id: '8',
    nombre: 'Chorizo',
    descripcion: 'Chorizo rojo mexicano desmoronado, salteado con papa en cubos y especias. Colorido, aromático e intenso.',
    precio: 22,
    imagen_url: '/tacos/chorizo.png',
    disponible: true,
    categoria: 'cerdo',
  },
];

async function getTacos(): Promise<Taco[]> {
  // Return mock data if Supabase not configured
  if (!isSupabaseConfigured()) {
    return MOCK_TACOS;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('menu_tacos')
      .select('*')
      .eq('disponible', true)
      .order('categoria');

    if (error) throw error;
    return (data as Taco[]) || MOCK_TACOS;
  } catch {
    console.warn('Supabase unavailable, using mock data');
    return MOCK_TACOS;
  }
}

export async function MenuGrid() {
  const tacos = await getTacos();

  return (
    <section id="menu" className="w-full">
      {/* Section Header */}
      <div className="text-center mb-12">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ background: 'rgba(249,115,22,0.12)', color: '#F97316', border: '1px solid rgba(249,115,22,0.2)' }}
        >
          🌮 Nuestro Menú
        </span>
        <h2 className="text-white text-4xl font-black mb-4 leading-tight">
          Tacos que enamoran
        </h2>
        <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
          Recetas tradicionales, ingredientes frescos y el auténtico sazón de México. 
          Elige tus favoritos o pide por voz.
        </p>
      </div>

      {/* Taco Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {tacos.map((taco, index) => (
          <TacoCard key={taco.id} taco={taco} index={index} />
        ))}
      </div>
    </section>
  );
}

// Export tacos for client components (voice assistant)
export async function getTacosForClient(): Promise<Taco[]> {
  return getTacos();
}
