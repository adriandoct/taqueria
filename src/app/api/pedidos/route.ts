import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { CartItem } from '@/lib/types';

interface PedidoBody {
  cliente_nombre: string;
  detalles_orden: CartItem[];
  total: number;
  transcripcion_voz?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PedidoBody = await request.json();

    if (!body.cliente_nombre?.trim()) {
      return NextResponse.json({ error: 'Se requiere el nombre del cliente' }, { status: 400 });
    }

    if (!body.detalles_orden || body.detalles_orden.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // If Supabase is not configured, return a mock success
    if (!isSupabaseConfigured()) {
      const mockId = crypto.randomUUID();
      return NextResponse.json(
        { id: mockId, estado: 'pendiente', message: 'Pedido simulado (Supabase no configurado)' },
        { status: 201 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('pedidos')
      .insert([
        {
          cliente_nombre: body.cliente_nombre.trim(),
          detalles_orden: body.detalles_orden,
          total: body.total,
          estado: 'pendiente',
          transcripcion_voz: body.transcripcion_voz || null,
        },
      ])
      .select('id, estado')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
