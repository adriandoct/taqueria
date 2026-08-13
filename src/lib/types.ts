// ============================================================
// Shared TypeScript Types
// ============================================================

export interface Taco {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  disponible: boolean;
  categoria: 'res' | 'cerdo' | 'mixto' | 'vegetariano';
}

export interface CartItem {
  taco: Taco;
  cantidad: number;
  especificaciones: string;
}

export interface Pedido {
  id?: string;
  cliente_nombre: string;
  detalles_orden: CartItem[];
  total: number;
  estado?: string;
  transcripcion_voz?: string;
  created_at?: string;
}

export interface ParsedOrderItem {
  nombreTaco: string;
  cantidad: number;
  especificaciones: string;
  confidence: number;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';
