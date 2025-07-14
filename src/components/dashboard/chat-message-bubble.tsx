
"use client";

import type { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsDown, ThumbsUp, User, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import React from "react";
import { BrahmaLogoIcon } from "../layout/brahma-logo-icon";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onPlayAudio: (audioUrl: string) => void;
  onFeedback: (messageId: string, feedback: 'up' | 'down') => void;
}

export function ChatMessageBubble({ message, onPlayAudio, onFeedback }: ChatMessageBubbleProps) {
  const { toast } = useToast();
  const isUser = message.sender === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    toast({ title: "Copied to clipboard!", description: "Message content copied." });
  };

  const handleFeedbackClick = (feedback: 'up' | 'down') => {
    if (message.id) {
        onFeedback(message.id, feedback);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full items-end gap-3",
        isUser && "justify-end"
      )}
    >
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center shadow-md">
            <BrahmaLogoIcon className="h-6 w-6"/>
        </div>
      )}
      
      <div
        className={cn(
          "group relative rounded-xl px-4 py-3 shadow-sm max-w-[85%] md:max-w-[75%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
        )}
      >
        <div className="prose prose-sm prose-invert max-w-none text-inherit whitespace-pre-wrap leading-relaxed">{message.text}</div>
        
        {!isUser && (
          <div className="mt-2 flex items-center gap-1">
            {message.audioUrl && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onPlayAudio(message.audioUrl!)}>
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-muted-foreground hover:text-foreground", {"text-accent": message.feedback === 1})} onClick={() => handleFeedbackClick('up')}>
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className={cn("h-7 w-7 text-muted-foreground hover:text-foreground", {"text-destructive": message.feedback === -1})} onClick={() => handleFeedbackClick('down')}>
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

       {isUser && (
         <div className="h-8 w-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center shadow-md">
            <User size={18}/>
         </div>
      )}
    </motion.div>
  );
}
