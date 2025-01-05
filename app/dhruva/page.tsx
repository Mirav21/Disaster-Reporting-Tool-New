"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import DhruvaImage from "@/components/DhruvaImage";

// Message formatting component
const FormattedMessage = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => (
          <ul className="list-disc ml-4 mb-2">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal ml-4 mb-2">{children}</ol>
        ),
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ children }) => (
          <code className="bg-zinc-700 px-1 py-0.5 rounded text-sm">
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

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        type: "bot",
        content:
          "Welcome to DisasterGuard AI! I'm here to provide expert guidance on disaster preparedness, response, and recovery. How can I assist you today?",
      },
    ]);
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
  };

  return (
    <div className="min-h-[90vh] py-2 bg-zinc-950 flex items-center justify-center">
      <Card className="w-full max-w-3xl bg-zinc-900 border-none shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center">
                <DhruvaImage />
              </div>
              <div>
                <h2 className="text-green-500 text-xl font-bold">
                  Chat With Dhruva
                </h2>
                <p className="text-zinc-400 text-sm">
                  24/7 Emergency Response Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleClear}
                className="text-zinc-400 hover:text-red-500"
                size="sm"
                variant="ghost"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[600px] pr-4 mb-6">
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.type === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.type === "user"
                        ? "bg-green-600"
                        : "bg-zinc-800 border border-green-500"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <User className="w-6 h-6 text-white" />
                    ) : (
                      <Bot className="w-6 h-6 text-green-400" />
                    )}
                  </div>
                  <div
                    className={`px-5 py-4 rounded-2xl max-w-[80%] shadow-lg ${
                      msg.type === "user"
                        ? "bg-green-600 text-white rounded-tr-none"
                        : "bg-zinc-800 text-green-50 rounded-tl-none border border-zinc-700"
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
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 border border-green-500 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="bg-zinc-800 text-green-50 px-5 py-4 rounded-2xl rounded-tl-none border border-zinc-700">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150" />
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about emergency preparedness...(Say Hello!)"
              className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 focus-visible:ring-green-500 h-12"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white h-12 px-6"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisasterGuardChat;
