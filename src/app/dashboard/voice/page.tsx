
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { processUserChat } from "@/ai/flows/brahmaChatFlow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ConversationState = "idle" | "listening" | "processing" | "speaking";

const voiceOptions = [
    { value: 'Algenib', label: 'Algenib (Standard Male)' },
    { value: 'Achernar', label: 'Achernar (Standard Female)' },
    { value: 'Canopus', label: 'Canopus (Soft Male)' },
    { value: 'Spica', label: 'Spica (Soft Female)' },
];

const VoiceVisualizer = ({ state }: { state: ConversationState }) => {
    const isListening = state === 'listening';
    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-background">
            <motion.div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.15)_0%,transparent_60%)]"
                animate={{
                    scale: isListening ? [1, 1.2, 1, 1.1, 1] : 1,
                    opacity: isListening ? [0.6, 1, 0.7, 1, 0.6] : 0.6,
                }}
                transition={{
                    duration: isListening ? 1.5 : 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};


export default function VoiceChatPage() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    
    const [conversationState, setConversationState] = useState<ConversationState>("idle");
    const [isMounted, setIsMounted] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('Algenib');

    const audioRef = useRef<HTMLAudioElement>(null);
    const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleUserQuery = useCallback(async (query: string) => {
        if (!currentUser || !query.trim()) {
            setConversationState("idle");
            return;
        }
        
        try {
            const result = await processUserChat({
                userId: currentUser.uid,
                chatSessionId: `voice-session-${currentUser.uid}`,
                userQuery: query,
                voiceName: selectedVoice,
            });

            if (result.audioUrl && audioRef.current) {
                setConversationState("speaking");
                audioRef.current.src = result.audioUrl;
                audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            } else {
                toast({ title: "No Audio Response", description: "The AI responded, but no audio was generated.", variant: "default" });
                // If no audio, go back to listening after a delay
                 if (speechRecognitionRef.current && conversationState !== 'idle') {
                    setTimeout(() => {
                        setConversationState('listening');
                        speechRecognitionRef.current?.start();
                    }, 1000);
                }
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
            setConversationState("idle");
        }
    }, [currentUser, selectedVoice, toast, conversationState]);

    const setupSpeechRecognition = useCallback(() => {
        if (typeof window === "undefined" || !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
            toast({ title: "Unsupported Browser", description: "Your browser does not support Speech Recognition.", variant: "destructive" });
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
                setConversationState("processing");
                handleUserQuery(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                toast({ title: "Mic Error", description: `An error occurred with the microphone: ${event.error}`, variant: "destructive" });
            }
             if (conversationState !== 'idle' && conversationState !== 'speaking' && event.error === 'no-speech') {
                setTimeout(() => {
                    if(speechRecognitionRef.current && conversationState === 'listening') {
                        speechRecognitionRef.current.start();
                    }
                }, 500);
            } else {
                setConversationState("idle");
            }
        };

        speechRecognitionRef.current = recognition;
    }, [toast, handleUserQuery, conversationState]);
    
    useEffect(() => {
        setupSpeechRecognition();
    }, [setupSpeechRecognition]);
    
    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        const handleAudioEnd = () => {
            if (conversationState === 'speaking') {
                setTimeout(() => {
                     if (speechRecognitionRef.current) {
                        setConversationState('listening');
                        speechRecognitionRef.current.start();
                    }
                }, 200);
            }
        };

        audioEl.addEventListener('ended', handleAudioEnd);
        return () => {
            audioEl.removeEventListener('ended', handleAudioEnd);
        };
    }, [conversationState]);

    const handleToggleConversation = () => {
        const recognition = speechRecognitionRef.current;
        if (!recognition) return;

        if (conversationState === "idle") {
            setConversationState("listening");
            recognition.start();
        } else {
            recognition.stop();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            setConversationState("idle");
        }
    };
    
    const getButtonContent = () => {
        switch (conversationState) {
            case 'idle':
                return { text: "Tap to Speak", icon: <Mic className="h-12 w-12" /> };
            case 'listening':
                return { text: "Listening...", icon: <Mic className="h-12 w-12 text-destructive" /> };
            case 'processing':
                return { text: "Thinking...", icon: <BrainCircuit className="h-12 w-12 animate-pulse" /> };
            case 'speaking':
                return { text: "Speaking...", icon: <Loader2 className="h-12 w-12 animate-spin" /> };
            default:
                return { text: "Tap to Speak", icon: <Mic className="h-12 w-12" /> };
        }
    };

    const buttonContent = getButtonContent();

    return (
        <div className="relative flex flex-col h-full items-center justify-center p-4 text-center overflow-hidden">
            <VoiceVisualizer state={conversationState} />
            
            <div className="relative z-10 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={conversationState}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3, ease: 'backOut' }}
                        className="flex flex-col items-center justify-center"
                    >
                        <button onClick={handleToggleConversation} className="relative h-64 w-64 flex items-center justify-center focus:outline-none rounded-full group">
                             <div className={cn(
                                "absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 opacity-50 blur-2xl transition-all duration-500",
                                conversationState === 'listening' && 'scale-110 opacity-70',
                                conversationState === 'processing' && 'animate-pulse',
                             )}></div>
                            {conversationState === 'listening' && (
                                <div className="absolute inset-0 rounded-full border-2 border-destructive/50 animate-ping"></div>
                            )}
                            <div className="relative h-48 w-48 bg-slate-900/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-700/50 text-foreground group-hover:border-primary/50 transition-colors">
                                {buttonContent.icon}
                            </div>
                        </button>
                        <p className="text-2xl text-muted-foreground mt-8 h-8 font-medium w-64 text-center">{buttonContent.text}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-10 z-10 w-full max-w-xs mx-auto">
                <Select value={selectedVoice} onValueChange={setSelectedVoice} disabled={conversationState !== 'idle'}>
                    <SelectTrigger className="glassmorphism-card border-slate-600 h-12 text-base focus:ring-accent">
                        <SelectValue placeholder="Select a voice..." />
                    </SelectTrigger>
                    <SelectContent>
                        {voiceOptions.map(option => (
                            <SelectItem key={option.value} value={option.value} className="text-base">{option.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <audio ref={audioRef} className="hidden" />
        </div>
    );
}
