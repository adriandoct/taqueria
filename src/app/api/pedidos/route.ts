import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { CartItem, Pedido } from '@/lib/types';

interface PedidoBody {
  cliente_nombre: string;
  detalles_orden: CartItem[];
  total: number;
  transcripcion_voz?: string;
}

// In-memory persistent fallback store for orders across the shift (if Supabase is not configured)
const fallbackOrders: Pedido[] = [];

export async function POST(request: NextRequest) {
  try {
    const body: PedidoBody = await request.json();

    if (!body.cliente_nombre?.trim()) {
      return NextResponse.json({ error: 'Se requiere el nombre del cliente' }, { status: 400 });
    }

    if (!body.detalles_orden || body.detalles_orden.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const newOrder: Pedido = {
      id: crypto.randomUUID(),
      cliente_nombre: body.cliente_nombre.trim(),
      detalles_orden: body.detalles_orden,
      total: Number(body.total) || 0,
      estado: 'pendiente',
      transcripcion_voz: body.transcripcion_voz || null,
      created_at: new Date().toISOString(),
    };

    // If Supabase is not configured, save to in-memory store
    if (!isSupabaseConfigured()) {
      fallbackOrders.unshift(newOrder);
      return NextResponse.json(newOrder, { status: 201 });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('pedidos')
      .insert([
        {
          cliente_nombre: newOrder.cliente_nombre,
          detalles_orden: newOrder.detalles_orden,
          total: newOrder.total,
          estado: newOrder.estado,
          transcripcion_voz: newOrder.transcripcion_voz,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error on insert:', error);
      // Fallback to local memory on error
      fallbackOrders.unshift(newOrder);
      return NextResponse.json(newOrder, { status: 201 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API POST error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(fallbackOrders, { status: 200 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase error on fetch, returning fallback:', error);
      return NextResponse.json(fallbackOrders, { status: 200 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (error) {
    console.error('API GET error:', error);
    return NextResponse.json(fallbackOrders, { status: 200 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json({ error: 'Se requiere id y estado' }, { status: 400 });
    }

    // Update in-memory fallback
    const localOrder = fallbackOrders.find((o) => o.id === id);
    if (localOrder) {
      localOrder.estado = estado;
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('pedidos')
        .update({ estado })
        .eq('id', id);

      if (error) {
        console.error('Supabase error on update:', error);
      }
    }

    return NextResponse.json({ success: true, id, estado }, { status: 200 });
  } catch (error) {
    console.error('API PATCH error:', error);
    return NextResponse.json({ error: 'Error al actualizar pedido' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear in-memory shift
    fallbackOrders.length = 0;

    return NextResponse.json({ success: true, message: 'Turno reiniciado' }, { status: 200 });
  } catch (error) {
    console.error('API DELETE error:', error);
    return NextResponse.json({ error: 'Error al reiniciar turno' }, { status: 500 });
  }
}
