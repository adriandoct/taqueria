'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Clock, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { CartItemRow } from './CartItem';
import { OrderModal } from './OrderModal';

export function Cart() {
  const { items, isOpen, closeCart, total, itemCount, clearCart } = useCart();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const cartTotal = total();
  const count = itemCount();

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
        )}
      </AnimatePresence>

      {/* Slide Panel */}
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-[420px] z-50 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #1A1410 0%, #0D0A07 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
        }}
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,0.15)' }}
            >
              <ShoppingBag className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Tu Carrito</h2>
              <p className="text-white/40 text-xs">
                {count === 0 ? 'Vacío' : `${count} taco${count !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-48 text-center"
              >
                <div className="text-5xl mb-4">🌮</div>
                <p className="text-white/40 text-sm font-medium">Tu carrito está vacío</p>
                <p className="text-white/25 text-xs mt-1">
                  Agrega tacos del menú o usa el micrófono para pedir
                </p>
              </motion.div>
            ) : (
              items.map((item) => (
                <CartItemRow
                  key={`${item.taco.id}-${item.especificaciones}`}
                  item={item}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-4 py-5 space-y-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Estimated time */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)' }}>
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300/80 text-xs">Tiempo estimado: 15–20 minutos</span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between px-1">
              <span className="text-white/60 text-sm">Total</span>
              <span className="text-white font-bold text-2xl">
                $<span style={{ color: '#F59E0B' }}>{cartTotal.toFixed(0)}</span>{' '}
                <span className="text-white/30 text-sm font-normal">MXN</span>
              </span>
            </div>

            {/* Actions */}
            <motion.button
              onClick={() => setShowOrderModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-base"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EF4444)',
                boxShadow: '0 4px 24px rgba(249,115,22,0.35)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Hacer Pedido
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            <button
              onClick={clearCart}
              className="w-full text-white/30 text-xs py-1 hover:text-white/50 transition-colors"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </motion.div>

      {/* Order Modal */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        onSuccess={() => {
          setShowOrderModal(false);
          closeCart();
          clearCart();
        }}
      />
    </>
  );
}
