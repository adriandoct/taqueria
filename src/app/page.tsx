import { Suspense } from 'react';
import { MenuGrid, getTacosForClient } from '@/components/MenuGrid';
import { VoiceAssistant } from '@/components/VoiceAssistant';
import { CorteTurnoModal } from '@/components/CorteTurnoModal';
import { ShiftBanner } from '@/components/ShiftBanner';
import { Flame, Mic, Star } from 'lucide-react';

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: 'rgba(255,255,255,0.04)', height: '380px' }}
        />
      ))}
    </div>
  );
}

// Client component wrapper for VoiceAssistant and CorteTurnoModal with server-fetched tacos
async function ClientHelpersWrapper() {
  const tacos = await getTacosForClient();
  return (
    <>
      <VoiceAssistant tacos={tacos} />
      <CorteTurnoModal tacos={tacos} />
    </>
  );
}

export default async function Home() {
  return (
    <main className="min-h-screen">
      {/* ---- HERO SECTION ---- */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 60%), #0D0A07',
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-1/4 left-10 w-80 h-80 rounded-full blur-[120px] pointer-events-none"
          style={{ background: 'rgba(249,115,22,0.07)' }}
        />
        <div
          className="absolute bottom-1/4 right-10 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
          style={{ background: 'rgba(239,68,68,0.05)' }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24 pb-32">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-semibold"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.25)',
              color: '#F97316',
            }}
          >
            <Star className="w-4 h-4 fill-current" />
            El sabor auténtico de México
            <Star className="w-4 h-4 fill-current" />
          </div>

          {/* Headline */}
          <h1
            className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-outfit)' }}
          >
            <span className="text-white">Tacos que</span>
            <br />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #F97316 0%, #EF4444 50%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              enamoran
            </span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Recetas tradicionales, ingredientes frescos del mercado y el sazón que se hereda.
            Pide en línea, por voz o registra las ventas de tu turno al instante.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#menu"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EF4444)',
                boxShadow: '0 8px 30px rgba(249,115,22,0.35)',
              }}
            >
              <Flame className="w-5 h-5 group-hover:animate-pulse" />
              Ver el Menú
            </a>
            <div
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-white/60 text-sm"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <Mic className="w-4 h-4 text-orange-400" />
              O usa el micrófono abajo →
            </div>
          </div>

          {/* Shift Live Banner */}
          <div className="mt-12 max-w-lg mx-auto">
            <ShiftBanner />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-14">
            {[
              { number: '8+', label: 'Tipos de taco' },
              { number: '100%', label: 'Ingredientes frescos' },
              { number: '15min', label: 'Tiempo promedio' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="text-3xl font-black mb-1"
                  style={{ color: '#F59E0B' }}
                >
                  {stat.number}
                </p>
                <p className="text-white/40 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
          <span className="text-xs uppercase tracking-widest">Desplaza</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ---- MENU SECTION ---- */}
      <section
        className="max-w-7xl mx-auto px-6 py-24"
        id="menu"
      >
        <Suspense fallback={<MenuSkeleton />}>
          <MenuGrid />
        </Suspense>
      </section>

      {/* ---- FOOTER ---- */}
      <footer
        className="text-center py-10 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-white font-bold text-sm">Taquería El Rincón Auténtico</span>
        </div>
        <p className="text-white/25 text-xs mb-3">
          Hecho con 🌮 y mucho sazón · Control de pedidos y corte de caja en tiempo real
        </p>
      </footer>

      {/* ---- CLIENT HELPERS (Voice Assistant + Corte de Turno Modal) ---- */}
      <Suspense fallback={null}>
        <ClientHelpersWrapper />
      </Suspense>
    </main>
  );
}
