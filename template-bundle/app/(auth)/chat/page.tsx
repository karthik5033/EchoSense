"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
  sources?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender: "assistant",
    text: "Greetings. I am your EchoSense Acoustic Intelligence Copilot. I analyze smartphone structural acoustic emissions, calculate optimal Takens embedding parameters (delay τ via AMI and dimension d via FNN), and interpret persistent homology diagrams.",
    time: "17:20 UTC",
    sources: ["Takens Module", "GUDHI TDA Engine", "BOCD Stream"],
  },
];

const PRESETS = [
  "Evaluate optimal Takens delay (τ) for Girder Specimen #3",
  "Explain difference between H0 components and H1 topological loops",
  "What triggered the BOCD changepoint on Load Cycle #14?",
  "Compare EchoSense TDA Random Forest vs 1D CNN baseline metrics",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = `Analysis completed for query: "${text}".\n\n`;

      if (text.toLowerCase().includes("delay") || text.toLowerCase().includes("takens")) {
        reply += `1. **Average Mutual Information (AMI):** First local minimum observed at delay τ = 4 samples (83.3 µs at 48 kHz).\n2. **False Nearest Neighbors (FNN):** Ratio drops to 0.6% at embedding dimension d = 4.\n3. **Attractor Geometry:** State-space reconstructed with 98.4% variance preservation, isolating crack orbit cycles from ambient noise.`;
      } else if (text.toLowerCase().includes("bocd") || text.toLowerCase().includes("changepoint")) {
        reply += `1. **BOCD Run-length Shift:** At t = 14.2s, the posterior run-length probability P(r_t = 0) spiked to 0.89.\n2. **Underlying Driver:** Sudden burst of high persistent entropy H1 (lifetime > 3.5σ).\n3. **Structural Implication:** Micro-crack propagation along web shear path in Girder Specimen #3. Immediate ultrasonic verification recommended.`;
      } else if (text.toLowerCase().includes("baseline") || text.toLowerCase().includes("cnn")) {
        reply += `1. **EchoSense TDA + Random Forest:** 94.1% Accuracy, 0.938 Macro F1.\n2. **1D CNN Waveform Baseline:** 88.7% Accuracy, 0.879 Macro F1.\n3. **Conventional AE Descriptors:** 81.2% Accuracy, 0.795 Macro F1.\n4. **Noise Resilience:** TDA representation maintains 89% accuracy under +10dB SNR smartphone noise, whereas CNN degrades to 74%.`;
      } else {
        reply += `1. **Topological Feature Vector:** 924-dimensional vector extracted via Persistence Landscapes (5 layers) and Persistence Images.\n2. **Current Structural Status:** Healthy precursor index = 0.14. No macroscopic shear failure detected.\n3. **Active Sensors:** 12 smartphone MEMS microphones streaming at 48 kHz.`;
      }

      const botMsg: Message = {
        id: `msg-bot-${Date.now()}`,
        sender: "assistant",
        text: reply,
        time: "Just now",
        sources: ["Takens Embedding Engine", "GUDHI Rips Complex", "BOCD Run-Length Matrix"],
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto w-full h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Acoustic AI Diagnostics Copilot
            </h2>
            <p className="text-xs text-muted-foreground">
              Intelligent conversational interface for TDA parameters, crack mechanisms &amp; structural health
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="text-xs gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Chat
        </Button>
      </div>

      {/* Suggested Prompts */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${
              m.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                m.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              }`}
            >
              {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`max-w-2xl rounded-xl p-4 text-xs space-y-2 leading-relaxed ${
                m.sender === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>

              {m.sources && (
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-muted-foreground font-mono">Sources:</span>
                  {m.sources.map((s, sIdx) => (
                    <Badge
                      key={sIdx}
                      variant="outline"
                      className="text-[9px] font-mono py-0 h-4 bg-muted/30 border-border/80"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              )}

              <span className="block text-[10px] opacity-60 text-right mt-1 font-mono">
                {m.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-xl p-3 bg-card border border-border text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-mono text-[11px]">Computing persistence diagrams...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="shrink-0 flex items-center gap-2 pt-2 border-t border-border">
        <Input
          placeholder="Ask about Takens embedding, persistent homology, BOCD changepoints..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="text-xs h-10 bg-card"
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          size="sm"
          className="h-10 px-4 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
          Send
        </Button>
      </div>
    </div>
  );
}
