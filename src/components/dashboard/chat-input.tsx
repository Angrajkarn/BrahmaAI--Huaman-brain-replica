
"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Mic, ArrowUp } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, onFileSelect, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    setInput(textarea.value);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200;
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };
  
  const handleVoiceClick = () => {
      router.push('/dashboard/voice');
  };

  return (
    <div className="w-full bg-background pt-4 pb-4 flex-shrink-0">
      <div className="mx-auto w-full max-w-[700px] px-4">
        <form onSubmit={handleSubmit}>
          <div className="relative flex w-full flex-col">
            <div className="relative flex items-center rounded-2xl border border-muted bg-card/80 p-2 shadow-md transition-all duration-200">

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
              <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary" onClick={handleFileButtonClick} disabled={disabled}>
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>

              <Textarea
                ref={textareaRef}
                value={input}
                onInput={handleInput}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Message Brahma..."
                className="flex-1 border-0 bg-transparent resize-none text-base p-2 shadow-none focus-visible:ring-0 focus:outline-none min-h-[24px] max-h-48 overflow-y-auto pr-10"
                rows={1}
                disabled={disabled}
              />

              <div className="absolute right-12 self-end">
                <Button type="button" variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary" onClick={handleVoiceClick} disabled={disabled}>
                    <Mic className="h-5 w-5" />
                    <span className="sr-only">Voice chat</span>
                </Button>
              </div>

              <Button
                type="submit"
                size="icon"
                className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:bg-muted-foreground transition-colors self-end"
                disabled={disabled || !input.trim()}
              >
                <ArrowUp className="h-5 w-5" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
