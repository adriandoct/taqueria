'use client';

import { useState, useCallback, useRef } from 'react';
import { VoiceState } from '@/lib/types';

// ============================================================
// Full Web Speech API type declarations (not in TS lib by default)
// ============================================================
interface SpeechRecognitionResultEntry {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionResultEntry;
  [index: number]: SpeechRecognitionResultEntry;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Augment Window with webkit prefix
declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

// ============================================================

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
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

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

    if (!SpeechRecognitionAPI) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

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
      setVoiceState((current) => {
        if (current === 'listening') {
          return 'processing';
        }
        return current;
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, lang]);

  // Handle onResult separately via a ref to avoid stale closures
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // When state goes to 'processing', trigger the result callback
  const [prevVoiceState, setPrevVoiceState] = useState<VoiceState>('idle');
  if (voiceState === 'processing' && prevVoiceState === 'listening') {
    setPrevVoiceState('processing');
    const finalTranscript = transcriptRef.current;
    if (finalTranscript.trim() && onResultRef.current) {
      setTimeout(() => {
        onResultRef.current!(finalTranscript);
        setVoiceState('idle');
        setPrevVoiceState('idle');
      }, 400);
    } else {
      setVoiceState('idle');
      setPrevVoiceState('idle');
    }
  } else if (voiceState !== prevVoiceState && voiceState !== 'processing') {
    setPrevVoiceState(voiceState);
  }

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setVoiceState('idle');
    setPrevVoiceState('idle');
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
