"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/utils/utils";
import { useWhisperRecognition } from "@/hooks/useWhisperRecognition";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => Promise<string | undefined>;
  initialHistory?: Message[];
  isLoading?: boolean;
  className?: string;
  lastAssistantMessage?: string | null;
  onFullScreenModeChange?: (isFullScreen: boolean) => void;
}

interface VoiceSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
}

export function ChatInput({ onSendMessage, initialHistory = [], isLoading = false, className, lastAssistantMessage = null, onFullScreenModeChange }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullScreenMode, setIsFullScreenMode] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);
  const [micDetected, setMicDetected] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voice: null,
    rate: 1,
    pitch: 1,
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Whisper recognition hook (used as fallback)
  const whisperRecognition = useWhisperRecognition({
    language: "fr",
    onTranscript: (text) => {
      setInput(text);
      setIsListening(false);
    },
  });

  // Load available voices
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!("speechSynthesis" in window)) {
        console.warn("Speech Synthesis API not supported in this browser");
        setTtsSupported(false);
        return;
      }
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        // Set default voice (preferably French)
        const frenchVoice = availableVoices.find((v) => v.lang.startsWith("fr"));
        setVoiceSettings((prev) => ({
          ...prev,
          voice: frenchVoice || availableVoices[0] || null,
        }));
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Hydrate chat history provided by the page (e.g. persisted DB conversation)
  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  // Notify parent when fullscreen mode changes
  useEffect(() => {
    onFullScreenModeChange?.(isFullScreenMode);
  }, [isFullScreenMode, onFullScreenModeChange]);

  // Initialize speech recognition - DISABLED for now, using Whisper only
  // Web Speech API can be re-enabled later
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if microphone is available/detected (works in all modern browsers)
      const checkMicrophone = async () => {
        try {
          // First try to enumerate devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasMicrophone = devices.some((device) => device.kind === "audioinput");
          
          if (!hasMicrophone) {
            console.warn("No microphone detected on this device (enumerateDevices)");
            setMicDetected(false);
            return;
          }
          
          // Also try to get user media to confirm microphone is actually accessible
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // If we get here, microphone is accessible - stop the stream
            stream.getTracks().forEach((track) => track.stop());
            setMicDetected(true);
          } catch {
            // Permission denied but microphone exists
            console.warn("Microphone permission denied but device exists");
            setMicDetected(true); // Still show the button, user can grant permission
          }
        } catch (error) {
          console.error("Error checking for microphone:", error);
          setMicDetected(false);
        }
      };
      
      checkMicrophone();
    }
  }, []);

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const content = input.trim();
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, newMessage]);
      setInput("");

      const assistantReply = await onSendMessage(content);
      if (assistantReply) {
        const assistantMessage: Message = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: assistantReply,
          timestamp: new Date(),
        };
        setHistory((prev) => [...prev, assistantMessage]);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const toggleListening = () => {
    // If Whisper is already listening, stop it
    if (whisperRecognition.isListening) {
      whisperRecognition.stopListening();
      return;
    }
    
    // For now, always use Whisper (disabled Web Speech API to fix issues)
    // TODO: Re-enable Web Speech API once issues are resolved
    if (micDetected !== false) {
      setErrorMessage(null);
      whisperRecognition.startListening();
    } else {
      setErrorMessage("Aucun microphone détecté sur cet appareil.");
    }
  };

  // Sync Whisper state with local state
  useEffect(() => {
    if (whisperRecognition.isListening) {
      setIsListening(true);
    }
    if (whisperRecognition.error) {
      setErrorMessage(whisperRecognition.error);
    }
  }, [whisperRecognition.isListening, whisperRecognition.error, whisperRecognition.isProcessing]);

  const handleTextToSpeech = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setTtsError("La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }
    
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      if (voiceSettings.voice) {
        utterance.voice = voiceSettings.voice;
      }
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.lang = "fr-FR"; // Set French as default
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        setTtsError(null);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error("TTS Error:", event);
        setIsSpeaking(false);
        setTtsError("Erreur lors de la synthèse vocale.");
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error with speech synthesis:", error);
      setTtsError("Erreur lors de la synthèse vocale.");
      setIsSpeaking(false);
    }
  };

  // Expose TTS function for external use (AI responses)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__handleTextToSpeech = handleTextToSpeech;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__handleTextToSpeech;
    };
  }, [isSpeaking, voiceSettings]);

  const loadFromHistory = (message: Message) => {
    setInput(message.content);
    setShowHistory(false);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) setShowSettings(false);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    if (!showSettings) setShowHistory(false);
  };

  // Lock page scroll while history overlay is open.
  useEffect(() => {
    if (!showHistory) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showHistory]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoice = voices.find((v) => v.name === e.target.value);
    setVoiceSettings((prev) => ({ ...prev, voice: selectedVoice || null }));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceSettings((prev) => ({ ...prev, rate: parseFloat(e.target.value) }));
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVoiceSettings((prev) => ({ ...prev, pitch: parseFloat(e.target.value) }));
  };

  const testVoice = () => {
    handleTextToSpeech("Ceci est un test de la synthèse vocale.");
  };

  // Fullscreen Chat Mode
  if (isFullScreenMode) {
    return (
      <div className="fixed inset-0 z-[1010] bg-gradient-to-br from-dark/5 to-light/50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {/* Last Assistant Message */}
          {lastAssistantMessage && (
            <div className="bg-white rounded-2xl border border-green-200 p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-sm font-bold uppercase tracking-wide text-green-700">
                  Assistant IA
                </p>
              </div>
              <p className="text-lg leading-relaxed text-dark">{lastAssistantMessage}</p>
            </div>
          )}

          {/* Input Section */}
          <div className="bg-white rounded-2xl border border-dark/10 p-6 shadow-xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez-moi vos questions..."
              className="w-full resize-none rounded-lg border border-dark/10 p-4 focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 text-base min-h-20"
              disabled={isLoading}
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => {
                  void handleSend();
                }}
                disabled={!input.trim() || isLoading}
                loading={isLoading}
                className="flex-1"
              >
                Envoyer
              </Button>
              <button
                onClick={() => setIsFullScreenMode(false)}
                className="px-4 py-2 rounded-lg border border-dark/10 hover:bg-dark/5 transition-colors text-sm font-medium"
                title="Réduire le chat"
              >
                ↙ Réduire
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-[1010] bg-white border-t border-dark/10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] rounded-t-2xl", className)}>
      {/* Main Input Row */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-3">
          {/* Hamburger Menu Button (History) */}
          <button
            onClick={toggleHistory}
            className={cn(
              "p-2.5 rounded-lg transition-colors border border-dark/10",
              showHistory ? "bg-dark text-white border-dark" : "hover:bg-dark/5 hover:border-dark/20"
            )}
            aria-label={showHistory ? "Fermer l'historique de la conversation" : "Ouvrir l'historique de la conversation"}
            title="Historique de la conversation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Posez-moi des questions sur votre projet..."
              className="w-full resize-none rounded-lg border border-dark/20 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-dark/30 focus:border-dark/30 h-12 overflow-y-auto bg-gray-50"
              rows={1}
              disabled={isLoading}
            />
            {/* Error Message */}
            {errorMessage && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-red-500 text-xs">
                {errorMessage}
              </div>
            )}
            {/* Listening Indicator */}
            {isListening && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-red-500 animate-pulse">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-xs font-medium">Écoute en cours...</span>
              </div>
            )}
            {/* Processing Indicator */}
            {whisperRecognition.isProcessing && !isListening && (
              <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-blue-500">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-xs font-medium">Traitement...</span>
              </div>
            )}
          </div>

          {/* Voice Input Button (Microphone) */}
          {micDetected !== false ? (
            <button
              onClick={toggleListening}
              disabled={whisperRecognition.isLoading}
              className={cn(
                "p-3 rounded-lg transition-colors relative border border-dark/10",
                isListening ? "bg-red-500 text-white border-red-500 animate-pulse" : "hover:bg-dark/5 hover:border-dark/20",
                whisperRecognition.isLoading && "opacity-50 cursor-not-allowed"
              )}
              aria-label={isListening ? "Arrêter l'écoute" : "Commencer la saisie vocale"}
              title={whisperRecognition.isLoading ? "Chargement du modèle..." : "Cliquer pour saisir la parole"}
            >
              {whisperRecognition.isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isListening ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          ) : (
            <div className="p-3" title="Aucun microphone détecté sur cet appareil">
              <svg className="w-5 h-5 text-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={toggleSettings}
            className={cn(
              "p-3 rounded-lg transition-colors border border-dark/10",
              showSettings ? "bg-dark text-white border-dark" : "hover:bg-dark/5 hover:border-dark/20"
            )}
            aria-label={showSettings ? "Fermer les paramètres" : "Ouvrir les paramètres"}
            title="Paramètres vocaux"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullScreenMode(true)}
            className="p-3 rounded-lg transition-colors border border-dark/10 hover:bg-dark/5 hover:border-dark/20"
            aria-label="Mode conversation agrandi"
            title="Agrandir la conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6v4m12 0h4V6m0 12h-4v4m-8 0h4v-4M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
            </svg>
          </button>

          {/* Send Button */}
          <Button
            onClick={() => {
              void handleSend();
            }}
            disabled={!input.trim() || isLoading}
            loading={isLoading}
          >
            Envoyer
          </Button>
        </div>
      </div>

      {/* Settings Panel - appears below textarea when toggled */}
      {showSettings && (
        <div className="border-t border-dark/10 bg-light max-h-60 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Paramètres vocaux</h3>
              <button 
                onClick={toggleSettings} 
                className="p-2 hover:bg-dark/5 rounded"
                aria-label="Fermer les paramètres"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Voix</label>
                <select
                  value={voiceSettings.voice?.name || ""}
                  onChange={handleVoiceChange}
                  className="w-full p-2 border border-dark/10 rounded-lg bg-white"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed/Rate Control */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Vitesse: {voiceSettings.rate}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={handleRateChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-grey">
                  <span>Lent</span>
                  <span>Normal</span>
                  <span>Rapide</span>
                </div>
              </div>

              {/* Pitch Control */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Hauteur: {voiceSettings.pitch}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={handlePitchChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-grey">
                  <span>Grave</span>
                  <span>Normal</span>
                  <span>Aigu</span>
                </div>
              </div>

              {/* Test Button */}
              {ttsSupported ? (
                <>
                  <Button onClick={testVoice} className="w-full bg-transparent border border-dark/10 hover:bg-dark/5">
                    Tester la voix
                  </Button>
                  {ttsError && (
                    <p className="text-red-500 text-sm mt-2">{ttsError}</p>
                  )}
                </>
              ) : (
                <p className="text-grey text-sm">La synthèse vocale n&apos;est pas supportée par votre navigateur.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Overlay - full screen above the input when toggled */}
      {showHistory && (
        <div className="fixed inset-0 z-[1000] bg-black/30 pointer-events-none">
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 h-full pb-28 pointer-events-auto">
              <div className="h-full rounded-xl border border-dark/10 bg-light shadow-xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-dark/10 bg-white sticky top-0 z-10">
                  <h3 className="font-semibold text-lg">Historique de la conversation</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setHistory([]);
                        setShowHistory(false);
                      }}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Effacer l'historique"
                    >
                      Effacer l'historique
                    </button>
                    <button
                      onClick={toggleHistory}
                      className="p-2 hover:bg-dark/5 rounded"
                      aria-label="Fermer l'historique"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                  {history.length === 0 ? (
                    <p className="text-grey text-sm">Aucun historique de conversation.</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((msg) => (
                        <div
                          key={msg.id}
                          onClick={() => loadFromHistory(msg)}
                          className="p-4 bg-white rounded-lg cursor-pointer hover:bg-dark/5 transition-colors border border-dark/10 hover:border-dark/30"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
                              msg.role === "user" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-green-100 text-green-700"
                            }`}>
                              {msg.role === "user" ? "Vous" : "IA"}
                            </span>
                            <span className="text-xs text-grey">
                              {msg.timestamp.toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-dark line-clamp-3">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
