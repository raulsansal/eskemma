// app/moddulo/components/ModduloChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage, PhaseId } from "@/types/moddulo.types";

interface ModduloChatProps {
  phaseId: PhaseId;
  projectId: string;
  initialMessages?: ChatMessage[];
  currentFormData?: Record<string, unknown>;
  onDataExtracted?: (data: Record<string, unknown>) => void;
  className?: string;
}

export default function ModduloChat({
  phaseId,
  projectId,
  initialMessages = [],
  currentFormData,
  onDataExtracted,
  className = "",
}: ModduloChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: getWelcomeMessage(phaseId),
        timestamp: new Date().toISOString(),
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseId]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");

    try {
      const response = await fetch(`/api/moddulo/chat/${phaseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          projectId,
          phaseId,
          currentFormData,
          chatHistory: messages.filter((m) => m.id !== "welcome"),
        }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      if (!response.body) throw new Error("Sin body en la respuesta");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let lastReasoning: string | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (!data.trim()) continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.type === "text") {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            } else if (parsed.type === "extracted-data" && parsed.extractedData) {
              lastReasoning = parsed.reasoning ?? undefined;
              onDataExtracted?.(parsed.extractedData);
            } else if (parsed.type === "done") {
              const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: fullContent,
                timestamp: new Date().toISOString(),
                reasoning: lastReasoning,
              };
              setMessages((prev) => [...prev, assistantMessage]);
              setStreamingContent("");
            }
          } catch {
            // línea malformada, ignorar
          }
        }
      }
    } catch (error) {
      console.error("[ModduloChat] Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?",
          timestamp: new Date().toISOString(),
        },
      ]);
      setStreamingContent("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col bg-white-eske rounded-xl border border-gray-eske-20 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-eske-20 flex items-center gap-2 bg-bluegreen-eske/5">
        <div className="w-2 h-2 rounded-full bg-bluegreen-eske animate-pulse" />
        <span className="text-sm font-semibold text-bluegreen-eske">Moddulo</span>
        <span className="text-xs text-gray-eske-50 ml-1">Colaborador Estratégico</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-64">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {streamingContent && (
          <ChatBubble
            message={{ id: "streaming", role: "assistant", content: streamingContent, timestamp: new Date().toISOString() }}
            isStreaming
          />
        )}

        {isLoading && !streamingContent && (
          <div className="flex gap-2 items-start">
            <ModduloAvatar />
            <div className="bg-gray-eske-10 rounded-xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span key={delay} className="w-2 h-2 bg-gray-eske-40 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-eske-20">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu respuesta..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none px-3 py-2 text-sm border border-gray-eske-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-bluegreen-eske/30 focus:border-bluegreen-eske disabled:opacity-50 text-gray-eske-80 placeholder:text-gray-eske-40"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-bluegreen-eske text-white-eske rounded-lg hover:bg-bluegreen-eske/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Enviar mensaje"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-eske-40 mt-2">Enter para enviar · Shift+Enter para nueva línea</p>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTES
// ==========================================

function ModduloAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-bluegreen-eske flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-white-eske text-xs font-bold">M</span>
    </div>
  );
}

function ChatBubble({ message, isStreaming = false }: { message: ChatMessage; isStreaming?: boolean }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const isAssistant = message.role === "assistant";

  // Quitar bloques ```json del texto visible
  const displayContent = message.content.replace(/```json[\s\S]*?```/g, "").trim();

  if (isAssistant) {
    return (
      <div className="flex gap-2 items-start">
        <ModduloAvatar />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-eske-10 rounded-xl rounded-tl-none px-4 py-3 text-sm text-gray-eske-80 whitespace-pre-wrap break-words">
            {displayContent}
            {isStreaming && (
              <span className="inline-block w-1 h-4 bg-bluegreen-eske ml-0.5 animate-pulse rounded-sm" />
            )}
          </div>

          {/* Trazabilidad: ¿Por qué? */}
          {message.reasoning && !isStreaming && (
            <div className="mt-1 ml-1">
              <button
                onClick={() => setReasoningOpen((v) => !v)}
                className="flex items-center gap-1 text-xs text-gray-eske-40 hover:text-bluegreen-eske transition-colors"
              >
                <svg className={`w-3 h-3 transition-transform ${reasoningOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                ¿Por qué registré esto?
              </button>
              {reasoningOpen && (
                <div className="mt-1 px-3 py-2 bg-bluegreen-eske/5 border border-bluegreen-eske/15 rounded-lg text-xs text-gray-eske-60 italic leading-relaxed">
                  {message.reasoning}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start justify-end">
      <div className="max-w-[80%]">
        <div className="bg-bluegreen-eske/10 border border-bluegreen-eske/20 rounded-xl rounded-tr-none px-4 py-3 text-sm text-gray-eske-80 whitespace-pre-wrap break-words">
          {displayContent}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MENSAJES DE BIENVENIDA POR FASE
// ==========================================

function getWelcomeMessage(phaseId: PhaseId): string {
  const welcomes: Record<PhaseId, string> = {
    proposito: "Bienvenido a la Fase 1. Aquí vamos a definir el ADN de tu proyecto mediante las variables XPCTO.\n\nEmpecemos por lo más importante: ¿cuál es el HITO de este proyecto? Es decir, ¿qué resultado concreto, específico y medible buscas lograr?",
    exploracion: "Estamos en la Fase 2 — Exploración. Haremos un escaneo del entorno para entender el contexto.\n\n¿Cuál es el principal factor del entorno político que más podría impactar este proyecto en los próximos meses?",
    investigacion: "Fase 3 — Investigación. Es el momento de trabajar con los datos de campo.\n\n¿Cuáles son los principales hallazgos de la investigación que ya tienes disponible?",
    diagnostico: "Estamos en la Fase 4 — Diagnóstico. Transformamos la inteligencia en un dictamen de viabilidad.\n\n¿Cómo caracterizarías el entorno actual del proyecto: de Continuidad, Ruptura, Terciopelo o Caos?",
    estrategia: "Fase 5 — Diseño Estratégico. La inteligencia se convierte en narrativa.\n\n¿Cuál es la propuesta de valor única que diferencia a este proyecto de sus competidores?",
    tactica: "Fase 6 — Diseño Táctico. La estrategia se convierte en planes de acción concretos.\n\n¿Cuál frente debe recibir la mayor atención: Aire (medios), Tierra (territorial) o Agua (digital)?",
    gerencia: "Fase 7 — Gerencia. El War Room está activado.\n\n¿Cuál es el estado actual del proyecto? ¿Estamos en ruta, con retrasos o enfrentando alguna crisis?",
    seguimiento: "Fase 8 — Seguimiento. Es momento de revisar la ruta crítica y los indicadores.\n\n¿Cuáles son los KPIs que estás midiendo actualmente?",
    evaluacion: "Fase 9 — Evaluación. Cerramos el ciclo y construimos legado.\n\n¿El proyecto logró el Hito (X) que se planteó en la Fase 1? Cuéntame con franqueza.",
  };
  return welcomes[phaseId];
}
