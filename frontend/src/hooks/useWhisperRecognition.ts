"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { pipeline, env } from "@xenova/transformers";

// Configure environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(env as any).allowLocalModels = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(env as any).useBrowserCache = true;

// Model configuration - using tiny model for faster loading
const MODEL_ID = "Xenova/whisper-tiny";
const TASK = "automatic-speech-recognition";

export interface UseWhisperRecognitionProps {
  language?: string;
  onTranscript?: (text: string) => void;
}

export interface UseWhisperRecognitionReturn {
  isLoading: boolean;
  isListening: boolean;
  transcript: string;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  isSupported: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PipelineType = any;

export function useWhisperRecognition(
  props: UseWhisperRecognitionProps
): UseWhisperRecognitionReturn {
  const language = props.language || "french";
  const onTranscript = props.onTranscript;

  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognizerRef = useRef<PipelineType | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if browser supports getUserMedia
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        setError("Votre navigateur ne supporte pas l'enregistrement audio.");
      }
    }
  }, []);

  // Load Whisper model
  const loadModel = useCallback(async (): Promise<PipelineType | null> => {
    if (recognizerRef.current) {
      return recognizerRef.current;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading Whisper model...");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognizer = await pipeline(TASK, MODEL_ID) as any;
      recognizerRef.current = recognizer;
      console.log("Whisper model loaded successfully");
      return recognizer;
    } catch (err) {
      console.error("Failed to load Whisper model:", err);
      setError("Impossible de charger le modèle de reconnaissance vocale.");
      setIsSupported(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Convert audio blob to transcript using Whisper
  const processAudio = useCallback(
    async (audioBlob: Blob): Promise<void> => {
      const recognizer = await loadModel();
      if (!recognizer) {
        return;
      }

      try {
        // Convert blob to array buffer
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = new (window.AudioContext ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Convert AudioBuffer to Float32Array
        const channelData = audioBuffer.getChannelData(0);
        const samplingRate = audioBuffer.sampleRate;

        // Run transcription
        const result = await recognizer(channelData, {
          sampling_rate: samplingRate,
          language: language,
        });

        if (result.text) {
          const text = result.text.trim();
          setTranscript(text);
          if (onTranscript) {
            onTranscript(text);
          }
        }
      } catch (err) {
        console.error("Transcription error:", err);
        setError("Erreur lors de la transcription audio.");
      }
    },
    [language, loadModel, onTranscript]
  );

  // Start recording
  const startListening = useCallback(async (): Promise<void> => {
    setError(null);
    setTranscript("");

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Accès au microphone refusé. Veuillez autoriser l'accès.");
        } else if (err.name === "NotFoundError") {
          setError("Aucun microphone trouvé sur cet appareil.");
        } else {
          setError("Erreur lors de l'accès au microphone.");
        }
      }
      setIsListening(false);
    }
  }, [processAudio]);

  // Stop recording
  const stopListening = useCallback((): void => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      recognizerRef.current = null;
    };
  }, [stopListening]);

  return {
    isLoading,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported,
  };
}
