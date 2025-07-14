
"use client";

import type { ChatMessage } from "@/types";
import { ChatMessageBubble } from "./chat-message-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useRef } from "react";
import { BrahmaLogoIcon } from "../layout/brahma-logo-icon";

interface ChatDisplayProps {
  messages: ChatMessage[];
  isAISpeaking: boolean;
  onPlayAudio: (audioUrl: string) => void;
  onFeedback: (messageId: string, feedback: 'up' | 'down') => void;
}

export function ChatDisplay({ messages, isAISpeaking, onPlayAudio, onFeedback }: ChatDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAISpeaking]);

  return (
    <div className="w-full">
        <div className="mx-auto w-full max-w-2xl px-4">
            <div className="space-y-6 pt-6 pb-24">
                {messages.map((message, index) => (
                    <ChatMessageBubble 
                        key={message.id || index} 
                        message={message} 
                        onPlayAudio={onPlayAudio}
                        onFeedback={onFeedback}
                    />
                ))}
                {isAISpeaking && (
                    <div className="flex items-end space-x-3 max-w-[75%]">
                        <div className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center shadow-md">
                            <BrahmaLogoIcon className="h-6 w-6 animate-spin"/>
                        </div>
                        <div className="flex flex-col items-start gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    </div>
  );
}

    
