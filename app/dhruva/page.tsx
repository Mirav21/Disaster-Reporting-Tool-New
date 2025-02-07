"use client";
import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, XCircle, Mic, MicOff, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const LANGUAGE_CONFIG = {
  en: {
    code: "en-US",
    name: "English",
    welcomeMessage:
      "Welcome to DisasterGuard AI! I'm here to provide expert guidance on disaster preparedness, response, and recovery. How can I assist you today?",
    placeholder: "Ask about emergency preparedness...",
    readyPrompts: [
      "What emergency supplies should I stock?",
      "How to create a family emergency plan?",
      "What to do during a natural disaster?",
    ],
  },
  hi: {
    code: "hi-IN",
    name: "हिन्दी",
    welcomeMessage:
      "डिजास्टर गार्ड AI में आपका स्वागत है! मैं आपदा की तैयारी, प्रतिक्रिया और पुनर्प्राप्ति पर विशेषज्ञ मार्गदर्शन प्रदान करने के लिए यहाँ हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
    placeholder: "आपातकालीन सहायता के लिए पूछें...",
    readyPrompts: [
      "आपातकालीन सामग्री में क्या रखना चाहिए?",
      "परिवार के लिए आपातकालीन योजना कैसे बनाएं?",
      "प्राकृतिक आपदा के दौरान क्या करना चाहिए?",
    ],
  },
  gu: {
    code: "gu-IN",
    name: "ગુજરાતી",
    welcomeMessage:
      "ડિઝાસ્ટર ગાર્ડ AI માં welcome! હું આફત સન્નધતા, પ્રતિભાવ અને પુનઃપ્રાપ્તિ પર નિષ્ણાત માર્ગદર્શન આપવા માટે અહીં છું. આજે હું તમને કઈ રીતે મદદ કરી શકું?",
    placeholder: "કટોકટી સહાય માટે પૂછો...",
    readyPrompts: [
      "કઈ કઈ કટોકટી માટેની સામગ્રી સાથે રાખવી?",
      "પરિવાર માટે કઈ કટોકટી યોજના બનાવવી?",
      "કુદરતી આફત દરમિયાન શું કરવું?",
    ],
  },
};

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

// First, let's define the necessary interfaces
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: string | null;
  emma: Document | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: SpeechRecognitionErrorCode;
  message: string;
}

type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";

// Define the WebkitSpeechRecognition interface
interface IWebkitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: {
      new (): IWebkitSpeechRecognition;
    };
  }
}

const DisasterGuardChat: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<
    Array<{ type: "bot" | "user"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<keyof typeof LANGUAGE_CONFIG>("en");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<IWebkitSpeechRecognition | null>(null);

  // const PAUSE_THRESHOLD = 2000; // 2 seconds delay
  // let timeoutId: NodeJS.Timeout;

  // const initSpeechRecognition = () => {
  //   if ("webkitSpeechRecognition" in window) {
  //     recognitionRef.current = new window.webkitSpeechRecognition();
  //     recognitionRef.current.continuous = true; // Changed to true to keep listening
  //     recognitionRef.current.interimResults = true; // Changed to true to get interim results
  //     recognitionRef.current.lang = LANGUAGE_CONFIG[language].code;

  //     let finalTranscript = "";

  //     recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
  //       let interimTranscript = "";

  //       // Collect all results
  //       for (let i = event.resultIndex; i < event.results.length; i++) {
  //         const transcript = event.results[i][0].transcript;
  //         if (event.results[i].isFinal) {
  //           finalTranscript += transcript + " ";
  //         } else {
  //           interimTranscript += transcript;
  //         }
  //       }

  //       // Update the input field with current speech
  //       setInput(finalTranscript + interimTranscript);

  //       // Clear any existing timeout
  //       if (timeoutId) {
  //         clearTimeout(timeoutId);
  //       }

  //       // Set new timeout for final submission
  //       timeoutId = setTimeout(() => {
  //         if (finalTranscript.trim()) {
  //           handleSubmit(finalTranscript.trim());
  //           finalTranscript = ""; // Reset final transcript
  //           setIsListening(false);
  //           recognitionRef.current?.stop();
  //         }
  //       }, PAUSE_THRESHOLD);
  //     };

  //     recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
  //       console.error("Speech recognition error:", event.error);
  //       setIsListening(false);
  //       if (timeoutId) {
  //         clearTimeout(timeoutId);
  //       }
  //     };

  //     recognitionRef.current.onend = () => {
  //       setIsListening(false);
  //     };
  //   }
  // };

  // const toggleSpeechRecognition = () => {
  //   if (!recognitionRef.current) {
  //     initSpeechRecognition();
  //   }

  //   if (isListening) {
  //     recognitionRef.current?.stop();
  //     setIsListening(false);
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //     }
  //   } else {
  //     recognitionRef.current?.start();
  //     setIsListening(true);
  //   }
  // };

  const initSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = LANGUAGE_CONFIG[language].code;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript + " ";
          } else {
            interimTranscript += result[0].transcript + " ";
          }
        }

        setInput(finalTranscript || interimTranscript);

        if (finalTranscript) {
          // Stop recognition before handling submit
          recognitionRef.current?.stop();
          setIsListening(false);

          // Clear the recognition reference to ensure clean state
          setTimeout(() => {
            handleSubmit(finalTranscript.trim());
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        recognitionRef.current?.stop();
        setIsListening(false);
      };

      // Add onend handler to ensure state is cleaned up
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setIsListening(false);
      }
    }
  };

  // Initialize Chat and Adjust Height
  useEffect(() => {
    setMessages([
      {
        type: "bot",
        content: LANGUAGE_CONFIG[language].welcomeMessage,
      },
    ]);

    // Reinitialize speech recognition when language changes
    initSpeechRecognition();
  }, [language]);

  // Scroll to Bottom Effect
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Submit Handler
  const handleSubmit = async (inputText?: string) => {
    const textToSubmit = inputText || input;
    if (!textToSubmit.trim()) return;

    setMessages((prev) => [...prev, { type: "user", content: textToSubmit }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/dhruva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSubmit,
          language: language,
        }),
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

  // Clear Chat
  const handleClear = () => {
    setMessages([]);
    router.push("/");
  };

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[88vh] bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-xl overflow-hidden flex flex-col">
        <CardContent className="h-full p-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="hidden md:flex lg:flex items-center gap-4">
              <div>
                <h2 className="text-emerald-700 dark:text-emerald-400 text-lg md:text-2xl lg:text-2xl font-bold tracking-tight">
                  Dhruva: Emergency Assistant
                </h2>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm">
                  Multilingual Disaster Preparedness Support
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="mr-1">
                <Select
                  value={language}
                  onValueChange={(val: keyof typeof LANGUAGE_CONFIG) =>
                    setLanguage(val)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <Languages className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                    <SelectItem value="gu">ગુજરાતી</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleClear}
                variant="ghost"
                size="icon"
                className="flex justify-center text-zinc-500 hover:text-red-500 -mr-2"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="flex-1 pr-4 mb-4 overflow-y-auto">
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
                        ? "bg-green-600 shadow-lg"
                        : "bg-zinc-100 dark:bg-zinc-800"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-md ${
                      msg.type === "user"
                        ? "bg-green-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-700"
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 text-green-600 px-4 py-3 rounded-2xl rounded-tl-none">
                    <div className="flex gap-2">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="w-2 h-2 bg-green-600 rounded-full animate-bounce"
                          style={{ animationDelay: `${dot * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          <div className="mx-2 mb-2">
            <div className="flex justify-start gap-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {LANGUAGE_CONFIG[language].readyPrompts.map((prompt, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(prompt);
                    handleSubmit(prompt);
                  }}
                  className="flex-shrink-0 whitespace-nowrap text-sm text-green-400 hover:bg-white dark:text-green-400 hover:scale-105 transition-transform duration-200 ease-in-out"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={LANGUAGE_CONFIG[language].placeholder}
                className="pr-10 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              />
              <Button
                type="button"
                onClick={toggleSpeechRecognition}
                variant="ghost"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
