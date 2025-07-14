
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Users, DollarSign, BrainCircuit, TestTube2, Edit, CheckCircle, Clock, GitCommit, Globe, FlaskConical, Lightbulb, MessageSquare, MapPin } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import type { AuthorBrain, BrainReview, Payout } from '@/types';
import { cn } from '@/lib/utils';
import Image from "next/image";

// MOCK DATA - Expanded to include new fields
const mockAuthorBrains: AuthorBrain[] = [
  { id: 'brain1', name: 'Socratic Tutor', tags: ['Education', 'Philosophy'], price: 10, subscribersCount: 1251, avgRating: 4.8, revenue: 12510, visibility: 'Public', createdAt: '2023-10-15', avatarUrl: 'https://placehold.co/100x100/A78BFA/FFFFFF?text=ST', version: 'v1.2', isABTesting: false },
  { id: 'brain2', name: 'Code Companion', tags: ['Code', 'Developer'], price: 15, subscribersCount: 5823, avgRating: 4.7, revenue: 87345, visibility: 'Public', createdAt: '2023-11-20', avatarUrl: 'https://placehold.co/100x100/60A5FA/FFFFFF?text=CC', version: 'v2.0', isABTesting: true },
  { id: 'brain3', name: 'Zen Listener', tags: ['Health', 'Therapist'], price: 0, subscribersCount: 954, avgRating: 4.9, revenue: 0, visibility: 'Private', createdAt: '2023-08-05', avatarUrl: 'https://placehold.co/100x100/34D399/FFFFFF?text=ZL', version: 'v1.0', isABTesting: false },
  { id: 'brain4', name: 'Market Analyst', tags: ['Business', 'Finance'], price: 25, subscribersCount: 320, avgRating: 4.6, revenue: 8000, visibility: 'Public', createdAt: '2024-01-10', avatarUrl: 'https://placehold.co/100x100/FBBF24/FFFFFF?text=MA', version: 'v1.5', isABTesting: false },
];

const mockReviews: BrainReview[] = [
  { id: 'rev1', brainId: 'brain1', brainName: 'Socratic Tutor', userId: 'user1', userName: 'Alex R.', rating: 5, text: 'This completely changed how I study. So engaging!', date: '2024-05-01' },
  { id: 'rev2', brainId: 'brain2', brainName: 'Code Companion', userId: 'user2', userName: 'Devin C.', rating: 4, text: 'Really helpful for debugging complex issues, sometimes a bit slow.', date: '2024-04-28' },
  { id: 'rev3', brainId: 'brain1', brainName: 'Socratic Tutor', userId: 'user3', userName: 'Sara K.', rating: 5, text: 'Wish I had this in college!', date: '2024-04-25' },
];

const mockPayouts: Payout[] = [
    { id: 'pay1', amount: 87345, status: 'Paid', date: '2024-04-01' },
    { id: 'pay2', amount: 20510, status: 'Pending', date: '2024-05-01' },
];

const liveStreamEvents = [
    { brain: 'Code Companion', user: 'User from 🇮🇳', action: 'asked about Python decorators.', time: 'now'},
    { brain: 'Socratic Tutor', user: 'User from 🇺🇸', action: 'explored the concept of metaphysics.', time: '2m ago'},
    { brain: 'Market Analyst', user: 'User from 🇬🇧', action: 'queried Q1 earnings data.', time: '5m ago'},
]

const coachingTips = [
    "Your 'Socratic Tutor' has a high engagement rate but low session duration. Try adding a prompt to suggest related topics.",
    "75% of users for 'Code Companion' are asking about Javascript. Consider uploading a new training file on ES6 features.",
    "The 'frustrated' emotion was detected in 15% of 'Zen Listener' chats yesterday. You may want to review and adjust its empathy settings.",
]

const subscribersChartData = mockAuthorBrains.map(b => ({ name: b.name, subscribers: b.subscribersCount}));

const viewsChartData = [
  { date: 'May 1', views: 2200 }, { date: 'May 2', views: 3100 },
  { date: 'May 3', views: 2800 }, { date: 'May 4', views: 4500 },
  { date: 'May 5', views: 4100 }, { date: 'May 6', views: 5200 },
  { date: 'May 7', views: 6800 },
];

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function AuthorDashboardPage() {
    const totalSubscribers = mockAuthorBrains.reduce((sum, b) => sum + b.subscribersCount, 0);
    const totalEarnings = mockAuthorBrains.reduce((sum, b) => sum + b.revenue, 0);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tight gradient-text">Author Dashboard</h1>
                <p className="text-muted-foreground mt-2 text-lg">
                    Your command center for creating, managing, and monetizing your AI brains.
                </p>
            </header>

            {/* Section 1: Overview Cards */}
            <motion.section 
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 }}}}
            >
                <motion.div variants={cardVariants}>
                    <StatCard title="Total Subscribers" value={totalSubscribers.toLocaleString()} icon={<Users className="h-6 w-6 text-primary" />} description="Across all your brains" className="glassmorphism-card"/>
                </motion.div>
                 <motion.div variants={cardVariants}>
                    <StatCard title="Total Earnings" value={`$${totalEarnings.toLocaleString()}`} icon={<DollarSign className="h-6 w-6 text-green-500" />} description="All-time revenue" className="glassmorphism-card"/>
                </motion.div>
                <motion.div variants={cardVariants}>
                    <StatCard title="Brains Published" value={mockAuthorBrains.length.toString()} icon={<BrainCircuit className="h-6 w-6 text-accent" />} description="Live on the marketplace" className="glassmorphism-card"/>
                </motion.div>
                <motion.div variants={cardVariants}>
                     <StatCard title="Experiments" value="1" icon={<TestTube2 className="h-6 w-6 text-yellow-500" />} description="Brains in draft mode" className="glassmorphism-card"/>
                </motion.div>
            </motion.section>

             {/* Section 2: Real-Time Analytics */}
            <motion.section 
                className="grid grid-cols-1 lg:grid-cols-5 gap-6"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 }}}}
            >
                <motion.div variants={cardVariants} className="lg:col-span-3">
                    <Card className="glassmorphism-card h-full">
                        <CardHeader>
                            <CardTitle className="gradient-text">Subscribers per Brain</CardTitle>
                            <CardDescription>A comparison of your most popular brains.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{ subscribers: { label: "Subscribers", color: "hsl(var(--primary))" } }} className="h-64">
                                <BarChart data={subscribersChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="subscribers" fill="var(--color-subscribers)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={cardVariants} className="lg:col-span-2">
                     <Card className="glassmorphism-card h-full">
                        <CardHeader>
                            <CardTitle className="gradient-text">Views Over Time</CardTitle>
                            <CardDescription>Total views across all brains (last 7 days).</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ChartContainer config={{ views: { label: "Views", color: "hsl(var(--accent))" } }} className="h-64">
                                <LineChart data={viewsChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}/>
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.section>
            
            {/* Section: Live Activity */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="glassmorphism-card lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="gradient-text flex items-center gap-2"><MessageSquare /> Live Usage Stream</CardTitle>
                        <CardDescription>See how users are interacting right now.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {liveStreamEvents.map((event, i) => (
                             <motion.div 
                                key={i} 
                                className="text-sm"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.3 }}
                             >
                                <p><span className="font-semibold text-primary">{event.brain}</span>: {event.user} {event.action}</p>
                                <p className="text-xs text-muted-foreground">{event.time}</p>
                             </motion.div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="glassmorphism-card lg:col-span-2 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="gradient-text flex items-center gap-2"><Globe /> Subscriber Geo-Heatmap</CardTitle>
                        <CardDescription>Visualize your global user base.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 relative h-64">
                        <Image src="https://placehold.co/800x400.png" alt="Subscriber Heatmap" layout="fill" objectFit="cover" data-ai-hint="world map" />
                         <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    </CardContent>
                </Card>
            </section>
            
            {/* Section: Intelligence Reports */}
            <section>
                 <Card className="glassmorphism-card">
                    <CardHeader>
                        <CardTitle className="gradient-text flex items-center gap-2"><Lightbulb /> Brahma Coaching Panel</CardTitle>
                        <CardDescription>AI-driven suggestions to improve your brains' performance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {coachingTips.map((tip, i) => (
                             <motion.div 
                                key={i} 
                                className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                            >
                                <BrainCircuit className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-muted-foreground">{tip}</p>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </section>


             {/* Section 3: My Brains */}
            <motion.section
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.5 }}
            >
                <Card className="glassmorphism-card">
                    <CardHeader>
                        <CardTitle className="gradient-text">My Brains</CardTitle>
                        <CardDescription>Manage your published and private brains.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {mockAuthorBrains.map(brain => (
                             <Card key={brain.id} className="bg-slate-900/50 hover:border-primary/50 transition-colors duration-300 flex flex-col">
                                <CardHeader className="flex-row gap-4 items-start">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={brain.avatarUrl} data-ai-hint="logo abstract"/>
                                        <AvatarFallback>{brain.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{brain.name}</CardTitle>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {brain.tags.map(tag => <Badge key={tag} variant="secondary">#{tag}</Badge>)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subscribers</span>
                                        <span className="font-semibold">{brain.subscribersCount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Revenue</span>
                                        <span className="font-semibold">${brain.revenue.toLocaleString()}</span>
                                    </div>
                                     <div className="flex justify-between text-sm items-center">
                                        <span className="text-muted-foreground">Visibility</span>
                                        <Badge variant={brain.visibility === 'Public' ? 'default' : 'outline'} className={cn(brain.visibility === 'Public' && 'bg-green-500/20 text-green-300')}>{brain.visibility}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm items-center">
                                         <span className="text-muted-foreground flex items-center gap-1"><GitCommit className="h-3 w-3" /> Version</span>
                                         <span className="font-mono text-xs">{brain.version}</span>
                                    </div>
                                     <div className="flex justify-between text-sm items-center">
                                         <span className="text-muted-foreground flex items-center gap-1"><FlaskConical className="h-3 w-3" /> A/B Test</span>
                                         <Badge variant="outline" className={cn(brain.isABTesting ? 'text-yellow-300 border-yellow-500/50' : '')}>{brain.isABTesting ? 'Active' : 'Inactive'}</Badge>
                                    </div>
                                </CardContent>
                                <div className="p-4 pt-0">
                                     <Button className="w-full"><Edit className="mr-2 h-4 w-4"/> Manage Brain</Button>
                                </div>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </motion.section>

             {/* Section 5 & 6: Reviews & Payouts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glassmorphism-card">
                     <CardHeader>
                        <CardTitle className="gradient-text">Recent Reviews</CardTitle>
                        <CardDescription>Feedback from your users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Brain</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Rating</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockReviews.map(review => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-medium">{review.brainName}</TableCell>
                                        <TableCell>{review.userName}</TableCell>
                                        <TableCell className="text-yellow-400">{'★'.repeat(review.rating)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card className="glassmorphism-card">
                     <CardHeader>
                        <CardTitle className="gradient-text">Payout History</CardTitle>
                        <CardDescription>Your earnings from Stripe.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockPayouts.map(payout => (
                                    <TableRow key={payout.id}>
                                        <TableCell>{payout.date}</TableCell>
                                        <TableCell className="font-medium">${payout.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                             <Badge variant={payout.status === 'Paid' ? 'default' : 'secondary'} className={cn(payout.status === 'Paid' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300')}>
                                                {payout.status === 'Paid' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3"/>}
                                                {payout.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
