'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Flame,
  BarChart3,
  ChefHat,
  User,
  Shield,
  LogOut,
  ChevronDown,
  LogIn,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useShift } from '@/hooks/useShift';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/lib/types';

export function Navbar() {
  const { itemCount, toggleCart } = useCart();
  const { toggleCorte, getSummary, fetchOrders } = useShift();
  const {
    user,
    openAuthModal,
    openKitchenModal,
    openClientOrdersModal,
    signOut,
    initAuth,
    quickLoginAs,
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const count = itemCount();
  const summary = getSummary();

  useEffect(() => {
    fetchOrders();
    initAuth();
  }, [fetchOrders, initAuth]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          icon: Shield,
          text: 'Admin',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'taquero':
        return {
          icon: ChefHat,
          text: 'Taquero',
          badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        };
      case 'cliente':
      default:
        return {
          icon: User,
          text: 'Cliente',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const currentRoleInfo = user ? getRoleBadge(user.role) : null;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-30 px-3 sm:px-6 py-3"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        background: 'rgba(13,10,7,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo + Name */}
        <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
          >
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-black text-lg sm:text-xl tracking-tight leading-none">
              Jefe de Jefes
            </h1>
            <p className="text-orange-400/80 text-[10px] font-semibold tracking-widest uppercase leading-none mt-0.5">
              Alambres y Tacos
            </p>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
          <a
            href="#menu"
            className="text-white/70 hover:text-white text-sm font-semibold transition-colors"
          >
            Menú
          </a>

          {/* Mis Pedidos for Clients */}
          <button
            onClick={openClientOrdersModal}
            className="text-white/70 hover:text-orange-400 text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Mis Pedidos</span>
          </button>

          {/* Cocina KDS for Taquero & Admin */}
          {(user?.role === 'taquero' || user?.role === 'admin') && (
            <button
              onClick={openKitchenModal}
              className="text-orange-400 hover:text-orange-300 text-sm font-bold transition-colors flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 cursor-pointer"
            >
              <ChefHat className="w-4 h-4" />
              <span>Cocina KDS</span>
            </button>
          )}

          {/* Corte del Día for Admin */}
          {user?.role === 'admin' && (
            <button
              onClick={toggleCorte}
              className="text-amber-400 hover:text-amber-300 text-sm font-bold transition-colors flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Corte de Caja</span>
            </button>
          )}
        </div>

        {/* Right Actions: Auth + Corte + Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Cocina button on mobile for taquero */}
          {user && (user.role === 'taquero' || user.role === 'admin') && (
            <motion.button
              onClick={openKitchenModal}
              className="flex lg:hidden items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-orange-500/20 border border-orange-500/30 text-orange-300"
              whileTap={{ scale: 0.95 }}
              title="Cocina KDS"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cocina</span>
            </motion.button>
          )}

          {/* Shift Sales Badge / Button (visible to Admin / Taquero) */}
          {(user?.role === 'admin' || user?.role === 'taquero' || !user) && (
            <motion.button
              onClick={toggleCorte}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))',
                border: '1px solid rgba(245,158,11,0.3)',
                color: '#F59E0B',
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title="Ver Corte de Turno y Ventas"
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Corte:</span>
              <span className="text-white font-black">
                ${summary.totalVentas.toLocaleString('es-MX')}
              </span>
            </motion.button>
          )}

          {/* Cart Button */}
          <motion.button
            onClick={toggleCart}
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-white font-semibold text-xs sm:text-sm transition-all"
            style={{
              background:
                count > 0
                  ? 'linear-gradient(135deg, rgba(249,115,22,0.25), rgba(239,68,68,0.2))'
                  : 'rgba(255,255,255,0.06)',
              border:
                count > 0
                  ? '1px solid rgba(249,115,22,0.4)'
                  : '1px solid rgba(255,255,255,0.1)',
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label={`Carrito: ${count} tacos`}
          >
            <ShoppingBag
              className="w-4 h-4"
              style={{ color: count > 0 ? '#F97316' : 'rgba(255,255,255,0.7)' }}
            />
            <span className={count > 0 ? 'text-orange-300 font-bold' : 'text-white/70'}>
              {count > 0 ? `${count}` : 'Carrito'}
            </span>

            {/* Animated badge count */}
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Auth / Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white text-xs font-bold cursor-pointer"
              >
                {/* User avatar or role icon */}
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-[11px] font-black uppercase">
                  {user.nombre.charAt(0)}
                </div>

                <div className="hidden sm:flex flex-col items-start leading-none text-left">
                  <span className="text-white text-xs font-bold truncate max-w-[100px]">
                    {user.nombre.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-orange-400/90 font-medium">
                    {user.role}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-white/40" />
              </button>
            ) : (
              <motion.button
                onClick={openAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #F97316, #EF4444)',
                  boxShadow: '0 4px 15px rgba(249,115,22,0.3)',
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </motion.button>
            )}

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#17120E] border border-white/10 shadow-2xl p-2 z-50 divide-y divide-white/5"
                >
                  {/* User Profile Card */}
                  <div className="p-3">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-black uppercase">
                        {user.nombre.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-white font-bold text-xs truncate">
                          {user.nombre}
                        </h4>
                        <p className="text-white/40 text-[11px] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${currentRoleInfo?.badgeClass}`}
                      >
                        {user.role === 'admin' && '👑 Rol: Administrador'}
                        {user.role === 'taquero' && '👨‍🍳 Rol: Taquero (Cocina)'}
                        {user.role === 'cliente' && '🌮 Rol: Cliente'}
                      </span>
                    </div>
                  </div>

                  {/* Actions by Role */}
                  <div className="py-1.5 space-y-1">
                    {(user.role === 'taquero' || user.role === 'admin') && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          openKitchenModal();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-orange-300 hover:bg-orange-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <ChefHat className="w-4 h-4 text-orange-400" />
                        <span>Pantalla Cocina KDS</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        openClientOrdersModal();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-white/80 hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Utensils className="w-4 h-4 text-white/60" />
                      <span>Mis Pedidos</span>
                    </button>

                    {(user.role === 'admin' || user.role === 'taquero') && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          toggleCorte();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 text-amber-400" />
                        <span>Corte de Turno</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Role Switcher for Testing */}
                  <div className="py-2 px-1">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider px-2 mb-1.5">
                      Cambiar Rol (Demostración)
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {(['admin', 'taquero', 'cliente'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            quickLoginAs(r);
                            setIsDropdownOpen(false);
                          }}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                            user.role === r
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className="pt-1.5">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
