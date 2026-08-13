'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Flame } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

export function Navbar() {
  const { itemCount, toggleCart } = useCart();
  const count = itemCount();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-30 px-6 py-4"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'rgba(13,10,7,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
          >
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-xl tracking-tight leading-none">
              Taquería
            </h1>
            <p className="text-orange-400/80 text-[10px] font-semibold tracking-widest uppercase leading-none">
              El Rincón Auténtico
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {['Menú', 'Nosotros', 'Ubicación'].map((item) => (
            <button
              key={item}
              className="text-white/50 hover:text-white text-sm font-medium transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Cart Button */}
        <motion.button
          onClick={toggleCart}
          className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm transition-all"
          style={{
            background: count > 0
              ? 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(239,68,68,0.15))'
              : 'rgba(255,255,255,0.06)',
            border: count > 0 ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.08)',
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label={`Carrito: ${count} tacos`}
        >
          <ShoppingBag className="w-4 h-4" style={{ color: count > 0 ? '#F97316' : 'rgba(255,255,255,0.6)' }} />
          <span className={count > 0 ? 'text-orange-300' : 'text-white/60'}>
            {count > 0 ? `${count} taco${count !== 1 ? 's' : ''}` : 'Carrito'}
          </span>

          {/* Animated badge */}
          <AnimatePresence>
            {count > 0 && (
              <motion.span
                key={count}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {count > 9 ? '9+' : count}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.nav>
  );
}
