
"use client";

import { BrainCircuit, BookOpen, Cpu } from "lucide-react";
import { Card } from "../ui/card";
import { BrahmaLogoIcon } from "../layout/brahma-logo-icon";
import React from "react";
import { motion } from "framer-motion";

interface ChatWelcomeScreenProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    suggestions: Array<{
        title: string;
        prompt: string;
        icon: React.ReactElement;
    }>
}

export function ChatWelcomeScreen({ onSendMessage, disabled, suggestions = [] }: ChatWelcomeScreenProps) {
    
    const handlePromptClick = (prompt: string) => {
        if (!disabled) {
            onSendMessage(prompt);
        }
    }

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
        },
      },
    };
    
    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto">
                 <motion.div 
                    className="flex-shrink-0 flex flex-col items-center"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                 >
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <BrahmaLogoIcon className="h-20 w-20" />
                    </motion.div>
                    <p className="mt-6 text-3xl font-medium text-foreground">Brahma</p>
                    <p className="mt-2 text-xl font-light text-muted-foreground">Ready to explore, reflect, or create?</p>
                 </motion.div>

                 <motion.div 
                     className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl w-full"
                     variants={containerVariants}
                     initial="hidden"
                     animate="visible"
                 >
                     {suggestions.map((item) => (
                         <motion.div key={item.title} variants={itemVariants}>
                             <Card 
                                 onClick={() => handlePromptClick(item.prompt)} 
                                 className="p-4 text-left glassmorphism-card hover:border-accent/80 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20 h-full"
                             >
                                 <div className="flex items-center gap-3 mb-2">
                                    {item.icon}
                                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                                 </div>
                                 <p className="text-sm text-muted-foreground">{item.prompt}</p>
                             </Card>
                         </motion.div>
                     ))}
                 </motion.div>
            </div>
        </div>
    );
}
