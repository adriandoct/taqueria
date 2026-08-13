'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Star } from 'lucide-react';
import { Taco } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

interface TacoCardProps {
  taco: Taco;
  index: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  res: '#EF4444',
  cerdo: '#F97316',
  mixto: '#8B5CF6',
  vegetariano: '#22C55E',
};

const CATEGORY_LABELS: Record<string, string> = {
  res: '🐄 Res',
  cerdo: '🐷 Cerdo',
  mixto: '✨ Mixto',
  vegetariano: '🌱 Vegetal',
};

export function TacoCard({ taco, index }: TacoCardProps) {
  const { addItem, openCart } = useCart();
  const [specs, setSpecs] = useState('');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(taco, 1, specs);
    setAdded(true);
    setSpecs('');
    setTimeout(() => {
      setAdded(false);
      openCart();
    }, 600);
  };

  const categoryColor = CATEGORY_COLORS[taco.categoria] || '#F97316';
  const categoryLabel = CATEGORY_LABELS[taco.categoria] || taco.categoria;

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: 'linear-gradient(145deg, #1A1410, #120E0A)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 60px ${categoryColor}25`,
        borderColor: `${categoryColor}30`,
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={taco.imagen_url}
          alt={taco.nombre}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Image overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 40%, rgba(13,10,7,0.95) 100%)',
          }}
        />

        {/* Category Badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
          style={{ background: `${categoryColor}CC`, backdropFilter: 'blur(8px)' }}
        >
          {categoryLabel}
        </div>

        {/* Price Badge */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-sm font-bold text-white"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        >
          $<span style={{ color: '#F59E0B' }}>{taco.precio.toFixed(0)}</span>
        </div>

        {/* Star */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1 leading-tight">{taco.nombre}</h3>
        <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-4">
          {taco.descripcion}
        </p>

        {/* Specs Input */}
        <input
          type="text"
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          placeholder="Personaliza (ej: sin cebolla, salsa verde aparte)"
          className="w-full text-xs px-3 py-2 rounded-lg mb-3 outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = `${categoryColor}60`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        />

        {/* Add Button */}
        <motion.button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm text-white transition-all"
          style={{
            background: added
              ? 'linear-gradient(135deg, #16A34A, #15803D)'
              : `linear-gradient(135deg, ${categoryColor}, ${categoryColor}CC)`,
            boxShadow: added
              ? '0 4px 20px rgba(22,163,74,0.4)'
              : `0 4px 20px ${categoryColor}30`,
          }}
          whileTap={{ scale: 0.95 }}
          animate={added ? { scale: [1, 1.05, 1] } : {}}
        >
          {added ? (
            <>✓ ¡Agregado!</>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Agregar al Carrito
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
