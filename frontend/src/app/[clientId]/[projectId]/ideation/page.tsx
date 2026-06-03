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

const getLastAssistantMessage = (
  messages: Array<{ role?: "user" | "assistant"; content?: string }>
): string | null => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role === "assistant" && typeof message.content === "string" && message.content.trim()) {
      return message.content.trim();
    }
  }

  return null;
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
  const [responsesRefreshTrigger, setResponsesRefreshTrigger] = useState(0);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string | null>(null);
  const [nextPendingQuestion, setNextPendingQuestion] = useState<{ questionId: number; label: string } | null>(null);
  const [isFullScreenMode, setIsFullScreenMode] = useState(true);
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
        const response = await api_backend.get(
          `/ideation-chatbot/project/${projectId}?tab=${
            activeTab === "idee-projet" ? "idea-project" : "strategic-analysis"
          }`
        );
        const responseData = response.data as {
          lastMessages?: string | null;
          nextPendingQuestion?: { questionId: number; label: string } | null;
        };

        if (!responseData.lastMessages) {
          setChatHistory([]);
          setNextPendingQuestion(responseData.nextPendingQuestion || null);
          setLastAssistantMessage(responseData.nextPendingQuestion?.label ?? null);
          return;
        }

        const parsedMessages = JSON.parse(responseData.lastMessages) as Array<{
          role?: "user" | "assistant";
          content?: string;
          timestamp?: string;
        }>;

        if (!Array.isArray(parsedMessages)) {
          setChatHistory([]);
          setNextPendingQuestion(responseData.nextPendingQuestion || null);
          setLastAssistantMessage(responseData.nextPendingQuestion?.label ?? null);
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
        setNextPendingQuestion(responseData.nextPendingQuestion || null);
        setLastAssistantMessage(responseData.nextPendingQuestion?.label ?? getLastAssistantMessage(parsedMessages));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setChatHistory([]);
          setNextPendingQuestion(null);
          setLastAssistantMessage(null);
          return;
        }

        console.error("Error loading ideation chat history:", error);
      }
    };

    void loadChatHistory();
  }, [projectId, activeTab]);

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
          activeTab: activeTab === "idee-projet" ? "idea-project" : "strategic-analysis",
        }
      );

      const responseData = response.data as {
        response?: string;
        actionExecution?: {
          applied?: Array<{ type?: string }>;
        };
        nextPendingQuestion?: { questionId: number; label: string };
      };
      const assistantText = responseData.response?.trim();
      const nextQuestion = responseData.nextPendingQuestion || null;
      const displayText = nextQuestion?.label ?? "Toutes les questions ont été traitées. Vous pouvez maintenant cliquer sur l'onglet \"Idée Projet\" pour passer à l'étape suivante.";

      setLastAssistantMessage(displayText);
      setNextPendingQuestion(nextQuestion);

      const hasAppliedIdeationResponseAction = (responseData.actionExecution?.applied || []).some(
        (item) => item?.type === "GENERATE_NEW_IDEATION_RESPONSE"
      );

      if (hasAppliedIdeationResponseAction) {
        setResponsesRefreshTrigger((prev) => prev + 1);
      }
      
      // If the AI response should be spoken aloud, call the TTS function
      // if (assistantText && window.__handleTextToSpeech) {
      //   window.__handleTextToSpeech(assistantText);
      // }
      
      // Handle the response data as needed
      console.log("AI Response:", responseData);
      return displayText ?? undefined;
    } catch (error) {
      console.error("Error sending message:", error);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipQuestion = async () => {
    if (!nextPendingQuestion) {
      return;
    }

    try {
      await api_backend.post(
        `/ideation-chatbot/project/${projectId}/skip-question`,
        {
          questionId: nextPendingQuestion.questionId,
        }
      );

      // Rafraîchit les réponses pour mettre à jour l'interface
      setResponsesRefreshTrigger((prev) => prev + 1);

      // Recharge la prochaine question pour l'afficher
      const response = await api_backend.get(
        `/ideation-chatbot/project/${projectId}?tab=${
          activeTab === "idee-projet" ? "idea-project" : "strategic-analysis"
        }`
      );
      const responseData = response.data as {
        nextPendingQuestion?: { questionId: number; label: string } | null;
      };

      setNextPendingQuestion(responseData.nextPendingQuestion || null);
      setLastAssistantMessage(
        responseData.nextPendingQuestion?.label ?? "Toutes les questions ont été traitées. Vous pouvez maintenant cliquer sur l'onglet \"Idée Projet\" pour passer à l'étape suivante."
      );
    } catch (error) {
      console.error("Error skipping question:", error);
    }
  };

  if (!projectId || !clientId) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {!isFullScreenMode && (
        <>
          <div className="relative overflow-hidden flex items-center justify-between gap-4 rounded-xl mb-6">
            <div className="flex-1">
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
                Analyse de l'existant
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
            <StrategicAnalysisTab
              clientId={clientId}
              projectId={projectId}
              responsesRefreshTrigger={responsesRefreshTrigger}
            />
          )}
          {activeTab === "idee-projet" && (
            <IdeaProject
              clientId={clientId}
              projectId={projectId}
              responsesRefreshTrigger={responsesRefreshTrigger}
            />
          )}
          {lastAssistantMessage && (
            <div className="fixed bottom-24 left-0 right-0 z-30 pointer-events-auto">
              <div className="max-w-4xl mx-auto px-4">
                <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white px-5 py-4 text-sm text-dark shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-xs font-bold uppercase tracking-wide text-green-700">
                      Assistant IA
                    </p>
                  </div>
                  <p className="leading-relaxed">{lastAssistantMessage}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={handleSkipQuestion}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Passer la question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <ChatInput 
        onSendMessage={handleSendMessage} 
        initialHistory={chatHistory}
        isLoading={isLoading}
        lastAssistantMessage={lastAssistantMessage}
        onFullScreenModeChange={setIsFullScreenMode}
      />
    </div>
  );
}
