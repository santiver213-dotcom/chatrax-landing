'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValue, type MotionValue } from 'framer-motion';
import { RetellWebClient } from 'retell-client-js-sdk';

/**
 * Fases de la conversación:
 *
 *   idle → connecting → listening ⇄ speaking → ended → idle
 *                    ↘ error
 *
 * El Hero traduce estas fases a los estados visuales del personaje.
 */
export type VoicePhase = 'idle' | 'connecting' | 'listening' | 'speaking' | 'ended' | 'error';

const MSG = {
  micBlocked: 'Necesito tu micrófono para hablar contigo. Actívalo desde el candado de la barra de direcciones y vuelve a intentarlo.',
  micMissing: 'No encuentro ningún micrófono en este dispositivo. Conecta uno y vuelve a intentarlo.',
  generic: 'No pude conectarme. Revisa tu micrófono y tu conexión, e inténtalo de nuevo.',
} as const;

/** Segundos que el mensaje de despedida se queda en pantalla antes de volver al reposo. */
const ENDED_RESET_MS = 7000;

/** Pide el micrófono antes de llamar a Retell para poder dar un mensaje de error claro. */
async function checkMicrophone(): Promise<string | null> {
  if (!navigator.mediaDevices?.getUserMedia) return MSG.generic;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop()); // Retell abre su propio stream
    return null;
  } catch (err) {
    const name = err instanceof DOMException ? err.name : '';
    if (name === 'NotAllowedError' || name === 'SecurityError') return MSG.micBlocked;
    if (name === 'NotFoundError' || name === 'OverconstrainedError') return MSG.micMissing;
    return MSG.generic;
  }
}

interface UseNundiVoiceOptions {
  /** Ruta de tu backend que crea la llamada (la misma que ya usas). */
  endpoint?: string;
}

/**
 * Conecta la llamada web de Retell con la interfaz de Nundi.
 *
 * - `phase` indica en qué punto está la conversación.
 * - `amplitude` (MotionValue, 0–1) es el volumen real de la voz de la IA; se actualiza a
 *   la velocidad del audio sin provocar renders de React.
 */
export function useNundiVoice({ endpoint = '/api/register-call' }: UseNundiVoiceOptions = {}) {
  const clientRef = useRef<RetellWebClient | null>(null);
  const attemptRef = useRef(0); // invalida intentos de conexión cancelados por el usuario
  const busyRef = useRef(false);
  const amplitude = useMotionValue(0);

  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const isLive = phase === 'listening' || phase === 'speaking';
  const isActive = phase === 'connecting' || isLive;

  // Cliente de Retell y eventos del SDK
  useEffect(() => {
    const client = new RetellWebClient();
    clientRef.current = client;

    client.on('call_started', () => {
      busyRef.current = false;
      setErrorMessage(null);
      setMuted(false);
      setPhase('listening');
    });

    client.on('agent_start_talking', () =>
      setPhase((p) => (p === 'listening' || p === 'connecting' ? 'speaking' : p)),
    );
    client.on('agent_stop_talking', () => {
      amplitude.set(0);
      setPhase((p) => (p === 'speaking' ? 'listening' : p));
    });

    // Muestras de audio de la IA (requiere emitRawAudioSamples). Se convierten a volumen (RMS).
    client.on('audio', (samples: Float32Array) => {
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
      amplitude.set(Math.min(1, Math.sqrt(sum / samples.length) * 5.5));
    });

    client.on('call_ended', () => {
      busyRef.current = false;
      amplitude.set(0);
      setMuted(false);
      // Si la llamada terminó por un error, se conserva ese estado
      setPhase((p) => (p === 'error' ? p : 'ended'));
    });

    // Ojo: el SDK emite aquí un texto (p. ej. "Error starting call"), no un Error.
    client.on('error', (err: unknown) => {
      console.error('❌ Nundi / Retell:', err);
      busyRef.current = false;
      amplitude.set(0);
      setErrorMessage(MSG.generic);
      setPhase('error');
      client.stopCall();
    });

    return () => {
      attemptRef.current += 1;
      client.removeAllListeners();
      client.stopCall();
      clientRef.current = null;
    };
  }, [amplitude]);

  // Cronómetro de la llamada
  useEffect(() => {
    if (!isLive) return;
    const startedAt = Date.now();
    const id = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [isLive]);

  // Tras la despedida, Nundi vuelve al reposo
  useEffect(() => {
    if (phase !== 'ended') return;
    const id = window.setTimeout(() => setPhase('idle'), ENDED_RESET_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  const start = useCallback(async () => {
    const client = clientRef.current;
    if (!client || busyRef.current) return;

    busyRef.current = true;
    const attempt = ++attemptRef.current;
    const cancelled = () => attempt !== attemptRef.current;

    setErrorMessage(null);
    setSeconds(0);
    setMuted(false);
    setPhase('connecting');

    const micProblem = await checkMicrophone();
    if (cancelled()) return;
    if (micProblem) {
      busyRef.current = false;
      setErrorMessage(micProblem);
      setPhase('error');
      return;
    }

    try {
      const res = await fetch(endpoint, { method: 'POST', cache: 'no-store' });
      const data = await res.json();
      if (cancelled()) return;
      if (!res.ok || !data.accessToken) throw new Error(data.error || 'No se obtuvo el accessToken');

      // Si falla la conexión, el SDK lo avisa por el evento 'error'
      await client.startCall({
        callId: data.callId,
        accessToken: data.accessToken,
        transport: data.transport,
        iceServers: data.iceServers,
        emitRawAudioSamples: true, // activa el flujo de muestras de audio de la IA
      });
    } catch (err) {
      if (cancelled()) return;
      console.error('❌ Nundi no pudo iniciar la llamada:', err);
      busyRef.current = false;
      setErrorMessage(MSG.generic);
      setPhase('error');
    }
  }, [endpoint]);

  const stop = useCallback(() => {
    attemptRef.current += 1; // si aún estaba conectando, descarta ese intento
    busyRef.current = false;
    clientRef.current?.stopCall();
    amplitude.set(0);
    setMuted(false);
    setPhase((p) => (p === 'listening' || p === 'speaking' ? 'ended' : 'idle'));
  }, [amplitude]);

  const toggle = useCallback(() => {
    if (isActive) stop();
    else void start();
  }, [isActive, start, stop]);

  const toggleMute = useCallback(() => {
    const client = clientRef.current;
    if (!client || !isLive) return;
    if (muted) client.unmute();
    else client.mute();
    setMuted(!muted);
  }, [isLive, muted]);

  return {
    phase,
    errorMessage,
    isActive,
    isLive,
    muted,
    seconds,
    /** Volumen de la voz de la IA (0–1) como MotionValue. */
    amplitude: amplitude as MotionValue<number>,
    start,
    stop,
    toggle,
    toggleMute,
  };
}
