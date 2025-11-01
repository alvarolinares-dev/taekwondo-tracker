import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// GET - Obtener todas las sesiones
export async function GET() {
  try {
    const sessions = await kv.get('taekwondo_sessions');
    return NextResponse.json(sessions || []);
  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    return NextResponse.json([], { status: 200 }); // Devuelve array vacío si no hay datos
  }
}

// POST - Guardar sesiones
export async function POST(request: Request) {
  try {
    const newSessions = await request.json();
    
    // Guarda en Vercel KV
    await kv.set('taekwondo_sessions', newSessions);
    
    return NextResponse.json({ status: 200, message: 'Sesiones guardadas correctamente' });
  } catch (error) {
    console.error('Error guardando sesiones:', error);
    return NextResponse.json({ error: 'Error guardando datos' }, { status: 500 });
  }
}