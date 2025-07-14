
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { ChatSession } from "@/types";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { db, firebaseAppInitialized } from "@/lib/firebase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquarePlus, Trash2, Pencil, MoreHorizontal, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/layout/user-nav";
import { Search } from "lucide-react";
import { MainNav } from "@/components/layout/main-nav";
import { Separator } from "@/components/ui/separator";


export function ChatHistorySidebar() {
  const { currentUser, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state: sidebarState } = useSidebar();

  const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);


  useEffect(() => {
    if (!firebaseAppInitialized || !currentUser || authLoading) {
      setIsLoading(authLoading);
      return;
    }

    setIsLoading(true);
    const q = query(
      collection(db, "chatSessions"),
      where("userId", "==", currentUser.uid),
      orderBy("lastMessageAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const sessionsData = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          lastMessageAt: data.lastMessageAt instanceof Timestamp ? data.lastMessageAt.toDate() : new Date(),
        } as ChatSession;
      });
      setSessions(sessionsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching chat sessions:", error);
      toast({ title: "Error", description: "Could not fetch chat history.", variant: "destructive" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, authLoading, toast]);
  
  const handleDeleteSession = async (sessionId: string) => {
    if (!currentUser) return;
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));

    try {
      const messagesQuery = query(collection(db, "chatSessions", sessionId, "messages"));
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, "chatSessions", sessionId, "messages", messageDoc.id))
      );
      await Promise.all(deletePromises);
      
      await deleteDoc(doc(db, "chatSessions", sessionId));

      toast({ title: "Session Deleted", description: "The chat session and its messages have been removed." });
      
      if (pathname.includes(sessionId)) {
        router.push('/dashboard/chat/new');
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({ title: "Deletion Failed", description: "Could not delete the session.", variant: "destructive" });
    }
  };

  const handleShareSession = (sessionId: string) => {
    const url = `${window.location.origin}/dashboard/chat/${sessionId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "A shareable link to this chat has been copied to your clipboard.",
    });
  };

  const handleRenameSession = async () => {
    if (!sessionToRename || !newTitle.trim()) {
      return;
    }

    const docRef = doc(db, "chatSessions", sessionToRename.id);
    try {
      await updateDoc(docRef, {
        title: newTitle.trim(),
      });
      toast({
        title: "Session Renamed",
        description: `The session has been renamed to "${newTitle.trim()}".`,
      });
    } catch (error) {
       console.error("Error renaming session:", error);
       toast({ title: "Rename Failed", description: "Could not rename the session.", variant: "destructive" });
    } finally {
        setSessionToRename(null);
        setNewTitle("");
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
     <>
        <SidebarHeader>
            <Logo isLink={false} showText={sidebarState === 'expanded'} />
        </SidebarHeader>
        
        <div className="px-2 mb-2 flex flex-col gap-y-2">
            <SidebarMenuButton asChild tooltip="New Chat" size="lg" className="h-10 justify-start">
                 <Link href="/dashboard/chat/new">
                     <MessageSquarePlus className="h-5 w-5" />
                     <span className="group-data-[state=collapsed]:hidden">New Chat</span>
                 </Link>
            </SidebarMenuButton>
        </div>

        <div className="group-data-[state=expanded]:px-2 group-data-[state=expanded]:mb-2">
           <Separator className="mb-2 group-data-[state=collapsed]:hidden" />
           <MainNav />
           <Separator className="my-2 group-data-[state=collapsed]:hidden" />
        </div>

        
        <SidebarContent className="modern-scrollbar">
            <div className="px-2 group-data-[state=expanded]:hidden">
                <Separator className="my-2" />
            </div>

            {sidebarState === 'expanded' ? (
                <div className="relative px-2 mb-2">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search chats..."
                        className="pl-9 h-9 bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            ) : (
                <SidebarMenuButton tooltip="Search" size="lg" className="h-10 justify-center">
                    <Search className="h-5 w-5" />
                </SidebarMenuButton>
            )}

            {sidebarState === 'expanded' && (
              <SidebarMenu>
                    {isLoading ? (
                        Array.from({ length: 7 }).map((_, i) => <SidebarMenuSkeleton key={i} />)
                    ) : filteredSessions.length > 0 ? (
                        filteredSessions.map(session => {
                            const isActive = pathname === `/dashboard/chat/${session.id}`;
                            return (
                              <SidebarMenuItem key={session.id}>
                                    <SidebarMenuButton asChild isActive={isActive} tooltip={session.title}>
                                        <Link href={`/dashboard/chat/${session.id}`}>
                                            <MessageSquarePlus className="h-4 w-4" />
                                            <span>{session.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuAction showOnHover>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </SidebarMenuAction>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-popover border-border">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSessionToRename(session); setNewTitle(session.title); }}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShareSession(session.id); }}>
                                                <Share2 className="mr-2 h-4 w-4" />
                                                Share
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-500 hover:!bg-red-500/10" onClick={(e) => { e.stopPropagation(); setSessionToDelete(session); }}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                              </SidebarMenuItem>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 px-4 group-data-[state=collapsed]:hidden">
                            <p className="text-sm text-muted-foreground">No chat history found.</p>
                        </div>
                    )}
                </SidebarMenu>
            )}
          </SidebarContent>

        <div className="mt-auto p-2 border-t border-sidebar-border shrink-0">
            <UserNav />
        </div>


        {/* Rename Session Dialog */}
        <AlertDialog open={!!sessionToRename} onOpenChange={(open) => !open && setSessionToRename(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rename Session</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enter a new title for this chat session.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2 py-2">
                    <Label htmlFor="session-title" className="sr-only">Title</Label>
                    <Input 
                        id="session-title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleRenameSession(); }}}
                        className="bg-background/70 border-slate-600 focus:border-primary"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSessionToRename(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRenameSession}>Save</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
        {/* Delete Session Dialog */}
        <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the chat session "{sessionToDelete?.title}" and all of its messages. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSessionToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        className={cn(buttonVariants({ variant: "destructive" }))}
                        onClick={() => {
                            if (sessionToDelete) {
                                handleDeleteSession(sessionToDelete.id);
                            }
                            setSessionToDelete(null);
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
     </>
  );
}
