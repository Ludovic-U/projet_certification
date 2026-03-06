"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/ui";
import { ChatInput, type Message } from "@/components/ChatInput";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";
import { useLocalStorage } from "@/context/LocalStorageContext";
import api_backend from "@/api/axiosInstance";
import axios from "axios";
import StrategicAnalysisTab from "./tabs/StrategicAnalysisTab";
import IdeaProject from "./tabs/IdeaProject";

type TabKey = "analyse" | "idee-projet";

const getTabFromSearchParam = (tabParam: string | null): TabKey => {
  return tabParam === "idee-projet" ? "idee-projet" : "analyse";
};

export default function IdeationPage() {
  const { data } = useLocalStorage();
  const { config } =  useConfig();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromSearchParam(searchParams.get("tab")));
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const clientId = Array.isArray(params.clientId)
    ? params.clientId[0]
    : params.clientId;

  React.useEffect(() => {
    setActiveTab(getTabFromSearchParam(searchParams.get("tab")));
  }, [searchParams]);

  React.useEffect(() => {
    if (!projectId) {
      return;
    }

    const loadChatHistory = async () => {
      try {
        const response = await api_backend.get(`/ideation-chatbot/project/${projectId}`);
        const responseData = response.data as { lastMessages?: string | null };

        if (!responseData.lastMessages) {
          setChatHistory([]);
          return;
        }

        const parsedMessages = JSON.parse(responseData.lastMessages) as Array<{
          role?: "user" | "assistant";
          content?: string;
          timestamp?: string;
        }>;

        if (!Array.isArray(parsedMessages)) {
          setChatHistory([]);
          return;
        }

        const normalizedHistory: Message[] = parsedMessages
          .filter((message) => message && typeof message.content === "string" && message.content.trim().length > 0)
          .map((message, index) => ({
            id: `${index}-${message.timestamp ?? Date.now()}`,
            role: message.role === "assistant" ? "assistant" : "user",
            content: message.content!.trim(),
            timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
          }));

        setChatHistory(normalizedHistory);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setChatHistory([]);
          return;
        }

        console.error("Error loading ideation chat history:", error);
      }
    };

    void loadChatHistory();
  }, [projectId]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams.toString());

    if (tab === "analyse") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }

    const query = nextParams.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  };

  const handleSendMessage = async (message: string): Promise<string | undefined> => {
    setIsLoading(true);
    try {
      const response = await api_backend.post(
        `/ideation-chatbot/project/${projectId}/chat`,
        {
          message,
          clientId,
        }
      );

      const responseData = response.data as { response?: string };
      const assistantText = responseData.response?.trim();
      
      // If the AI response should be spoken aloud, call the TTS function
      if (assistantText && window.__handleTextToSpeech) {
        window.__handleTextToSpeech(assistantText);
      }
      
      // Handle the response data as needed
      console.log("AI Response:", responseData);
      return assistantText;
    } catch (error) {
      console.error("Error sending message:", error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  if (!projectId || !clientId) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="relative overflow-hidden flex items-center justify-between gap-4 rounded-xl mb-6">
        <div className="relative z-10 flex-1">
          <PageHeader
            title={"Projet " + (data?.projectName ?? "") + " - IDEATION"}
            description={config?.subtitles.overview}
            helpKey="ideation"
          />
        </div>
      </div>
      <section className="w-full mb-6">
        <div className="grid w-full grid-cols-2 overflow-hidden rounded-xl border border-dark/10 bg-white">
          <button
            type="button"
            className={`px-6 py-2 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === "analyse"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => handleTabChange("analyse")}
          >
            Analyse strategique
          </button>
          <button
            type="button"
            className={`px-6 py-2 text-left text-sm font-semibold uppercase tracking-wide border-r border-dark/10 ${
              activeTab === "idee-projet"
                ? "text-white bg-dark"
                : "text-dark hover:bg-dark/5"
            }`}
            onClick={() => handleTabChange("idee-projet")}
          >
            Idée Projet
          </button>
          
        </div>
      </section>
      {activeTab === "analyse" && (
        <StrategicAnalysisTab clientId={clientId} projectId={projectId} />
      )}
      {activeTab === "idee-projet" && (
        <IdeaProject clientId={clientId} projectId={projectId} />
      )}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        initialHistory={chatHistory}
        isLoading={isLoading}
      />
    </div>
  );
}
