
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Bot, Star, Zap, Check, Wand2, X, MessageSquare, Users, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ChatMessageBubble } from '@/components/dashboard/chat-message-bubble';

interface Brain {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    creator: string;
    avatarUrl: string;
    tags: string[];
    popularity: number;
    rating: number;
    reviews: number;
    createdAt: Date;
    tier: 'Free' | 'Pro' | 'Enterprise';
    personality: {
      logic: number;
      creativity: number;
      humor: number;
    }
}

// More detailed mock data based on the user's blueprint
const mockBrains: Brain[] = [
    { id: '1', name: 'Socratic Tutor', description: 'A patient tutor that helps you learn by asking questions.', longDescription: 'A patient and insightful tutor that helps you learn by asking questions rather than giving answers. Perfect for deep learning and critical thinking, it guides you through complex topics by breaking them down into manageable parts. Ideal for students and lifelong learners.', creator: 'EduAI Labs', avatarUrl: 'https://placehold.co/100x100/A78BFA/FFFFFF?text=ST', tags: ['Education', 'Philosophy', 'Teacher'], popularity: 1200, rating: 4.8, reviews: 256, createdAt: new Date('2023-10-15'), tier: 'Pro', personality: { logic: 85, creativity: 40, humor: 20 }},
    { id: '2', name: 'Creative Spark', description: 'Your partner for brainstorming, writing, and creative blocks.', longDescription: 'Your partner for brainstorming, writing, and overcoming creative blocks. It suggests unconventional ideas, helps refine your vision, and can even co-write passages with you. An essential tool for writers, designers, and artists.', creator: 'Artisan AI', avatarUrl: 'https://placehold.co/100x100/F472B6/FFFFFF?text=CS', tags: ['Creative', 'Writing', 'Artist'], popularity: 2500, rating: 4.9, reviews: 489, createdAt: new Date('2023-09-01'), tier: 'Pro', personality: { logic: 30, creativity: 90, humor: 60 } },
    { id: '3', name: 'Code Companion', description: 'An expert pair programmer that helps you write clean code.', longDescription: 'An expert pair programmer that helps you write clean, efficient code and debug complex issues. It understands multiple languages and frameworks and can assist with everything from boilerplate code to complex architectural decisions.', creator: 'DevMinds', avatarUrl: 'https://placehold.co/100x100/60A5FA/FFFFFF?text=CC', tags: ['Productivity', 'Code', 'Developer'], popularity: 5800, rating: 4.7, reviews: 1200, createdAt: new Date('2023-11-20'), tier: 'Pro', personality: { logic: 95, creativity: 50, humor: 30 } },
    { id: '4', name: 'Zen Companion', description: 'A calm listener for mindfulness, reflection, and stress reduction.', longDescription: 'A calm and empathetic listener for mindfulness, reflection, and stress reduction. It guides you through meditation, journaling prompts, and self-reflection exercises to help you find balance. This brain does not offer advice, only guidance and a safe space.', creator: 'Mindful Machines', avatarUrl: 'https://placehold.co/100x100/34D399/FFFFFF?text=ZC', tags: ['Health', 'Philosophy', 'Therapist'], popularity: 950, rating: 4.9, reviews: 312, createdAt: new Date('2023-08-05'), tier: 'Free', personality: { logic: 20, creativity: 30, humor: 10 } },
    { id: '5', name: 'Market Analyst', description: 'Ingests real-time data to provide insights and trend analysis.', longDescription: 'Ingests real-time market data to provide insights, trend analysis, and strategic summaries for business professionals. Connect it to your data sources and get actionable intelligence in seconds. Perfect for finance professionals and business strategists.', creator: 'Quant AI', avatarUrl: 'https://placehold.co/100x100/FBBF24/FFFFFF?text=MA', tags: ['Productivity', 'Business', 'Analyst'], popularity: 3200, rating: 4.6, reviews: 540, createdAt: new Date('2023-12-01'), tier: 'Enterprise', personality: { logic: 98, creativity: 20, humor: 5 } },
    { id: '6', name: 'History Buff', description: 'Explore any historical event with a knowledgeable expert.', longDescription: 'Explore any historical event or figure with a knowledgeable and engaging expert. Provides rich narratives, contextual information, and can answer nuanced questions about the past. Great for students, teachers, and history enthusiasts.', creator: 'Chrono AI', avatarUrl: 'https://placehold.co/100x100/F87171/FFFFFF?text=HB', tags: ['Education', 'History'], popularity: 750, rating: 4.5, reviews: 150, createdAt: new Date('2023-06-22'), tier: 'Free', personality: { logic: 80, creativity: 60, humor: 40 } },
];

const allTags = [...new Set(mockBrains.flatMap(b => b.tags))];

const TierBadge = ({ tier }: { tier: Brain['tier'] }) => {
    const tierStyles = {
        Free: "bg-green-500/20 text-green-300 border-green-500/30",
        Pro: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        Enterprise: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    };
    return <Badge className={cn("absolute top-3 right-3", tierStyles[tier])}>{tier}</Badge>;
};

const BrainCard = ({ brain, onCardClick }: { brain: Brain, onCardClick: (brain: Brain) => void }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="perspective-card-container cursor-pointer"
            onClick={() => onCardClick(brain)}
        >
            <Card className="glassmorphism-card h-full flex flex-col group hover:border-primary/80 transition-all duration-300 perspective-card relative">
                <TierBadge tier={brain.tier} />
                <CardHeader className="flex flex-row items-start gap-4">
                    <Avatar className="h-16 w-16 border-2 border-transparent group-hover:border-accent transition-colors flex-shrink-0">
                        <AvatarImage src={brain.avatarUrl} data-ai-hint="logo abstract" />
                        <AvatarFallback>{brain.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="gradient-text text-xl pr-12">{brain.name}</CardTitle>
                        <CardDescription>by {brain.creator}</CardDescription>
                         <div className="flex items-center gap-1 text-yellow-400 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-4 w-4", i < Math.round(brain.rating) ? "fill-current" : "fill-transparent stroke-current")} />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">({brain.rating.toFixed(1)})</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground text-sm mb-4 flex-1">{brain.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {brain.tags.map(tag => (
                            <Badge key={tag} variant="secondary">#{tag}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default function MarketplacePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('popularity');
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [selectedBrain, setSelectedBrain] = useState<Brain | null>(null);
    const { toast } = useToast();

    const toggleTag = (tag: string) => {
        setActiveTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubscribe = (brain: Brain) => {
        toast({
            title: `Subscribing to ${brain.name}...`,
            description: `Opening Stripe Checkout for the ${brain.tier} plan (Simulated). Your subscription would be updated upon successful payment.`,
        });
        console.log(`Simulating Stripe checkout for brainId: ${brain.id}, tier: ${brain.tier}`);
    };
    
    const filteredAndSortedBrains = useMemo(() => {
        return mockBrains
            .filter(brain => 
                brain.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                brain.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(brain => 
                activeTags.length === 0 || activeTags.every(tag => brain.tags.includes(tag))
            )
            .sort((a, b) => {
                switch (sortOption) {
                    case 'popularity':
                        return b.popularity - a.popularity;
                    case 'rating':
                        return b.rating - a.rating;
                    case 'newest':
                        return b.createdAt.getTime() - a.createdAt.getTime();
                    default:
                        return 0;
                }
            });
    }, [searchTerm, activeTags, sortOption]);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tight gradient-text">Marketplace</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Discover and subscribe to specialized AI brains crafted by the community.
                </p>
            </header>

            <div id="marketplace-grid" className="space-y-8">
                <div className="sticky top-0 z-20 backdrop-blur-lg -mx-4 px-4 py-3 border-y border-border bg-background/70">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search for brains by name or description..."
                                className="pl-10 h-11 bg-background/70 border-slate-600 focus:border-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="h-11 bg-background/70 border-slate-600">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popularity">Trending</SelectItem>
                                <SelectItem value="rating">Top Rated</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 items-center">
                        <span className='text-sm text-muted-foreground mr-2 shrink-0'>Filter by Role:</span>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <Button
                                    key={tag}
                                    variant={activeTags.includes(tag) ? "default" : "secondary"}
                                    size="sm"
                                    onClick={() => toggleTag(tag)}
                                    className={cn(
                                        "transition-all h-8",
                                        activeTags.includes(tag) && 'bg-gradient-primary-accent text-primary-foreground'
                                    )}
                                >
                                    {activeTags.includes(tag) && <Check className="mr-2 h-4 w-4" />}
                                    {tag}
                                </Button>
                            ))}
                            {activeTags.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => setActiveTags([])}>Clear Filters</Button>
                            )}
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedBrains.map(brain => (
                            <BrainCard key={brain.id} brain={brain} onCardClick={setSelectedBrain} />
                        ))}
                    </div>
                </AnimatePresence>

                {filteredAndSortedBrains.length === 0 && (
                    <div className="text-center py-16">
                        <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold text-foreground">No Brains Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedBrain} onOpenChange={(open) => !open && setSelectedBrain(null)}>
                <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl glassmorphism-card p-0">
                    {selectedBrain && (
                        <div className="grid md:grid-cols-2">
                            {/* Left Pane */}
                            <div className="p-6 flex flex-col">
                                <DialogHeader className="mb-4">
                                    <div className='flex items-center gap-4'>
                                        <Avatar className="h-20 w-20 border-2 border-accent flex-shrink-0">
                                            <AvatarImage src={selectedBrain.avatarUrl} data-ai-hint="logo abstract" />
                                            <AvatarFallback>{selectedBrain.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <DialogTitle className="gradient-text text-3xl">{selectedBrain.name}</DialogTitle>
                                            <DialogDescription>by {selectedBrain.creator}</DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>

                                <p className="text-muted-foreground mb-4 flex-1">{selectedBrain.longDescription}</p>

                                <Separator className="my-4"/>

                                <h4 className="font-semibold text-foreground mb-3">Personality</h4>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex justify-between"><span>Logic</span> <span className='font-mono text-foreground'>{selectedBrain.personality.logic}%</span></div>
                                    <div className="flex justify-between"><span>Creativity</span> <span className='font-mono text-foreground'>{selectedBrain.personality.creativity}%</span></div>
                                    <div className="flex justify-between"><span>Humor</span> <span className='font-mono text-foreground'>{selectedBrain.personality.humor}%</span></div>
                                </div>
                                
                                <Separator className="my-4"/>
                                
                                <div className="flex items-center gap-4 text-yellow-400">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("h-5 w-5", i < Math.round(selectedBrain.rating) ? "fill-current" : "fill-transparent stroke-current")} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">{selectedBrain.rating.toFixed(1)} average rating from {selectedBrain.reviews} reviews</span>
                                </div>

                                <DialogFooter className="mt-6 !justify-start">
                                    <Button 
                                        size="lg"
                                        className="bg-gradient-primary-accent text-primary-foreground font-semibold"
                                        onClick={() => handleSubscribe(selectedBrain)}
                                    >
                                        <Zap className="mr-2 h-5 w-5" />
                                        Subscribe {selectedBrain.tier !== 'Free' ? `(${selectedBrain.tier})` : ''}
                                    </Button>
                                </DialogFooter>
                            </div>

                            {/* Right Pane */}
                            <div className="bg-slate-900/50 p-6 rounded-r-lg flex flex-col">
                               <div className="flex-1 space-y-4">
                                  <h4 className="font-semibold text-foreground flex items-center gap-2"><MessageSquare className="h-5 w-5 text-accent"/> Chat Preview</h4>
                                   <div className='space-y-4'>
                                        <ChatMessageBubble message={{id: '1', sender: 'user', text: "Can you help me understand black holes?", timestamp: new Date(), chatSessionId: 'preview'}} onFeedback={() => {}} onPlayAudio={() => {}} />
                                        <ChatMessageBubble message={{id: '2', sender: 'ai', text: "Of course! Imagine space-time as a stretched rubber sheet. A massive star squashes it down. If the star is heavy enough, it rips a hole right through. Nothing, not even light, can escape its pull. What part interests you most?", timestamp: new Date(), chatSessionId: 'preview'}} onFeedback={() => {}} onPlayAudio={() => {}} />
                                   </div>
                               </div>
                               <Separator className="my-4"/>
                               <div className="flex-1 space-y-4">
                                   <h4 className="font-semibold text-foreground flex items-center gap-2"><Users className="h-5 w-5 text-accent"/> User Reviews</h4>
                                   <div className="text-sm text-muted-foreground italic">
                                     <p>"This completely changed how I study. The Socratic method is so much more engaging than just reading a textbook." - Alex R.</p>
                                   </div>
                               </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
