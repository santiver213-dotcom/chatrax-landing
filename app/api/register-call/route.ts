import { NextResponse } from 'next/server';


export async function POST() {
  const apiKey = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: 'Faltan RETELL_API_KEY o RETELL_AGENT_ID en .env.local' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://api.retellai.com/v3/create-web-call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: agentId }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Error en la API de Retell' },
        { status: response.status }
      );
    }

    // v3 devuelve 4 campos que el cliente necesita
    return NextResponse.json({
      callId: data.call_id,
      accessToken: data.access_token,
      transport: data.transport,
      iceServers: data.ice_servers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}