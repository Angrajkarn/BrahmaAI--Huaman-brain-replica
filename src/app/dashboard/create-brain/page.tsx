
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, BrainCircuit, Bot, FileText, Mic, SendHorizonal, Trash2, UploadCloud, User, Wand2, Heart, Shield, Search as SearchIcon, Target, Gamepad2, BookOpen, UserCircle, Tag, DollarSign, Youtube, Link as LinkIcon, X, Share2, Copy, Store } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const trainingQuotes = [
    "Connecting synapses and forming memory...",
    "Calibrating emotional matrix...",
    "Building the architecture of a new mind...",
    "Learning from the knowledge you provided...",
    "The spark of creation is igniting..."
];

const SectionCard = ({ index, title, description, icon, children }: { index: number, title: string, description: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
    >
        <Card className="glassmorphism-card overflow-hidden">
            <CardHeader className="flex flex-row items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-lg border border-primary/30 text-primary mt-1">
                    {icon}
                </div>
                <div>
                    <CardTitle className="gradient-text text-xl">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    </motion.div>
);


export default function CreateBrainPage() {
    const { toast } = useToast();
    const { currentUser } = useAuth();

    // Step 1 State
    const [name, setName] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    // Step 2 State
    const [personality, setPersonality] = useState({
        logicEmotion: 50,
        formalFriendly: 50,
        empathy: 50,
        curiosity: 50,
        playfulness: 50,
    });

    // Step 3 State
    const [files, setFiles] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceSample, setVoiceSample] = useState<Blob | null>(null);

    // Step 5 State
    const [pricingPlan, setPricingPlan] = useState("free");
    const [price, setPrice] = useState("");

    // Preview State
    const [previewMessages, setPreviewMessages] = useState([
        { sender: 'ai' as const, text: 'I am ready to learn. Ask me anything to test my current personality configuration.' }
    ]);
    const [previewInput, setPreviewInput] = useState("");

    // Training State
    const [isTraining, setIsTraining] = useState(false);
    const [trainingQuote, setTrainingQuote] = useState(trainingQuotes[0]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [trainedBrainDetails, setTrainedBrainDetails] = useState<{name: string, url: string} | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) {
            setAuthorName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous');
        }
    }, [currentUser]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };
    
    const handleTrainBrain = () => {
        if (!name.trim()) {
            toast({ title: "Brain Name Required", description: "Please give your brain a name before training.", variant: "destructive"});
            return;
        }

        setIsTraining(true);
        const quoteInterval = setInterval(() => {
            setTrainingQuote(trainingQuotes[Math.floor(Math.random() * trainingQuotes.length)]);
        }, 2000);
        
        console.log("SIMULATING BRAIN TRAINING WITH DATA:", {
            name, description, authorName, category, tags, personality,
            files: files.map(f => f.name),
            voiceSample: !!voiceSample,
            pricing: { plan: pricingPlan, amount: price }
        });

        setTimeout(() => {
            clearInterval(quoteInterval);
            setIsTraining(false);
            
            const mockBrainId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-5);
            setTrainedBrainDetails({
                name: name,
                url: `${window.location.origin}/shared/brain/${mockBrainId}` // Simulate a shareable link
            });
            setShowShareModal(true);

            toast({ title: "Brain Trained Successfully!", description: `${name} is now ready to be shared.` });
        }, 6000);
    };

    const handlePreviewSend = () => {
        if (!previewInput.trim()) return;
        const userMessage = { sender: 'user' as const, text: previewInput };
        
        let aiResponseText = 'This is a simulated response based on my personality settings. ';
        if(personality.formalFriendly < 30) aiResponseText += "Hey there! ";
        if(personality.playfulness > 70) aiResponseText += "What a fun question! ";
        aiResponseText += 'Once I am fully trained, my answers will be much richer!';

        const aiResponse = { sender: 'ai' as const, text: aiResponseText };
        
        setPreviewMessages([...previewMessages, userMessage, aiResponse]);
        setPreviewInput("");
    };

    const handleCopyLink = () => {
        if (trainedBrainDetails?.url) {
            navigator.clipboard.writeText(trainedBrainDetails.url);
            toast({
                title: "Link Copied!",
                description: "The private share link is now in your clipboard.",
            });
        }
    };

    const handleSubmitToMarketplace = () => {
        setShowShareModal(false);
        toast({
            title: "Submitted to Marketplace!",
            description: `"${trainedBrainDetails?.name}" has been submitted for review. (Simulated)`,
        });
    };

    if (isTraining) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                    <BrainCircuit className="h-24 w-24 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold mt-8 gradient-text">Training Your Brain...</h2>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={trainingQuote}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="text-muted-foreground mt-4 text-lg"
                    >
                        {trainingQuote}
                    </motion.p>
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto">
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">Create Your Own Brain Replica</h1>
                <p className="text-muted-foreground mt-3 text-lg max-w-2xl mx-auto">
                    Craft your AI twin by uploading knowledge, defining its personality, and training it.
                </p>
            </motion.header>

            <SectionCard index={1} title="Brain Profile" description="Give your brain a unique identity." icon={<UserCircle />}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="brain-name">Name Your Brain</Label>
                            <Input id="brain-name" placeholder="e.g., 'Socrates'" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/70 border-slate-600"/>
                        </div>
                        <div>
                            <Label htmlFor="author-name">Author Name</Label>
                            <Input id="author-name" value={authorName} disabled className="bg-background/70 border-slate-600"/>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="brain-desc">Description</Label>
                        <Textarea id="brain-desc" placeholder="A brief bio for your brain..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background/70 border-slate-600"/>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select onValueChange={setCategory}>
                                <SelectTrigger className="bg-background/70 border-slate-600">
                                    <SelectValue placeholder="Select a category..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="therapist">Therapist</SelectItem>
                                    <SelectItem value="friend">Friend</SelectItem>
                                    <SelectItem value="coach">Coach</SelectItem>
                                    <SelectItem value="scientist">Scientist</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="tags">Tags</Label>
                            <div className="flex items-center gap-2 rounded-md border border-slate-600 bg-background/70 pr-2">
                                <Input 
                                    id="tags" 
                                    placeholder="Add a tag and press Enter" 
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    className="border-0 bg-transparent focus-visible:ring-0 shadow-none"
                                />
                                <Tag className="h-4 w-4 text-muted-foreground"/>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => removeTag(tag)}><X className="h-3 w-3"/></button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>
            
            <SectionCard index={2} title="Personality Configuration" description="Define the core traits of your brain." icon={<BrainCircuit/>}>
                 <div className="space-y-6 pt-2">
                    <TooltipProvider>
                        <PersonalitySlider label="Logic 🧠 vs Emotion ❤️" value={personality.logicEmotion} onValueChange={(v) => setPersonality(p => ({...p, logicEmotion: v[0]}))} />
                        <PersonalitySlider label="Formal 🎓 vs Friendly 😄" value={personality.formalFriendly} onValueChange={(v) => setPersonality(p => ({...p, formalFriendly: v[0]}))} />
                        <PersonalitySlider label="Empathetic ❤️ vs Reserved 🛡️" iconLeft={<Heart/>} iconRight={<Shield/>} value={personality.empathy} onValueChange={(v) => setPersonality(p => ({...p, empathy: v[0]}))} />
                        <PersonalitySlider label="Curious 🔬 vs Focused 🎯" iconLeft={<SearchIcon/>} iconRight={<Target/>} value={personality.curiosity} onValueChange={(v) => setPersonality(p => ({...p, curiosity: v[0]}))} />
                        <PersonalitySlider label="Playful 🎮 vs Serious 📚" iconLeft={<Gamepad2/>} iconRight={<BookOpen/>} value={personality.playfulness} onValueChange={(v) => setPersonality(p => ({...p, playfulness: v[0]}))} />
                    </TooltipProvider>
                </div>
            </SectionCard>

             <SectionCard index={3} title="Upload Knowledge" description="Provide the foundational memory for your brain." icon={<UploadCloud/>}>
                <div className="space-y-4">
                     <div>
                        <Label>Documents</Label>
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-slate-600 hover:border-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <UploadCloud className="h-10 w-10 mb-2 text-muted-foreground" />
                            <p className="font-semibold">Drag & drop or click to upload</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT</p>
                            <Input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt"/>
                        </div>
                        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto modern-scrollbar">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-md text-sm">
                                    <span className="truncate">{file.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <Label>Voice Sample (for cloning)</Label>
                             <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700/50"><Mic className="mr-2"/> Record or Upload Audio</Button>
                        </div>
                         <div>
                             <Label>External Link</Label>
                             <div className="flex items-center gap-2">
                                <Input placeholder="https://youtube.com/..." className="bg-background/70 border-slate-600" />
                                <Button><LinkIcon className="h-4 w-4"/></Button>
                             </div>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard index={4} title="Monetization" description="Set a price for others to use your brain." icon={<DollarSign />}>
                <RadioGroup value={pricingPlan} onValueChange={setPricingPlan} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Label htmlFor="plan-free" className="p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary">
                        <RadioGroupItem value="free" id="plan-free" className="sr-only"/>
                        <h4 className="font-semibold">Free</h4>
                        <p className="text-sm text-muted-foreground">Available for everyone to use.</p>
                    </Label>
                    <Label htmlFor="plan-monthly" className="p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary">
                        <RadioGroupItem value="monthly" id="plan-monthly" className="sr-only"/>
                        <h4 className="font-semibold">Monthly Subscription</h4>
                        <p className="text-sm text-muted-foreground">Charge a recurring fee.</p>
                    </Label>
                    <Label htmlFor="plan-onetime" className="p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary">
                        <RadioGroupItem value="onetime" id="plan-onetime" className="sr-only"/>
                         <h4 className="font-semibold">One-Time Fee</h4>
                        <p className="text-sm text-muted-foreground">Charge a single payment for access.</p>
                    </Label>
                </RadioGroup>
                {pricingPlan !== 'free' && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                    >
                        <Label>Price ({pricingPlan === 'monthly' ? 'per month' : 'one-time'})</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input type="number" placeholder="10.00" value={price} onChange={e => setPrice(e.target.value)} className="pl-8 bg-background/70 border-slate-600" />
                        </div>
                    </motion.div>
                )}
            </SectionCard>

            <SectionCard index={5} title="Live Chat Preview" description="Test your brain's personality. Responses are simulated." icon={<Bot />}>
                 <div className="space-y-4 h-48 overflow-y-auto p-4 bg-slate-900/50 rounded-lg modern-scrollbar">
                    {previewMessages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && <div className="h-8 w-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center shadow-md"><Bot className="h-5 w-5"/></div>}
                            <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-slate-700'}`}>
                                {msg.text}
                            </div>
                            {msg.sender === 'user' && <div className="h-8 w-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center shadow-md"><User className="h-5 w-5"/></div>}
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex gap-2">
                    <Input 
                        value={previewInput} 
                        onChange={(e) => setPreviewInput(e.target.value)} 
                        placeholder="Ask a question..." 
                        className="bg-background/70 border-slate-600" 
                        onKeyDown={(e) => { if(e.key === 'Enter') handlePreviewSend(); }}
                    />
                    <Button onClick={handlePreviewSend}><SendHorizonal className="h-4 w-4" /></Button>
                </div>
            </SectionCard>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center mt-12"
            >
                <Button size="lg" className="bg-gradient-primary-accent text-primary-foreground font-bold text-lg py-7 px-10" onClick={handleTrainBrain}>
                    <Wand2 className="mr-3 h-6 w-6"/>
                    Train My Brain
                </Button>
            </motion.div>

            <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                <DialogContent className="glassmorphism-card">
                    <DialogHeader>
                        <DialogTitle className="gradient-text text-2xl flex items-center gap-2">
                            <Share2 /> Your Brain is Ready!
                        </DialogTitle>
                        <DialogDescription>
                            Share your newly created brain, "{trainedBrainDetails?.name}", with others or submit it to the public marketplace.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <h3 className="font-semibold text-foreground">Private Share Link</h3>
                        <p className="text-sm text-muted-foreground">Only people with this link can access your brain. They will need to sign in or create an account.</p>
                        <div className="flex items-center gap-2">
                            <Input
                                readOnly
                                value={trainedBrainDetails?.url || ""}
                                className="bg-background/70 border-slate-600"
                            />
                            <Button variant="outline" size="icon" onClick={handleCopyLink}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2 pt-4">
                        <h3 className="font-semibold text-foreground">Public Marketplace</h3>
                        <p className="text-sm text-muted-foreground">Make your brain discoverable to everyone on the Brahma Marketplace.</p>
                        <Button className="w-full bg-gradient-primary-accent" onClick={handleSubmitToMarketplace}>
                            <Store className="mr-2"/> Submit to Marketplace
                        </Button>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button variant="secondary" onClick={() => setShowShareModal(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface PersonalitySliderProps {
    label: string;
    value: number;
    onValueChange: (value: number[]) => void;
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
}

const PersonalitySlider = ({ label, value, onValueChange, iconLeft, iconRight }: PersonalitySliderProps) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">{iconLeft} {label.split('vs')[0]}</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">{label.split('vs')[1]} {iconRight}</div>
        </div>
        <Slider
            defaultValue={[value]}
            max={100}
            step={1}
            onValueChange={onValueChange}
        />
    </div>
);
