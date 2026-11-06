'use client';

import { useState, useEffect, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

export default function RetellVoiceCall() {
  const clientRef = useRef<RetellWebClient | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState<string>('idle');

  useEffect(() => {
    // El cliente se crea solo en el navegador (evita ejecutarlo durante SSR)
    const client = new RetellWebClient();
    clientRef.current = client;

    client.on('call_started', () => {
      setIsCalling(true);
      setStatus('Llamada en curso...');
    });

    client.on('call_ended', () => {
      setIsCalling(false);
      setStatus('Llamada finalizada');
    });

    client.on('error', (err) => {
      console.error('❌ Error en el cliente de voz:', err);
      setIsCalling(false);
      setStatus('Error al conectar');
      client.stopCall();
    });

    return () => {
      // Quita listeners para que React StrictMode no los duplique
      client.removeAllListeners();
      client.stopCall();
    };
  }, []);

  const toggleCall = async () => {
    const client = clientRef.current;
    if (!client) return;

    if (isCalling) {
      client.stopCall();
      setIsCalling(false);
      setStatus('idle');
      return;
    }

    try {
      setStatus('Solicitando token...');

      const res = await fetch('/api/register-call', {
        method: 'POST',
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok || !data.accessToken) {
        throw new Error(data.error || 'No se obtuvo el accessToken');
      }

      setStatus('Conectando audio...');

      // Importante: pasar los 4 campos que devuelve v3
      await client.startCall({
        callId: data.callId,
        accessToken: data.accessToken,
        transport: data.transport,
        iceServers: data.iceServers,
      });
    } catch (err: any) {
      console.error('Fallo al iniciar la llamada:', err?.message || err);
      setStatus('Error al conectar');
      setIsCalling(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 border border-neutral-800 rounded-2xl bg-neutral-900/80 backdrop-blur text-white shadow-xl max-w-sm w-full mx-auto">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded-full ${isCalling ? 'bg-emerald-500 animate-ping' : 'bg-neutral-500'}`} />
        <p className="text-sm font-medium text-neutral-300">
          {status === 'idle' ? 'Asistente de Voz Chatrax' : status}
        </p>
      </div>

      <button
        onClick={toggleCall}
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
          isCalling
            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/30'
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30'
        }`}
      >
        {isCalling ? 'Finalizar Llamada' : 'Probar Agente de Voz'}
      </button>
    </div>
  );
}