"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/utils/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

interface VoiceSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
}

export function ChatInput({ onSendMessage, isLoading = false, className }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [history, setHistory] = useState<Message[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(true);
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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if SpeechRecognition is available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        console.warn("Speech Recognition API not supported in this browser");
        setSpeechSupported(false);
        return;
      }
      
      try {
        // Create new instance
        const recognition = new SpeechRecognitionAPI();
        
        // Configure recognition
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "fr-FR";
        recognition.maxAlternatives = 1;
        
        // Handle results - this is where voice gets converted to text
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let finalTranscript = "";
          let interimTranscript = "";
          
          // Process all results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Use final transcript if available, otherwise interim
          if (finalTranscript) {
            setInput((prev) => prev + finalTranscript);
          } else if (interimTranscript) {
            setInput(interimTranscript);
          }
        };
        
        // Handle end of recognition
        recognition.onend = () => {
          setIsListening(false);
        };
        
        // Handle errors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          
          switch (event.error) {
            case "not-allowed":
              setErrorMessage("Microphone non autorisé. Veuillez autoriser l'accès au microphone.");
              break;
            case "no-speech":
              setErrorMessage("Aucune parole détectée. Veuillez réessayer.");
              break;
            case "network":
              setErrorMessage("Erreur réseau. Vérifiez votre connexion Internet.");
              break;
            default:
              setErrorMessage("Erreur de reconnaissance vocale.");
          }
        };
        
        // Store reference
        recognitionRef.current = recognition;
        
      } catch (error) {
        console.error("Failed to initialize SpeechRecognition:", error);
        setSpeechSupported(false);
      }
    }
  }, []);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input.trim(),
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, newMessage]);
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (!speechSupported) {
      setErrorMessage("La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.");
      return;
    }
    
    if (recognitionRef.current) {
      try {
        if (isListening) {
          // Stop listening
          recognitionRef.current.stop();
          setIsListening(false);
        } else {
          // Start listening
          setErrorMessage(null);
          setInput(""); // Clear input to start fresh
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (error) {
        console.error("Error toggling speech recognition:", error);
        setIsListening(false);
        setErrorMessage("Erreur lors de la reconnaissance vocale.");
      }
    } else {
      setErrorMessage("La reconnaissance vocale n'est pas disponible.");
    }
  };

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

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white border-t border-dark/10", className)}>
      {/* Main Input Row */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-3">
          {/* Hamburger Menu Button (History) */}
          <button
            onClick={toggleHistory}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showHistory ? "bg-dark text-white" : "hover:bg-dark/5"
            )}
            aria-label={showHistory ? "Fermer l'historique de la conversation" : "Ouvrir l'historique de la conversation"}
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
              className="w-full resize-none rounded-lg border border-dark/10 p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-dark/20 min-h-[48px] max-h-[150px]"
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
          </div>

          {/* Text-to-Speech Button (Microphone) */}
          {speechSupported ? (
            <button
              onClick={toggleListening}
              className={cn(
                "p-3 rounded-lg transition-colors relative",
                isListening ? "bg-red-500 text-white animate-pulse" : "hover:bg-dark/5"
              )}
              aria-label={isListening ? "Arrêter l'écoute" : "Commencer la saisie vocale"}
            >
              {isListening ? (
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
            <div className="p-3" title="Reconnaissance vocale non supportée">
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
              "p-3 rounded-lg transition-colors",
              showSettings ? "bg-dark text-white" : "hover:bg-dark/5"
            )}
            aria-label={showSettings ? "Fermer les paramètres" : "Ouvrir les paramètres"}
            title="Paramètres vocaux"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Send Button */}
          <Button
            onClick={handleSend}
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

      {/* History Panel - appears below textarea when toggled */}
      {showHistory && (
        <div className="border-t border-dark/10 bg-light max-h-60 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg">Historique de la conversation</h3>
              <button 
                onClick={toggleHistory} 
                className="p-2 hover:bg-dark/5 rounded"
                aria-label="Fermer l'historique"
              >
                ✕
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-grey text-sm">Aucun historique de conversation.</p>
            ) : (
              <div className="space-y-2">
                {history.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => loadFromHistory(msg)}
                    className="p-3 bg-white rounded-lg cursor-pointer hover:bg-dark/5 transition-colors border border-dark/10"
                  >
                    <p className="text-sm font-medium">{msg.role === "user" ? "Vous" : "IA"}</p>
                    <p className="text-sm text-dark truncate">{msg.content}</p>
                    <p className="text-xs text-grey mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
