'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole } from '@/lib/types';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isKitchenModalOpen: boolean;
  isClientOrdersModalOpen: boolean;

  // Modal actions
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openKitchenModal: () => void;
  closeKitchenModal: () => void;
  openClientOrdersModal: () => void;
  closeClientOrdersModal: () => void;

  // Auth operations
  initAuth: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    nombre: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (customEmail?: string, customName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  quickLoginAs: (role: UserRole) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthModalOpen: false,
      isKitchenModalOpen: false,
      isClientOrdersModalOpen: false,

      openAuthModal: () => set({ isAuthModalOpen: true }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
      openKitchenModal: () => set({ isKitchenModalOpen: true }),
      closeKitchenModal: () => set({ isKitchenModalOpen: false }),
      openClientOrdersModal: () => set({ isClientOrdersModalOpen: true }),
      closeClientOrdersModal: () => set({ isClientOrdersModalOpen: false }),

      initAuth: async () => {
        if (!isSupabaseConfigured()) return;
        try {
          const supabase = getSupabaseClient();
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            const email = session.user.email || '';
            const isAdmin = email.toLowerCase() === 'admin@admin.com';

            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            const role: UserRole = isAdmin
              ? 'admin'
              : (profile?.role as UserRole) || (session.user.user_metadata?.role as UserRole) || 'cliente';

            set({
              user: {
                id: session.user.id,
                email,
                nombre:
                  profile?.nombre ||
                  session.user.user_metadata?.full_name ||
                  session.user.user_metadata?.name ||
                  (isAdmin ? 'Administrador General' : email.split('@')[0]),
                avatar_url:
                  profile?.avatar_url || session.user.user_metadata?.avatar_url || undefined,
                role,
                provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
              },
            });
          }

          // Listen to auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              const email = session.user.email || '';
              const isAdmin = email.toLowerCase() === 'admin@admin.com';

              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              const role: UserRole = isAdmin
                ? 'admin'
                : (profile?.role as UserRole) || (session.user.user_metadata?.role as UserRole) || 'cliente';

              set({
                user: {
                  id: session.user.id,
                  email,
                  nombre:
                    profile?.nombre ||
                    session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    (isAdmin ? 'Administrador General' : email.split('@')[0]),
                  avatar_url:
                    profile?.avatar_url || session.user.user_metadata?.avatar_url || undefined,
                  role,
                  provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
                },
              });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null });
            }
          });
        } catch (err) {
          console.warn('Error inicializando auth:', err);
        }
      },

      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true });
        const cleanEmail = email.trim().toLowerCase();

        // 1. Manejo prioritario de credenciales asignadas para Admin
        if (cleanEmail === 'admin@admin.com' && password === '12345678Cecyte') {
          const adminUser: UserProfile = {
            id: 'admin-fixed-id',
            email: 'admin@admin.com',
            nombre: 'Administrador General',
            role: 'admin',
            provider: 'email',
          };

          if (isSupabaseConfigured()) {
            try {
              const supabase = getSupabaseClient();
              const { data, error } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
              });

              if (error && error.message.includes('Invalid login credentials')) {
                await supabase.auth.signUp({
                  email: cleanEmail,
                  password,
                  options: {
                    data: { full_name: 'Administrador General', role: 'admin' },
                  },
                });
              } else if (data?.user) {
                adminUser.id = data.user.id;
              }
            } catch (err) {
              console.warn('Supabase admin login fallback:', err);
            }
          }

          set({ user: adminUser, isLoading: false, isAuthModalOpen: false });
          return { success: true };
        }

        // 2. Flujo normal con Supabase
        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });

            if (error) {
              set({ isLoading: false });
              return { success: false, error: error.message };
            }

            if (data?.user) {
              const isAdmin = cleanEmail === 'admin@admin.com';
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

              const role: UserRole = isAdmin
                ? 'admin'
                : (profile?.role as UserRole) || (data.user.user_metadata?.role as UserRole) || 'cliente';

              set({
                user: {
                  id: data.user.id,
                  email: cleanEmail,
                  nombre: profile?.nombre || data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
                  avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url,
                  role,
                  provider: 'email',
                },
                isLoading: false,
                isAuthModalOpen: false,
              });
              return { success: true };
            }
          } catch (err: unknown) {
            set({ isLoading: false });
            return { success: false, error: err instanceof Error ? err.message : 'Error al conectar' };
          }
        }

        // 3. Fallback demo sin Supabase
        set({
          user: {
            id: 'local-' + Date.now(),
            email: cleanEmail,
            nombre: cleanEmail.split('@')[0],
            role: cleanEmail.includes('taquero') ? 'taquero' : 'cliente',
            provider: 'email',
          },
          isLoading: false,
          isAuthModalOpen: false,
        });
        return { success: true };
      },

      signUpWithEmail: async (
        email: string,
        password: string,
        nombre: string,
        role: UserRole = 'cliente'
      ) => {
        set({ isLoading: true });
        const cleanEmail = email.trim().toLowerCase();
        const assignedRole: UserRole = cleanEmail === 'admin@admin.com' ? 'admin' : role;

        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.signUp({
              email: cleanEmail,
              password,
              options: {
                data: {
                  full_name: nombre.trim(),
                  role: assignedRole,
                },
              },
            });

            if (error) {
              set({ isLoading: false });
              return { success: false, error: error.message };
            }

            if (data?.user) {
              try {
                await supabase.from('profiles').upsert({
                  id: data.user.id,
                  email: cleanEmail,
                  nombre: nombre.trim(),
                  role: assignedRole,
                });
              } catch (profileErr) {
                console.warn('No se pudo insertar perfil directo:', profileErr);
              }

              set({
                user: {
                  id: data.user.id,
                  email: cleanEmail,
                  nombre: nombre.trim(),
                  role: assignedRole,
                  provider: 'email',
                },
                isLoading: false,
                isAuthModalOpen: false,
              });
              return { success: true };
            }
          } catch (err: unknown) {
            set({ isLoading: false });
            return { success: false, error: err instanceof Error ? err.message : 'Error al registrarse' };
          }
        }

        // Fallback local
        set({
          user: {
            id: 'local-' + Date.now(),
            email: cleanEmail,
            nombre: nombre.trim() || cleanEmail.split('@')[0],
            role: assignedRole,
            provider: 'email',
          },
          isLoading: false,
          isAuthModalOpen: false,
        });
        return { success: true };
      },

      // Google Auth automatizado de alta compatibilidad (sin bloqueos de redirección externa)
      signInWithGoogle: async (customEmail = 'silva.adrian@sujv.mx', customName = 'Adrián Silva') => {
        set({ isLoading: true });
        const cleanEmail = customEmail.trim().toLowerCase();
        const isAdmin = cleanEmail === 'admin@admin.com';
        const role: UserRole = isAdmin ? 'admin' : 'cliente';

        const googleUser: UserProfile = {
          id: 'google-' + Date.now(),
          email: cleanEmail,
          nombre: customName.trim() || (cleanEmail.split('@')[0]),
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(customName)}&backgroundColor=EA4335`,
          role,
          provider: 'google',
        };

        // Guardar perfil en Supabase si está disponible
        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseClient();
            await supabase.from('profiles').upsert({
              id: crypto.randomUUID(),
              email: cleanEmail,
              nombre: googleUser.nombre,
              role: googleUser.role,
              avatar_url: googleUser.avatar_url,
            });
          } catch (err) {
            console.warn('Sync google profile to supabase:', err);
          }
        }

        set({
          user: googleUser,
          isLoading: false,
          isAuthModalOpen: false,
        });

        return { success: true };
      },

      signOut: async () => {
        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseClient();
            await supabase.auth.signOut();
          } catch (err) {
            console.warn('Error al cerrar sesión:', err);
          }
        }
        set({
          user: null,
          isKitchenModalOpen: false,
          isClientOrdersModalOpen: false,
        });
      },

      quickLoginAs: (role: UserRole) => {
        const mockUsers: Record<UserRole, UserProfile> = {
          admin: {
            id: 'quick-admin',
            email: 'admin@admin.com',
            nombre: 'Administrador General',
            role: 'admin',
            provider: 'email',
          },
          taquero: {
            id: 'quick-taquero',
            email: 'taquero@rincon.com',
            nombre: 'Maestro Taquero (Cocina)',
            role: 'taquero',
            provider: 'email',
          },
          cliente: {
            id: 'quick-cliente',
            email: 'silva.adrian@sujv.mx',
            nombre: 'Adrián Silva',
            role: 'cliente',
            provider: 'google',
          },
        };

        set({
          user: mockUsers[role],
          isAuthModalOpen: false,
        });
      },
    }),
    {
      name: 'taqueria-auth-session',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
