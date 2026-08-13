'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, CheckCircle2, Volume2, ShoppingBag, Plus } from 'lucide-react';
import { VoiceWaves } from './VoiceWaves';
import { useVoice } from '@/hooks/useVoice';
import { useCart } from '@/hooks/useCart';
import { parseVoiceOrder } from '@/lib/voice-parser';
import { Taco, CartItem } from '@/lib/types';

interface VoiceAssistantProps {
  tacos: Taco[];
}

export function VoiceAssistant({ tacos }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [addedItems, setAddedItems] = useState<CartItem[]>([]);
  const { addItem, openCart } = useCart();

  const handleResult = (finalTranscript: string) => {
    const parsed = parseVoiceOrder(finalTranscript, tacos);
    const newItems: CartItem[] = [];
    for (const item of parsed) {
      const taco = tacos.find(
        (t) => t.nombre.toLowerCase() === item.nombreTaco.toLowerCase()
      );
      if (taco) {
        addItem(taco, item.cantidad, item.especificaciones);
        newItems.push({ taco, cantidad: item.cantidad, especificaciones: item.especificaciones });
      }
    }
    // Accumulate items — NO auto-close, NO auto-open cart
    setAddedItems((prev) => [...prev, ...newItems]);
  };

  const { voiceState, transcript, interimTranscript, error, isSupported, startListening, stopListening, resetTranscript } =
    useVoice({ onResult: handleResult });

  const isDone = addedItems.length > 0;
  const totalAdded = addedItems.reduce((sum, i) => sum + i.cantidad, 0);

  const handleOpen = () => {
    if (!isSupported) {
      alert('Tu navegador no soporta reconocimiento de voz. Por favor usa Chrome o Edge.');
      return;
    }
    setIsOpen(true);
  };

  // Close modal silently — items remain in cart
  const handleClose = () => {
    if (voiceState === 'listening') stopListening();
    setIsOpen(false);
    resetTranscript();
    setAddedItems([]);
  };

  // View cart and close modal
  const handleViewCart = () => {
    if (voiceState === 'listening') stopListening();
    setIsOpen(false);
    resetTranscript();
    setAddedItems([]);
    openCart();
  };

  // Continue listening — reset transcript but keep accumulated items
  const handleContinue = () => {
    resetTranscript();
    startListening();
  };

  const handleConfirm = () => {
    if (voiceState === 'listening') {
      stopListening();
    } else if (transcript.trim()) {
      handleResult(transcript);
    }
  };

  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');
  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #F97316, #EF4444)',
          boxShadow: '0 0 30px rgba(249,115,22,0.5)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
        aria-label="Pedir por voz"
        title="Pedir por voz"
      >
        {/* Pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(249,115,22,0.4)' }}
          animate={{ scale: [1, 1.5, 1.8], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '2px solid rgba(249,115,22,0.3)' }}
          animate={{ scale: [1, 1.3, 1.6], opacity: [0.5, 0.15, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
        />
        <Mic className="w-7 h-7 text-white relative z-10" />
      </motion.button>

      {/* Voice Overlay Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Card */}
            <motion.div
              className="relative w-full max-w-lg rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1A1410, #0D0A07)',
                border: '1px solid rgba(249,115,22,0.2)',
                boxShadow: '0 0 60px rgba(249,115,22,0.15)',
              }}
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="p-6 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(249,115,22,0.15)' }}
                  >
                    <Volume2 className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">Pedido por Voz</h2>
                    <p className="text-orange-300/60 text-xs">Español México (es-MX)</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status indicator */}
              <div className="px-6 py-2">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-xs font-medium"
                  style={{
                    background: isDone
                      ? 'rgba(34,197,94,0.15)'
                      : isProcessing
                      ? 'rgba(245,158,11,0.15)'
                      : isListening
                      ? 'rgba(34,197,94,0.15)'
                      : 'rgba(255,255,255,0.05)',
                    color: isDone
                      ? '#22C55E'
                      : isProcessing
                      ? '#F59E0B'
                      : isListening
                      ? '#22C55E'
                      : '#9CA3AF',
                  }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: isDone
                        ? '#22C55E'
                        : isProcessing
                        ? '#F59E0B'
                        : isListening
                        ? '#22C55E'
                        : '#6B7280',
                    }}
                    animate={isListening ? { scale: [1, 1.4, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  {isDone
                    ? `✓ ${totalAdded} taco${totalAdded !== 1 ? 's' : ''} en el carrito`
                    : isProcessing
                    ? 'Procesando tu orden...'
                    : isListening
                    ? 'Escuchando...'
                    : 'Listo para escuchar'}
                </div>
              </div>

              {/* Waves */}
              <div className="px-6 py-4">
                <VoiceWaves isActive={isListening} isProcessing={isProcessing} />
              </div>

              {/* Transcript Display */}
              <div
                className="mx-6 mb-3 p-4 rounded-2xl min-h-[80px] relative"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {!displayText && !error ? (
                  <p className="text-white/25 text-sm italic text-center mt-3">
                    {isListening
                      ? 'Di tu pedido, por ejemplo: "3 tacos al pastor con todo y 2 de birria"'
                      : 'Presiona el micrófono para comenzar'}
                  </p>
                ) : error ? (
                  <p className="text-red-400 text-sm">{error}</p>
                ) : (
                  <p className="text-white/90 text-sm leading-relaxed">
                    <span>{transcript}</span>
                    {interimTranscript && (
                      <span className="text-orange-300/60 italic"> {interimTranscript}</span>
                    )}
                  </p>
                )}
              </div>

              {/* Accumulated items summary — shown silently, stays until user acts */}
              <AnimatePresence>
                {isDone && (
                  <motion.div
                    className="mx-6 mb-3 rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.07)' }}
                  >
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <p className="text-green-300 text-xs font-semibold uppercase tracking-wide">
                          En el carrito ({totalAdded} taco{totalAdded !== 1 ? 's' : ''})
                        </p>
                      </div>
                      <div className="space-y-1">
                        {addedItems.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-white/70">
                              {item.cantidad}× {item.taco.nombre}
                              {item.especificaciones && (
                                <span className="text-white/35 ml-1">({item.especificaciones})</span>
                              )}
                            </span>
                            <span className="text-amber-400 font-semibold">
                              ${(item.taco.precio * item.cantidad).toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tip */}
              <div className="px-6 mb-3">
                <p className="text-white/25 text-xs text-center">
                  💡 Puedes seguir agregando tacos por voz antes de ver el carrito
                </p>
              </div>

              {/* Controls */}
              <div className="px-6 pb-6 space-y-2">
                {/* Row 1: mic controls */}
                <div className="flex gap-2">
                  {!isListening ? (
                    <button
                      onClick={isDone ? handleContinue : startListening}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: isDone
                          ? 'linear-gradient(135deg, #7C3AED, #6D28D9)'
                          : 'linear-gradient(135deg, #F97316, #EF4444)',
                        boxShadow: isDone
                          ? '0 4px 20px rgba(124,58,237,0.3)'
                          : '0 4px 20px rgba(249,115,22,0.3)',
                      }}
                    >
                      {isDone ? (
                        <><Plus className="w-4 h-4" /> Agregar más tacos</>
                      ) : (
                        <><Mic className="w-4 h-4" /> Iniciar Grabación</>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={stopListening}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #374151, #1F2937)',
                        border: '1px solid rgba(239,68,68,0.4)',
                      }}
                    >
                      <MicOff className="w-4 h-4 text-red-400" />
                      Detener
                    </button>
                  )}
                  {transcript && !isListening && !isDone && (
                    <button
                      onClick={handleConfirm}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-40"
                      style={{
                        background: 'linear-gradient(135deg, #16A34A, #15803D)',
                        boxShadow: '0 4px 20px rgba(22,163,74,0.3)',
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar
                    </button>
                  )}
                </div>

                {/* Row 2: cart actions — only visible after items were added */}
                <AnimatePresence>
                  {isDone && (
                    <motion.div
                      className="flex gap-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <button
                        onClick={handleViewCart}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition-all"
                        style={{
                          background: 'linear-gradient(135deg, #F97316, #EF4444)',
                          boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                        }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Ver Carrito
                      </button>
                      <button
                        onClick={handleClose}
                        className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-white/50 text-sm font-medium hover:text-white/80 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <X className="w-4 h-4" />
                        Cerrar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
