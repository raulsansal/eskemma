// app/moddulo/components/ModduloChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage, PhaseId } from "@/types/moddulo.types";

interface ModduloChatProps {
  phaseId: PhaseId;
  projectId: string;
  initialMessages?: ChatMessage[];
  currentFormData?: Record<string, unknown>;
  onDataExtracted?: (data: Record<string, unknown>) => void;
  className?: string;
}

// Elimina bloques JSON completos e incompletos del texto visible
function filterJsonBlocks(text: string): string {
  // Bloques completos: ```json ... ```
  let filtered = text.replace(/```json[\s\S]*?```/g, "");
  // Bloque incompleto al final (Claude aún escribiendo el JSON)
  filtered = filtered.replace(/```json[\s\S]*$/, "");
  return filtered.trim();
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
              // Filtrar JSON en tiempo real para no mostrar bloques al usuario
              setStreamingContent(filterJsonBlocks(fullContent));
            } else if (parsed.type === "extracted-data" && parsed.extractedData) {
              lastReasoning = parsed.reasoning ?? undefined;
              onDataExtracted?.(parsed.extractedData);
            } else if (parsed.type === "done") {
              const assistantMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: filterJsonBlocks(fullContent),
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
      <div className="shrink-0 px-4 py-3 border-b border-gray-eske-20 flex items-center gap-2 bg-bluegreen-eske/5">
        <div className="w-2 h-2 rounded-full bg-bluegreen-eske animate-pulse" />
        <span className="text-sm font-semibold text-bluegreen-eske">Moddulo</span>
        <span className="text-xs text-gray-eske-60 ml-1">Colaborador Estratégico</span>
      </div>

      {/* Messages — scroll interno, sin empujar el layout */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming — solo el texto filtrado */}
        {streamingContent && (
          <ChatBubble
            message={{
              id: "streaming",
              role: "assistant",
              content: streamingContent,
              timestamp: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Indicador de carga */}
        {isLoading && !streamingContent && (
          <div className="flex gap-2 items-start">
            <ModduloAvatar />
            <div className="bg-gray-eske-10 rounded-xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-2 h-2 bg-gray-eske-40 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-eske-20 bg-white-eske">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu respuesta aquí..."
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none px-4 py-3 text-sm font-medium border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-bluegreen-eske/30 focus:border-bluegreen-eske disabled:opacity-50 text-gray-800 placeholder:text-gray-400 bg-gray-50 transition-colors"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-bluegreen-eske text-white-eske rounded-xl hover:bg-bluegreen-eske/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Enviar mensaje"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs font-medium text-gray-500 mt-2">
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs">Enter</kbd> para enviar
          {" · "}
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs">Shift+Enter</kbd> para nueva línea
        </p>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTES
// ==========================================

function ModduloAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-bluegreen-eske flex items-center justify-center shrink-0 mt-0.5">
      <span className="text-white-eske text-xs font-bold">M</span>
    </div>
  );
}

function ChatBubble({ message, isStreaming = false }: { message: ChatMessage; isStreaming?: boolean }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const isAssistant = message.role === "assistant";

  if (isAssistant) {
    return (
      <div className="flex gap-3 items-start">
        <ModduloAvatar />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-800 leading-relaxed">
            <MarkdownContent content={message.content} />
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-bluegreen-eske ml-0.5 animate-pulse rounded-sm align-middle" />
            )}
          </div>

          {/* Trazabilidad */}
          {message.reasoning && !isStreaming && (
            <div className="mt-1.5 ml-1">
              <button
                onClick={() => setReasoningOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-bluegreen-eske transition-colors"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${reasoningOpen ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Ver razonamiento
              </button>
              {reasoningOpen && (
                <div className="mt-1.5 px-3 py-2 bg-bluegreen-eske/5 border border-bluegreen-eske/20 rounded-lg text-xs font-medium text-gray-600 italic leading-relaxed">
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
        <div className="bg-bluegreen-eske text-white-eske rounded-2xl rounded-tr-none px-4 py-3 text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-gray-900 mt-3 mb-2 first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-gray-800 mt-3 mb-1.5 first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold text-gray-700 mt-2 mb-1 first:mt-0">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm text-gray-800 leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-gray-900">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-gray-700">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-gray-800">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-2 text-sm text-gray-800">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        hr: () => <hr className="border-gray-200 my-3" />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="text-xs border-collapse w-full">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 px-3 py-1.5 bg-gray-100 font-semibold text-gray-700 text-left">{children}</th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 px-3 py-1.5 text-gray-800">{children}</td>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-bluegreen-eske/40 pl-3 italic text-gray-600 my-2">{children}</blockquote>
        ),
        code: ({ children }) => (
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">{children}</code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// ==========================================
// MENSAJES DE BIENVENIDA POR FASE
// ==========================================

function getWelcomeMessage(phaseId: PhaseId): string {
  const welcomes: Record<PhaseId, string> = {
    proposito: "Bienvenido a la **Fase 1 — Propósito**. Aquí vamos a definir el ADN de tu proyecto mediante las variables XPCTO.\n\nEmpecemos por lo más importante: ¿cuál es el **Hito (X)** de este proyecto? Es decir, ¿qué resultado concreto, específico y medible buscas lograr?",
    exploracion: "Estamos en la **Fase 2 — Exploración**. Haremos un escaneo del entorno para entender el contexto.\n\n¿Cuál es el principal factor del entorno político que más podría impactar este proyecto en los próximos meses?",
    investigacion: "**Fase 3 — Investigación**. Es el momento de trabajar con los datos de campo.\n\n¿Cuáles son los principales hallazgos de la investigación que ya tienes disponible?",
    diagnostico: "Estamos en la **Fase 4 — Diagnóstico**. Transformamos la inteligencia en un dictamen de viabilidad.\n\n¿Cómo caracterizarías el entorno actual del proyecto: de **Continuidad**, **Ruptura**, **Terciopelo** o **Caos**?",
    estrategia: "**Fase 5 — Diseño Estratégico**. La inteligencia se convierte en narrativa.\n\n¿Cuál es la propuesta de valor única que diferencia a este proyecto de sus competidores?",
    tactica: "**Fase 6 — Diseño Táctico**. La estrategia se convierte en planes de acción concretos.\n\n¿Cuál frente debe recibir la mayor atención: **Aire** (medios), **Tierra** (territorial) o **Agua** (digital)?",
    gerencia: "**Fase 7 — Gerencia**. El War Room está activado.\n\n¿Cuál es el estado actual del proyecto? ¿Estamos en ruta, con retrasos o enfrentando alguna crisis?",
    seguimiento: "**Fase 8 — Seguimiento**. Es momento de revisar la ruta crítica y los indicadores.\n\n¿Cuáles son los KPIs que estás midiendo actualmente?",
    evaluacion: "**Fase 9 — Evaluación**. Cerramos el ciclo y construimos legado.\n\n¿El proyecto logró el **Hito (X)** que se planteó en la Fase 1? Cuéntame con franqueza.",
  };
  return welcomes[phaseId];
}
