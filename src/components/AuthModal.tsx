'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Shield, ChefHat, User, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/types';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    quickLoginAs,
    isLoading,
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('cliente');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    if (tab === 'login') {
      const res = await signInWithEmail(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Credenciales incorrectas');
      } else {
        setSuccessMsg('¡Bienvenido!');
        setTimeout(() => closeAuthModal(), 600);
      }
    } else {
      if (!nombre.trim()) {
        setErrorMsg('Por favor ingresa tu nombre completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      const res = await signUpWithEmail(email, password, nombre, selectedRole);
      if (!res.success) {
        setErrorMsg(res.error || 'Error al crear la cuenta');
      } else {
        setSuccessMsg('¡Cuenta creada con éxito!');
        setTimeout(() => closeAuthModal(), 600);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    const res = await signInWithGoogle();
    if (!res.success) {
      setErrorMsg(res.error || 'Error al conectar con Google');
    }
  };

  const fillAdminCredentials = () => {
    setTab('login');
    setEmail('admin@admin.com');
    setPassword('12345678Cecyte');
    setErrorMsg(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/10 my-auto"
          style={{
            background: 'linear-gradient(180deg, #1A1410 0%, #0E0B08 100%)',
            boxShadow: '0 25px 60px -15px rgba(249, 115, 22, 0.25)',
          }}
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-orange-500/15 blur-[60px] pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {/* Logo and Brand Title */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
              >
                <Flame className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-white font-black text-xl tracking-tight">
                  Taquería Jefe de Jefes
                </h2>
                <p className="text-orange-400/80 text-xs font-semibold uppercase tracking-wider">
                  Acceso al Sistema
                </p>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm transition-all shadow-md active:scale-[0.98] mb-5 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#15100C] px-3 text-[11px] font-semibold text-white/40 uppercase tracking-widest absolute">
                O con correo
              </span>
            </div>

            {/* Tabs: Iniciar Sesión / Registrarse */}
            <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/10 mb-5">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Don Pedro Gómez"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role Selection when Registering */}
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">
                    Tipo de Cuenta
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('cliente')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                        selectedRole === 'cliente'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 font-bold'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-xs">Cliente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('taquero')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                        selectedRole === 'taquero'
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400 font-bold'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <ChefHat className="w-5 h-5" />
                      <span className="text-xs">Taquero (Cocina)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error & Success Messages */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
                  boxShadow: '0 8px 25px rgba(249, 115, 22, 0.4)',
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Entrar a la Taquería' : 'Registrar Cuenta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Preset Admin shortcut button */}
            <div className="mt-5 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Cuenta Admin Preconfigurada
                </span>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="text-[10px] font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                >
                  Autorellenar
                </button>
              </div>
              <p className="text-[11px] text-white/50 leading-tight">
                Usuario: <code className="text-white/80 font-mono">admin@admin.com</code> · Pass:{' '}
                <code className="text-white/80 font-mono">12345678Cecyte</code>
              </p>
            </div>

            {/* Quick Demo Logins for easy testing */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-2.5 text-center">
                Acceso Rápido por Rol (Demostración)
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickLoginAs('admin')}
                  className="py-2 px-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>👑 Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginAs('taquero')}
                  className="py-2 px-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>👨‍🍳 Taquero</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickLoginAs('cliente')}
                  className="py-2 px-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>🌮 Cliente</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
