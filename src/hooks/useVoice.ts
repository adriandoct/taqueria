'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceState } from '@/lib/types';

// ============================================================
// Full Web Speech API type declarations
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
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const transcriptRef = useRef(transcript);
  transcriptRef.current = transcript;

  const hasReportedResultRef = useRef(false);

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

    // Abort any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    hasReportedResultRef.current = false;

    recognition.onstart = () => {
      setVoiceState('listening');
      setError(null);
      setTranscript('');
      setInterimTranscript('');
    };

    // Fix for mobile: Rebuild the whole transcript from event.results
    // Mobile browsers often start resultIndex at 0, which caused duplicated string concatenations
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalAccumulated = '';
      let interimAccumulated = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalAccumulated += result[0].transcript + ' ';
        } else {
          interimAccumulated += result[0].transcript;
        }
      }

      setTranscript(finalAccumulated.trim());
      setInterimTranscript(interimAccumulated.trim());
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
    try {
      recognition.start();
    } catch {
      // Ignore if already started
    }
  }, [isSupported, lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }, []);

  // Process results cleanly via useEffect without double-firing
  useEffect(() => {
    if (voiceState === 'processing' && !hasReportedResultRef.current) {
      hasReportedResultRef.current = true;
      const textToProcess = transcriptRef.current.trim();

      if (textToProcess && onResultRef.current) {
        const timer = setTimeout(() => {
          onResultRef.current?.(textToProcess);
          setVoiceState('idle');
        }, 300);
        return () => clearTimeout(timer);
      } else {
        setVoiceState('idle');
      }
    }
  }, [voiceState]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setVoiceState('idle');
    setError(null);
    hasReportedResultRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
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
