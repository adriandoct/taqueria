'use client';

import { useState, useCallback, useRef } from 'react';
import { VoiceState } from '@/lib/types';

// Type augmentation for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseVoiceOptions {
  onResult?: (transcript: string) => void;
  lang?: string;
}

interface UseVoiceReturn {
  voiceState: VoiceState;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoice({ onResult, lang = 'es-MX' }: UseVoiceOptions = {}): UseVoiceReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setVoiceState('listening');
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText);
      }
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const messages: Record<string, string> = {
        'not-allowed': 'Permiso de micrófono denegado. Habilítalo en la configuración del navegador.',
        'no-speech': 'No se detectó ningún sonido. Intenta de nuevo.',
        'network': 'Error de red. Verifica tu conexión.',
        'audio-capture': 'No se encontró micrófono.',
      };
      setError(messages[event.error] || `Error: ${event.error}`);
      setVoiceState('error');
    };

    recognition.onend = () => {
      if (voiceState === 'listening') {
        setVoiceState('processing');
        const finalTranscript = transcript;
        if (finalTranscript.trim() && onResult) {
          setTimeout(() => {
            onResult(finalTranscript);
            setVoiceState('idle');
          }, 500);
        } else {
          setVoiceState('idle');
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang, onResult, transcript, voiceState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setVoiceState('processing');
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setVoiceState('idle');
    setError(null);
  }, []);

  return {
    voiceState,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
