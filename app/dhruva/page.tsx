"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import DhruvaImage from "@/components/DhruvaImage";
import { useRouter } from "next/navigation";

const FormattedMessage = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="mb-2 dark:text-zinc-100 text-zinc-700">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold dark:text-zinc-50 text-zinc-900">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic dark:text-zinc-100 text-zinc-700">
            {children}
          </em>
        ),
        ul: ({ children }) => (
          <ul className="list-disc ml-4 mb-2 dark:text-zinc-100 text-zinc-700">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-4 mb-2 dark:text-zinc-100 text-zinc-700">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ children }) => (
          <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm dark:text-zinc-100 text-zinc-700">
            {children}
          </code>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

const DisasterGuardChat = () => {
  interface Message {
    type: "bot" | "user";
    content: string;
  }

  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHeight, setChatHeight] = useState("100vh");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        type: "bot",
        content:
          "Welcome to DisasterGuard AI! I'm here to provide expert guidance on disaster preparedness, response, and recovery. How can I assist you today?",
      },
    ]);

    const calculateHeight = () => {
      const vh = window.innerHeight;
      const headerHeight = 56;
      const safeArea = 20;
      setChatHeight(`${vh - headerHeight - safeArea}px`);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: "user", content: input }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/dhruva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { type: "bot", content: data.response || data.message },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Error processing request" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    router.push("/");
  };

  return (
    <div
      className="w-full min-h-[93vh] p-3 bg-white dark:bg-zinc-950 flex items-center justify-center fixed z-[100]"
      style={{ height: chatHeight }}
    >
      <Card className="w-full h-full max-w-3xl bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm border-zinc-200 dark:border-zinc-800/50 shadow-lg dark:shadow-2xl">
        <CardContent className="h-full p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/50">
                <DhruvaImage />
              </div>
              <div>
                <h2 className="text-emerald-600 dark:text-emerald-400 text-lg font-bold">
                  Chat With Dhruva
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  24/7 Emergency Response Assistant
                </p>
              </div>
            </div>
            <Button
              onClick={handleClear}
              className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
              size="sm"
              variant="ghost"
            >
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    msg.type === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.type === "user"
                        ? "bg-emerald-600 shadow-lg shadow-emerald-900/10 dark:shadow-emerald-900/20"
                        : "bg-zinc-100 dark:bg-zinc-800/80 border border-emerald-500/20"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <User className="w-4 h-4 text-white dark:text-emerald-50" />
                    ) : (
                      <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-lg ${
                      msg.type === "user"
                        ? "bg-emerald-600 text-white dark:text-emerald-50 rounded-tr-none shadow-emerald-900/10 dark:shadow-emerald-900/20"
                        : "bg-white dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-700/50 shadow-zinc-900/5 dark:shadow-zinc-900/20"
                    }`}
                  >
                    {msg.type === "user" ? (
                      msg.content
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-emerald-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800/80 text-emerald-600 dark:text-emerald-50 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-700/50">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce delay-150" />
                      <span className="w-2 h-2 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about emergency preparedness..."
              className="flex-1 bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 h-10"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 shadow-lg shadow-emerald-900/10 dark:shadow-emerald-900/20"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisasterGuardChat;
