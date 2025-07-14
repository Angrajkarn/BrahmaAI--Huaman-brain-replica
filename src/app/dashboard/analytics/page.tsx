
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, MessageCircle, FileCheck2, AlertTriangle, Sun, Cloud, Clock, Droplets, Wind, Smile, Frown, Meh, FileText, BrainCircuit } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db, firebaseAppInitialized } from "@/lib/firebase";
import { collection, query, where, onSnapshot, limit, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";
import { UploadedFile } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

const NeuronGrid = () => {
    const [dots, setDots] = useState<any[]>([]);
    useEffect(() => {
        const newDots = Array.from({ length: 100 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 5
        }));
        setDots(newDots);
    }, []);

    return (
        <div className="relative h-full w-full">
            <svg width="100%" height="100%" className="absolute inset-0">
                <defs>
                    <radialGradient id="neuronGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="hsl(var(--primary) / 0.6)" />
                        <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
                    </radialGradient>
                </defs>
                {dots.map(dot => (
                    <motion.circle
                        key={dot.id}
                        cx={`${dot.x}%`}
                        cy={`${dot.y}%`}
                        r={2}
                        fill="url(#neuronGlow)"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 1, 0], scale: 1 }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: dot.delay,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};

const WaveformPlaceholder = () => {
    return (
        <div className="flex h-full w-full items-center justify-center gap-1">
            {Array.from({ length: 15 }).map((_, i) => (
                 <motion.div
                    key={i}
                    className="w-1.5 bg-accent/70"
                    animate={{
                        scaleY: [1, 1.5, 0.8, 1.2, 1],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    style={{ height: `${20 + Math.sin(i) * 10 + 10}px` }}
                 />
            ))}
        </div>
    )
}

const EmotionIcon = ({ emotion }: { emotion: string | null }) => {
    const lowerEmotion = emotion?.toLowerCase();
    if (!lowerEmotion) return <Meh className="h-8 w-8 text-muted-foreground" />;
    if (['excited', 'happy', 'positive'].some(e => lowerEmotion.includes(e))) return <Smile className="h-8 w-8 text-green-400" />;
    if (['frustrated', 'sad', 'angry', 'negative'].some(e => lowerEmotion.includes(e))) return <Frown className="h-8 w-8 text-red-400" />;
    return <Meh className="h-8 w-8 text-yellow-400" />;
};


export default function EmbodimentDashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [totalUploads, setTotalUploads] = useState<number | null>(null);
  const [totalChatSessions, setTotalChatSessions] = useState<number | null>(null);
  const [filesWithError, setFilesWithError] = useState<number | null>(null);
  const [filesProcessedSuccessfully, setFilesProcessedSuccessfully] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [latestEmotion, setLatestEmotion] = useState<string | null>(null);
  const [latestMemory, setLatestMemory] = useState<UploadedFile | null>(null);

  const [worldState, setWorldState] = useState({
      location: "San Francisco, CA", // Mock data
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      weather: "Sunny", // Mock data
      temp: "72°F", // Mock data
  });

  useEffect(() => {
    const timer = setInterval(() => {
        setWorldState(prev => ({...prev, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!firebaseAppInitialized || !currentUser || authLoading) {
      setIsLoadingStats(authLoading);
      return;
    }
    setIsLoadingStats(true);

    const unsubscribes: (() => void)[] = [];

    // Fetch base stats (uploads, sessions)
    const uploadsQuery = query(collection(db, "uploadedFiles"), where("userId", "==", currentUser.uid));
    unsubscribes.push(onSnapshot(uploadsQuery, (snapshot) => {
      setTotalUploads(snapshot.size);
      setFilesWithError(snapshot.docs.filter(doc => doc.data().status === 'error').length);
      setFilesProcessedSuccessfully(snapshot.docs.filter(doc => doc.data().status === 'completed').length);
    }));

    const sessionsQuery = query(collection(db, "chatSessions"), where("userId", "==", currentUser.uid));
    unsubscribes.push(onSnapshot(sessionsQuery, (snapshot) => setTotalChatSessions(snapshot.size)));

    // Fetch latest memory (most recent upload)
    const filesQuery = query(collection(db, "uploadedFiles"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"), limit(1));
    unsubscribes.push(onSnapshot(filesQuery, (fileSnap) => {
        if (!fileSnap.empty) {
            setLatestMemory({id: fileSnap.docs[0].id, ...fileSnap.docs[0].data()} as UploadedFile);
        }
    }));

    // Fetch latest emotion from latest chat
    const latestSessionQuery = query(collection(db, "chatSessions"), where("userId", "==", currentUser.uid), orderBy("lastMessageAt", "desc"), limit(1));
    unsubscribes.push(onSnapshot(latestSessionQuery, (sessionSnap) => {
        if (!sessionSnap.empty) {
            const latestSessionId = sessionSnap.docs[0].id;
            const messagesQuery = query(collection(db, "chatSessions", latestSessionId, "messages"), where("sender", "==", "ai"), orderBy("timestamp", "desc"), limit(1));
            // This nested subscription is cleaned up when the parent unsubscribes.
            const unsubMessages = onSnapshot(messagesQuery, (msgSnap) => {
                if (!msgSnap.empty) {
                    setLatestEmotion(msgSnap.docs[0].data().detectedEmotion || 'neutral');
                }
            });
            unsubscribes.push(unsubMessages);
        } else {
          setLatestEmotion('neutral');
        }
    }));
    
    setIsLoadingStats(false);
    return () => unsubscribes.forEach(unsub => unsub());
  }, [currentUser, authLoading, toast]);


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Embodiment Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          A real-time look into Brahma's simulated sensory state and memory.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Your Total Uploads" value={isLoadingStats ? <BrahmaLogoIcon className="h-6 w-6 animate-spin" /> : (totalUploads ?? '0').toString()} icon={<UploadCloud className="h-6 w-6 text-primary" />} description="Files form Brahma's memory" className="glassmorphism-card"/>
        <StatCard title="Your Chat Sessions" value={isLoadingStats ? <BrahmaLogoIcon className="h-6 w-6 animate-spin" /> : (totalChatSessions ?? '0').toString()} icon={<MessageCircle className="h-6 w-6 text-accent" />} description="Total conversations held" className="glassmorphism-card"/>
        <StatCard title="Memories Stored" value={isLoadingStats ? <BrahmaLogoIcon className="h-6 w-6 animate-spin" /> : (filesProcessedSuccessfully ?? '0').toString()} icon={<FileCheck2 className="h-6 w-6 text-green-500" />} description="Files successfully analyzed" className="glassmorphism-card"/>
        <StatCard title="Memory Faults" value={isLoadingStats ? <BrahmaLogoIcon className="h-6 w-6 animate-spin" /> : (filesWithError ?? '0').toString()} icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />} description="Files with processing errors" className="glassmorphism-card"/>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World State Card */}
        <Card className="glassmorphism-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2"><Sun className="text-primary"/> World State (Simulated)</CardTitle>
            <CardDescription>Brahma's awareness of the physical environment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Clock className="h-7 w-7 text-muted-foreground"/>
                    <div>
                        <p className="font-semibold">{worldState.time}</p>
                        <p className="text-xs text-muted-foreground">{worldState.location}</p>
                    </div>
                </div>
                <div className="text-right">
                     <p className="font-semibold text-2xl">{worldState.temp}</p>
                     <p className="text-xs text-muted-foreground">{worldState.weather}</p>
                </div>
            </div>
            <div className="flex justify-around items-center text-center pt-4 border-t border-border">
                <div>
                    <Wind className="h-6 w-6 mx-auto text-muted-foreground"/>
                    <p className="text-sm font-medium mt-1">5 mph</p>
                    <p className="text-xs text-muted-foreground">Wind</p>
                </div>
                <div>
                    <Droplets className="h-6 w-6 mx-auto text-muted-foreground"/>
                    <p className="text-sm font-medium mt-1">45%</p>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Sensory Status Card */}
        <Card className="glassmorphism-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="gradient-text flex items-center gap-2"><BrainCircuit className="text-accent" /> Sensory Status</CardTitle>
            <CardDescription>The latest inputs shaping Brahma's context.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-muted-foreground">Last Detected Emotion</h3>
                <div className="flex items-center gap-4">
                    <EmotionIcon emotion={latestEmotion} />
                    <p className="text-2xl font-bold capitalize">{isLoadingStats ? "Loading..." : latestEmotion || 'Neutral'}</p>
                </div>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-muted-foreground">Most Recent Memory</h3>
                <div className="flex items-start gap-3">
                    <FileText className="h-7 w-7 text-muted-foreground flex-shrink-0 mt-1"/>
                    <div>
                        <p className="font-semibold truncate" title={latestMemory?.fileName}>{latestMemory?.fileName || "No files uploaded yet"}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{latestMemory?.conceptualData?.summary || "Awaiting first memory upload."}</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glassmorphism-card h-64 lg:col-span-2">
             <CardHeader>
                <CardTitle className="gradient-text">Neural Activity</CardTitle>
                <CardDescription>Visualizing the agent's reasoning process.</CardDescription>
             </CardHeader>
             <CardContent className="h-full pb-6">
                <NeuronGrid />
             </CardContent>
          </Card>
          <Card className="glassmorphism-card h-64 lg:col-span-1">
             <CardHeader>
                <CardTitle className="gradient-text">Live Audio Feed</CardTitle>
                <CardDescription>Simulated real-time sensory input.</CardDescription>
             </CardHeader>
             <CardContent>
                <WaveformPlaceholder />
             </CardContent>
          </Card>
      </section>

    </div>
  );
}
