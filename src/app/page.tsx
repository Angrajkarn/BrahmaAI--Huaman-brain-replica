
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2, MemoryStick, GitBranch, Github, Bot, ArrowRight, ShieldCheck, Code, BrainCircuit, Search, Zap, UserCheck, BarChart, Code2, PenSquare, MessageCircle, Twitter, Linkedin, Lock, FileText } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LandingHeader } from "@/components/layout/landing-header";
import { LandingFooter } from "@/components/layout/landing-footer";
import { AtomFieldAnimation } from "@/components/layout/atom-animation";


// --- Main Landing Page Component ---
export default function LandingPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, loading, router]);
  
  if (loading || (!loading && currentUser)) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        {currentUser && <p className="text-muted-foreground mt-4">Redirecting to your dashboard...</p>}
      </main>
    );
  }

  return (
    <div className="bg-background text-foreground overflow-x-hidden">
      <LandingHeader />
      <div className="relative">
        <AtomFieldAnimation />
        <main className="relative z-10">
          <HeroSection />
          <CapabilitiesSection />
          <ArchitectureSection />
          <UseCasesSection />
          <LiveDemoSection />
          <HowItWorksSection />
          <SafetySection />
          <DeveloperSection />
          <FinalCTA />
        </main>
      </div>
      <LandingFooter />
    </div>
  );
}

// --- Section Components ---

const HeroSection = () => {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center text-center overflow-hidden p-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-slate-50 via-primary to-accent bg-clip-text text-transparent animate-text-glow">
          Brahma: Your Brain Replica
        </h1>
        <p className="max-w-3xl mx-auto mt-6 text-xl md:text-2xl text-accent font-medium">
          A living mind in code, designed to think and feel like you.
        </p>
        <p className="max-w-3xl mx-auto mt-4 text-lg md:text-xl text-muted-foreground font-light">
          An AI that doesn&apos;t just compute—it comprehends. Experience emergent intelligence with a system that learns, feels, and reasons like a human mind.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button size="lg" className="animate-border-glow" asChild>
                <Link href="/signup">Try Brahma Now <ArrowRight className="ml-2" /></Link>
            </Button>
             <Button size="lg" variant="outline" className="border-slate-600 hover:bg-slate-800" asChild>
                <Link href="#capabilities">Explore Capabilities</Link>
            </Button>
        </div>
      </motion.div>
    </section>
  );
};

const ScrollAnimatedSection = ({ id, children, className }: { id?: string; children: React.ReactNode, className?: string }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.section
            id={id}
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn("py-20 px-4", className)}
        >
            {children}
        </motion.section>
    )
}

const CapabilitiesSection = () => {
  const capabilities = [
    {
      icon: <BrainCircuit />,
      title: "Dynamic Learning & Memory",
      description: "Brahma simulates synaptic plasticity. It doesn't just retrieve data; it strengthens connections in its knowledge graph based on new information and your feedback, creating a truly evolving memory.",
    },
    {
      icon: <Search />,
      title: "Deep Contextual Analysis",
      description: "Go beyond keyword matching. Brahma's perception agents parse multimodal data to build a rich, semantic understanding, identifying underlying concepts, entities, and their intricate relationships.",
    },
    {
      icon: <UserCheck />,
      title: "Natural Voice & Emotion",
      description: "Our emotion agent analyzes sentiment and subtext, allowing Brahma to grasp the 'how' behind the 'what'. This enables adaptive, empathetic responses delivered in a natural, personalized voice.",
    },
     {
      icon: <Zap />,
      title: "Proactive Task Execution",
      description: "Brahma's reasoning core can formulate multi-step plans and use external tools to act on the world. It's not just an information engine; it's an agent that can perform tasks and solve problems autonomously.",
    },
  ];

  return (
    <ScrollAnimatedSection id="capabilities">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4 text-center">Go Beyond Answers, Achieve Understanding</h2>
        <p className="text-muted-foreground md:text-lg mb-12 text-center max-w-3xl mx-auto">Brahma is more than a chatbot. It's a cognitive tool designed to augment your thinking, creativity, and productivity in every task.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((cap) => (
            <div key={cap.title} className="glassmorphism-card perspective-card p-8 rounded-2xl flex items-start gap-6 hover:border-primary/50 transition-colors duration-300">
                <div className="p-3 bg-primary/20 rounded-lg border border-primary/30 text-primary">
                    {React.cloneElement(cap.icon as React.ReactElement, { size: 24 })}
                </div>
                <div>
                    <h3 className="font-bold text-xl text-foreground mb-2">{cap.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{cap.description}</p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollAnimatedSection>
  );
};


const ArchitectureSection = () => {
    return (
        <ScrollAnimatedSection id="architecture" className="bg-slate-900/50">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">The Cognitive Architecture</h2>
                <p className="text-muted-foreground md:text-lg mb-12 max-w-3xl mx-auto">Brahma isn't a monolithic model. It's a distributed system of specialized agents that mimic the functional areas of the human brain, working in concert to achieve true reasoning.</p>
                
                <div className="w-full max-w-4xl mx-auto">
                    <svg viewBox="0 0 400 250" className="w-full h-auto">
                        <defs>
                            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0.3}} />
                                <stop offset="100%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 0}} />
                            </radialGradient>
                            <style>
                                {`
                                .pulse {
                                    animation: pulse 4s infinite ease-in-out;
                                }
                                @keyframes pulse {
                                    0% { transform: scale(1); opacity: 0.1; }
                                    50% { transform: scale(1.05); opacity: 0.2; }
                                    100% { transform: scale(1); opacity: 0.1; }
                                }
                                `}
                            </style>
                        </defs>
                        
                        <circle cx="200" cy="125" r="45" fill="url(#grad1)" className="pulse" />
                        <circle cx="200" cy="125" r="40" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1"/>
                        <text x="200" y="125" textAnchor="middle" dy="0.3em" fill="hsl(var(--foreground))" fontSize="10" className="font-bold">Reasoning Core</text>

                        {/* Outer Nodes (Lobes) */}
                        <circle cx="80" cy="60" r="25" fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
                        <text x="80" y="60" textAnchor="middle" dy="-3px" fill="hsl(var(--foreground))" fontSize="7" className="font-semibold">Memory</text>
                        <text x="80" y="60" textAnchor="middle" dy="7px" fill="hsl(var(--muted-foreground))" fontSize="5">(Hippocampus)</text>
                        <line x1="105" y1="70" x2="165" y2="105" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />

                        <circle cx="80" cy="190" r="25" fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
                        <text x="80" y="190" textAnchor="middle" dy="-3px" fill="hsl(var(--foreground))" fontSize="7" className="font-semibold">Perception</text>
                         <text x="80" y="190" textAnchor="middle" dy="7px" fill="hsl(var(--muted-foreground))" fontSize="5">(Cortex)</text>
                        <line x1="105" y1="180" x2="165" y2="145" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />

                        <circle cx="320" cy="60" r="25" fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
                        <text x="320" y="60" textAnchor="middle" dy="-3px" fill="hsl(var(--foreground))" fontSize="7" className="font-semibold">Language</text>
                        <text x="320" y="60" textAnchor="middle" dy="7px" fill="hsl(var(--muted-foreground))" fontSize="5">(Wernicke's Area)</text>
                        <line x1="295" y1="70" x2="235" y2="105" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />

                        <circle cx="320" cy="190" r="25" fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="0.5"/>
                        <text x="320" y="190" textAnchor="middle" dy="-3px" fill="hsl(var(--foreground))" fontSize="7" className="font-semibold">Emotion</text>
                        <text x="320" y="190" textAnchor="middle" dy="7px" fill="hsl(var(--muted-foreground))" fontSize="5">(Limbic System)</text>
                        <line x1="295" y1="180" x2="235" y2="145" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2 2" />
                    </svg>
                </div>
            </div>
        </ScrollAnimatedSection>
    )
}


const UseCasesSection = () => {
    return (
        <ScrollAnimatedSection id="use-cases">
            <div className="max-w-4xl mx-auto text-center">
                 <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Your Partner in Creation and Discovery</h2>
                 <p className="text-muted-foreground md:text-lg mb-12">No matter your goal, Brahma adapts to become the ultimate tool for your work.</p>
                 <Tabs defaultValue="strategists" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-slate-800/50">
                        <TabsTrigger value="strategists">For Strategists</TabsTrigger>
                        <TabsTrigger value="developers">For Developers</TabsTrigger>
                        <TabsTrigger value="creators">For Creators</TabsTrigger>
                    </TabsList>
                    <TabsContent value="strategists" className="text-left p-6 glassmorphism-card mt-4 rounded-lg">
                        <div className="flex items-start gap-4">
                            <BarChart className="h-8 w-8 text-accent flex-shrink-0 mt-1"/>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Synthesize Research & Uncover Insights</h3>
                                <p className="text-muted-foreground mt-2">Feed market research, user feedback, and competitor analysis into Brahma. Ask it to identify hidden trends, formulate strategic questions, and generate executive summaries, turning raw data into actionable intelligence.</p>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="developers" className="text-left p-6 glassmorphism-card mt-4 rounded-lg">
                         <div className="flex items-start gap-4">
                            <Code2 className="h-8 w-8 text-accent flex-shrink-0 mt-1"/>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Accelerate Development & Debug Complex Code</h3>
                                <p className="text-muted-foreground mt-2">Provide Brahma with your codebase to get context-aware code suggestions, documentation generation, and complex debugging assistance. It learns your coding style and project architecture to provide truly relevant help.</p>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="creators" className="text-left p-6 glassmorphism-card mt-4 rounded-lg">
                         <div className="flex items-start gap-4">
                            <PenSquare className="h-8 w-8 text-accent flex-shrink-0 mt-1"/>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Brainstorm Ideas & Overcome Creative Blocks</h3>
                                <p className="text-muted-foreground mt-2">Talk through your ideas for a new script, marketing campaign, or design project. Brahma acts as an interactive sounding board, helping you explore new angles, organize your thoughts, and draft initial concepts.</p>
                            </div>
                        </div>
                    </TabsContent>
                 </Tabs>
            </div>
        </ScrollAnimatedSection>
    )
}

const LiveDemoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  
  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <ScrollAnimatedSection id="demo">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">See Brahma in Action</h2>
        <p className="text-muted-foreground md:text-lg mb-12 max-w-3xl mx-auto">Experience how Brahma goes beyond simple answers to provide thoughtful, human-like dialogue.</p>
        
        <div ref={ref} className="glassmorphism-card rounded-2xl p-6 md:p-8 space-y-6 border-2 border-primary/20 shadow-2xl shadow-primary/10">
          
          <motion.div 
            className="flex items-start gap-3 justify-end"
            variants={messageVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-accent text-accent-foreground p-4 rounded-2xl rounded-br-lg max-w-md shadow-md">
              <p className="text-sm">"I'm feeling completely stuck on my novel. The plot feels generic and the main character is flat. I'm losing motivation."</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-accent-foreground shadow-md"><UserCheck size={20}/></div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-3"
            variants={messageVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="h-10 w-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-primary-foreground shadow-md"><Bot size={20}/></div>
            <div className="bg-slate-800/80 p-4 rounded-2xl rounded-bl-lg max-w-md shadow-md">
              <p className="text-sm leading-relaxed">"I understand that feeling of being adrift in a story. It's incredibly frustrating when the characters don't feel alive yet. Instead of focusing on the entire plot, what if we explore one core memory for your protagonist? Just one. What is a single event that defines their biggest fear or greatest desire? Let's start there, and see what new paths unfold."</p>
            </div>
          </motion.div>
        </div>
      </div>
    </ScrollAnimatedSection>
  )
}


const HowItWorksSection = () => {
    const steps = [
        { name: "Perceive", description: "Analyzes user queries, detecting intent and emotional tone.", icon: <MessageCircle/> },
        { name: "Remember", description: "Accesses past conversations and uploaded files from its memory.", icon: <MemoryStick/> },
        { name: "Link", description: "Connects new information to its existing knowledge graph.", icon: <GitBranch/> },
        { name: "Reflect & Reason", description: "Uses tools and a multi-agent system to formulate a thoughtful response.", icon: <Bot/> },
    ]
    return (
        <ScrollAnimatedSection className="bg-slate-900/50">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">How Brahma Thinks</h2>
                <p className="text-muted-foreground md:text-lg mb-12">Our cognitive architecture follows a structured reasoning process inspired by the human brain.</p>
                <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
                     <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-1/2">
                        <svg width="100%" height="100%"><line x1="0" y1="0" x2="100%" y2="0" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="8 8"></line></svg>
                    </div>
                   {steps.map((step) => (
                       <React.Fragment key={step.name}>
                           <div className="relative flex flex-col items-center text-center p-4 bg-background/50 rounded-lg">
                             <div className="p-4 bg-primary/20 rounded-full mb-4 border border-primary/30 text-primary">
                                {React.cloneElement(step.icon as React.ReactElement, { size: 32 })}
                             </div>
                             <h3 className="font-semibold text-lg mb-1">{step.name}</h3>
                             <p className="text-sm text-muted-foreground">{step.description}</p>
                           </div>
                       </React.Fragment>
                   ))}
                </div>
            </div>
        </ScrollAnimatedSection>
    )
}

const SafetySection = () => {
  return (
    <ScrollAnimatedSection>
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 items-center gap-12">
        <div className="text-center md:text-left">
          <ShieldCheck className="h-16 w-16 text-primary mx-auto md:mx-0 mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Safety By Design</h2>
           <p className="text-muted-foreground md:text-lg leading-relaxed">
            Safety isn't an afterthought; it's part of Brahma's core reasoning. From internal moral compass checks to configurable safety filters, we are committed to developing AI responsibly and putting you in control of your data and experience.
           </p>
        </div>
        <div className="glassmorphism-card p-6 rounded-lg space-y-4">
            <h4 className="font-semibold text-lg text-foreground">Your Data, Your Control</h4>
            <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3"><ShieldCheck className="text-green-400 mt-1 h-5 w-5 flex-shrink-0" /><span>All uploaded data is private and encrypted at rest and in transit.</span></li>
                <li className="flex items-start gap-3"><ShieldCheck className="text-green-400 mt-1 h-5 w-5 flex-shrink-0" /><span>You can delete your data, conversations, and account at any time.</span></li>
                <li className="flex items-start gap-3"><ShieldCheck className="text-green-400 mt-1 h-5 w-5 flex-shrink-0" /><span>Brahma's reasoning includes a "moral compass" to avoid generating harmful or biased content.</span></li>
            </ul>
        </div>
      </div>
    </ScrollAnimatedSection>
  )
}

const DeveloperSection = () => {
    return (
        <ScrollAnimatedSection className="bg-slate-900/50">
            <div className="max-w-4xl mx-auto text-center">
                <Code className="h-12 w-12 text-accent mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">Built for Extensibility</h2>
                <p className="text-muted-foreground md:text-lg mb-8 max-w-2xl mx-auto">
                    Harness Brahma's cognitive power in your own applications. Our upcoming API provides access to the core reasoning, memory, and knowledge graph capabilities.
                </p>
                <Button variant="outline" size="lg" className="border-accent text-accent hover:bg-accent/10 hover:text-accent">
                    Explore API Docs (Coming Soon)
                </Button>
            </div>
        </ScrollAnimatedSection>
    )
}


const FinalCTA = () => {
    return (
        <section className="text-center py-24 px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground max-w-3xl mx-auto">
                Ready to partner with an AI that truly understands?
            </h2>
            <p className="text-muted-foreground md:text-lg mt-6 max-w-2xl mx-auto">
                Join the beta and be one of the first to experience a truly cognitive AI companion.
            </p>
             <Button size="lg" className="mt-10 animate-border-glow text-lg py-7 px-10" asChild>
                <Link href="/signup">Start Your Journey with Brahma</Link>
            </Button>
        </section>
    )
}
