import { createClient } from 'redis';
import { NextResponse } from 'next/server';

// Crear cliente Redis
const getRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL
  });
  
  if (!client.isOpen) {
    await client.connect();
  }
  
  return client;
};

// GET - Obtener todas las sesiones
export async function GET() {
  let client;
  try {
    client = await getRedisClient();
    const sessions = await client.get('taekwondo_sessions');
    
    return NextResponse.json(sessions ? JSON.parse(sessions) : []);
  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    return NextResponse.json([], { status: 200 });
  } finally {
    if (client) {
      await client.quit();
    }
  }
}

// POST - Guardar sesiones
export async function POST(request: Request) {
  let client;
  try {
    const newSessions = await request.json();
    
    client = await getRedisClient();
    await client.set('taekwondo_sessions', JSON.stringify(newSessions));
    
    return NextResponse.json({ status: 200, message: 'Sesiones guardadas correctamente' });
  } catch (error) {
    console.error('Error guardando sesiones:', error);
    return NextResponse.json({ error: 'Error guardando datos' }, { status: 500 });
  } finally {
    if (client) {
      await client.quit();
    }
  }
}