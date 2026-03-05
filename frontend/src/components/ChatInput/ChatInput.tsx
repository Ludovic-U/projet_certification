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

export function ChatInput({ onSendMessage, isLoading = false, className }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transcript = Array.from(event.results as any[])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((result: any) => result[0].transcript)
            .join("");
          setInput(transcript);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
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
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const handleTextToSpeech = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
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
  }, [isSpeaking]);

  const loadFromHistory = (message: Message) => {
    setInput(message.content);
    setShowHistory(false);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 bg-white border-t border-dark/10", className)}>
      {/* Main Input Row */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-3">
          {/* Hamburger Menu Button */}
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
          </div>

          {/* Text-to-Speech Button (Microphone) */}
          <button
            onClick={toggleListening}
            className={cn(
              "p-3 rounded-lg transition-colors",
              isListening ? "bg-red-500 text-white" : "hover:bg-dark/5"
            )}
            aria-label={isListening ? "Arrêter l'écoute" : "Commencer la saisie vocale"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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
