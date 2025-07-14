
"use client";

import { ChatDisplay } from "@/components/dashboard/chat-display";
import type { ChatMessage, ChatSession, UploadedFile, ConceptualData, ChatHistoryMessage } from "@/types";
import { ArrowLeft, FileText, Info, Loader2, Mic, Paperclip, SendHorizonal, SidebarOpen, Cpu, AlertCircle, ShieldX, DatabaseZap, Share2, BrainCircuit, ExternalLink, Pencil, Trash2, BookOpen, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import React, { useState, useEffect, useRef } from "react";
import { processUserChat } from "@/ai/flows/brahmaChatFlow";
import { handleMessageFeedback } from "@/ai/flows/feedbackFlow";
import { generateSuggestions } from "@/ai/flows/suggestionGenerationFlow";
import { Skeleton } from "@/components/ui/skeleton";
import { db, firebaseAppInitialized, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, deleteDoc, getDocs, updateDoc, limit } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { ChatInput } from "@/components/dashboard/chat-input";
import { ChatWelcomeScreen } from "@/components/dashboard/chat-welcome-screen";
import { ChatHeader } from "@/components/dashboard/chat-header";
import { extractConceptsAndText } from "@/ai/agents/conceptExtractionAgent";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function safeConvertToDate(fieldValue: any): Date {
  if (!fieldValue) {
    return new Date();
  }
  if (fieldValue instanceof Timestamp) {
    try {
      return fieldValue.toDate();
    } catch (e) {
      console.warn("safeConvertToDate: fieldValue.toDate() failed for Timestamp:", fieldValue, "Error:", e, "Falling back.");
    }
  }
  if (typeof fieldValue === 'object' && typeof fieldValue.toDate === 'function') {
    try {
      const d = fieldValue.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) {
        return d;
      }
      console.warn("safeConvertToDate: fieldValue.toDate() returned invalid Date for object:", fieldValue, "Result:", d);
    } catch (e) {
      console.warn("safeConvertToDate: fieldValue.toDate() failed for object:", fieldValue, "Error:", e);
    }
  }
  if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
    try {
      const d = new Date(fieldValue as string | number | Date);
      if (d instanceof Date && !isNaN(d.getTime())) {
        return d;
      }
      console.warn("safeConvertToDate: new Date() returned invalid Date for string/number:", fieldValue, "Result:", d);
    } catch (e) {
      console.warn("safeConvertToDate: new Date() failed for string/number:", fieldValue, "Error:", e);
    }
  }
  console.warn("safeConvertToDate: All conversion attempts failed for value:", fieldValue, ". Returning current date as fallback.");
  return new Date();
}

const staticSuggestions = [
    {
        title: "Explore an idea together",
        prompt: "Want to explore an idea together?",
        icon: <BrainCircuit className="h-5 w-5 text-accent" />,
    },
    {
        title: "Reflect on something",
        prompt: "Need to reflect on something?",
        icon: <BookOpen className="h-5 w-5 text-accent" />,
    },
    {
        title: "Understand how I think",
        prompt: "Curious how I think? Ask me anything.",
        icon: <Cpu className="h-5 w-5 text-accent" />,
    }
];

const dynamicSuggestionIcons = [
    <BrainCircuit key="brain" className="h-5 w-5 text-accent" />,
    <BookOpen key="book" className="h-5 w-5 text-accent" />,
    <Cpu key="cpu" className="h-5 w-5 text-accent" />
];

const getFileType = (fileName: string): UploadedFile['fileType'] => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension || '')) return 'video';
  if (['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(extension || '')) return 'audio';
  if (['txt', 'md', 'rtf'].includes(extension || '')) return 'text';
  if (['pdf'].includes(extension || '')) return 'pdf';
  if (['doc', 'docx'].includes(extension || '')) return 'docx';
  if (['ppt', 'pptx'].includes(extension || '')) return 'pptx';
  if (['xls', 'xlsx'].includes(extension || '')) return 'xlsx';
  return 'unknown';
};


export default function ChatPageDetail() {
  const { currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const chatId = typeof params.chatId === 'string' ? params.chatId : 'new';
  const fileIdFromQuery = searchParams.get("fileId");

  const [session, setSession] = useState<ChatSession | null>(null);
  const [fileContext, setFileContext] = useState<UploadedFile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [criticalFirebaseError, setCriticalFirebaseError] = useState<string | null>(null);
  const [firestorePermissionError, setFirestorePermissionError] = useState<string | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [appOrigin, setAppOrigin] = useState<string>("Unavailable (server-side)");

  const [suggestions, setSuggestions] = useState(staticSuggestions);

  const [sessionToRename, setSessionToRename] = useState<ChatSession | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentChatSessionIdRef = useRef<string | null>(chatId === 'new' ? null : chatId);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin);
    }
  }, []);


 useEffect(() => {
    if (!firebaseAppInitialized) {
      setCriticalFirebaseError("CRITICAL: Firebase is not configured in .env! Update .env and RESTART server. Chat will not work.");
      setIsLoading(false);
      return;
    }
    setCriticalFirebaseError(null);
    setFirestorePermissionError(null);

    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!currentUser) {
      toast({ title: "Authentication Required", description: "Please sign in to access chat.", variant: "destructive" });
      router.push("/");
      setIsLoading(false);
      return;
    }
    
    if (chatId === 'new') {
        setIsLoading(false);
        setSession({
          id: `temp-${Date.now()}`,
          userId: currentUser.uid,
          title: "New Chat",
          createdAt: new Date(),
          lastMessageAt: new Date(),
          ...(fileIdFromQuery && { associatedFileId: fileIdFromQuery })
        });
        currentChatSessionIdRef.current = null;
        setMessages([]);

        const loadSuggestions = async () => {
          try {
            const q = query(
              collection(db, "chatSessions"),
              where("userId", "==", currentUser.uid),
              orderBy("lastMessageAt", "desc"),
              limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const lastSession = querySnapshot.docs[0].data() as ChatSession;
              if (lastSession.title) {
                const result = await generateSuggestions({ lastSessionTitle: lastSession.title });
                if (result.suggestions && result.suggestions.length === 3) {
                  const dynamicSuggestions = result.suggestions.map((s, i) => ({
                    title: s.title,
                    prompt: s.prompt,
                    icon: dynamicSuggestionIcons[i]
                  }));
                  setSuggestions(dynamicSuggestions);
                }
              }
            }
          } catch (error) {
            console.warn("Failed to generate dynamic suggestions, falling back to static.", error);
            setSuggestions(staticSuggestions);
          }
        };

        loadSuggestions();

        if (fileIdFromQuery) {
           const loadFileContext = async () => {
             const fileDocRef = doc(db, "uploadedFiles", fileIdFromQuery);
             const fileDocSnap = await getDoc(fileDocRef);
             if (fileDocSnap.exists() && fileDocSnap.data().userId === currentUser.uid) {
                setFileContext({ id: fileDocSnap.id, ...fileDocSnap.data()} as UploadedFile);
                setSession(prev => prev ? {...prev, title: `Chat about ${fileDocSnap.data().fileName}`} : prev);
             } else {
                toast({ title: "File Error", description: "Could not load the specified file context.", variant: "destructive"});
                router.replace(`/dashboard/chat/new`);
             }
           };
           loadFileContext();
        }
        return;
    }

    const initializeChat = async () => {
      setIsLoading(true);
      let currentSessionToSet: ChatSession | null = null;
      let currentFileToSet: UploadedFile | null = null;

      try {
        const sessionDocRef = doc(db, "chatSessions", chatId);
        const sessionDocSnap = await getDoc(sessionDocRef);
        if (sessionDocSnap.exists()) {
          const sessionData = sessionDocSnap.data();
           if (!sessionData) {
            toast({ title: "Chat Not Found", description: "Chat session data is missing.", variant: "destructive" });
            router.push("/dashboard/chat/new");
            return;
          }
          if (sessionData.userId !== currentUser.uid) {
             toast({ title: "Permission Denied", description: "You do not have permission to access this chat session.", variant: "destructive" });
             setFirestorePermissionError(`You (UID: ${currentUser.uid}) do not have permission to access chat session with ID: ${chatId}. This session might belong to another user or your Firestore rules are too restrictive for reading 'chatSessions/${chatId}'.`);
             router.push("/dashboard/chat/new");
             return;
          }
          currentSessionToSet = {
            id: sessionDocSnap.id,
            userId: sessionData.userId,
            title: sessionData.title,
            associatedFileId: sessionData.associatedFileId,
            createdAt: safeConvertToDate(sessionData.createdAt),
            lastMessageAt: safeConvertToDate(sessionData.lastMessageAt),
          } as ChatSession;
          currentChatSessionIdRef.current = currentSessionToSet.id;

          if (currentSessionToSet.associatedFileId) {
            const fileDocRef = doc(db, "uploadedFiles", currentSessionToSet.associatedFileId);
            const fileDocSnap = await getDoc(fileDocRef);
            if (fileDocSnap.exists()) {
              const fileData = fileDocSnap.data();
               if (fileData) { 
                  if (fileData.userId !== currentUser.uid) {
                     toast({ title: "Permission Denied", description: "Associated file context is not accessible by you.", variant: "destructive" });
                     setFirestorePermissionError(`You (UID: ${currentUser.uid}) do not have permission to access the file associated with this chat (File ID: ${currentSessionToSet.associatedFileId}). Check Firestore rules for 'uploadedFiles/${currentSessionToSet.associatedFileId}'.`);
                     currentFileToSet = null;
                  } else {
                    currentFileToSet = {
                      id: fileDocSnap.id,
                      ...fileDocSnap.data()
                    } as UploadedFile;
                  }
              }
            } else {
               toast({ title: "Context File Missing", description: "The file associated with this chat session was not found.", variant: "default" });
            }
          }
        } else {
           toast({ title: "Chat Not Found", description: "This chat session does not exist.", variant: "destructive" });
           router.push("/dashboard/chat/new");
           return;
        }
      } catch (error: any) {
          let description = "Could not load chat session or file context. ";
          const errorMessageString = typeof error === 'string' ? error : (error?.message || '');
          const errorCode = error?.code;

          if (errorCode === "permission-denied" || 
              errorMessageString.toLowerCase().includes("permission_denied") ||
              errorMessageString.toLowerCase().includes("missing or insufficient permissions")) {
             description += `Firestore permission denied. Ensure your Firestore Security Rules allow read access for user '${currentUser?.uid || "UNKNOWN_USER"}' on 'uploadedFiles' and/or 'chatSessions'. Affected path might be 'uploadedFiles/${fileIdFromQuery || session?.associatedFileId}' or 'chatSessions/${chatId}'.`;
            setFirestorePermissionError(description);
          } else if (errorMessageString.toLowerCase().includes("project") || errorMessageString.toLowerCase().includes("bad request") || errorMessageString.toLowerCase().includes("could not reach cloud firestore backend")) {
             description += "This may be due to incorrect Firebase Project ID in .env or Firestore service issues. Check .env and restart."
             setCriticalFirebaseError(description);
          } else {
             toast({ title: "Initialization Error", description: errorMessageString || description, variant: "destructive" });
          }
      }

      setSession(currentSessionToSet);
      setFileContext(currentFileToSet);
      setIsLoading(false);
    };

    initializeChat();
  }, [chatId, fileIdFromQuery, router, toast, currentUser, authLoading, firebaseAppInitialized]);

  // Effect for subscribing to messages
  useEffect(() => {
    if (!firebaseAppInitialized || criticalFirebaseError || firestorePermissionError || authLoading || !currentUser || !currentChatSessionIdRef.current || currentChatSessionIdRef.current.startsWith('temp-')) {
      if (!currentChatSessionIdRef.current || currentChatSessionIdRef.current.startsWith('temp-')) {
        setMessages([]);
      }
      return;
    }
    
    const q = query(
      collection(db, "chatSessions", currentChatSessionIdRef.current, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setFirestorePermissionError(null);
      const msgs = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          text: data.text,
          sender: data.sender,
          audioUrl: data.audioUrl,
          chatSessionId: data.chatSessionId,
          timestamp: safeConvertToDate(data.timestamp),
          feedback: data.feedback,
          detectedEmotion: data.detectedEmotion,
        } as ChatMessage;
      });
      setMessages(msgs);
    }, (error: any) => {
      let description = "Could not load messages. ";
      const errorMessageString = typeof error === 'string' ? error : (error?.message || '');
      const errorCode = error?.code;

       if (errorCode === "permission-denied" || 
           errorMessageString.toLowerCase().includes("permission_denied") ||
           errorMessageString.toLowerCase().includes("missing or insufficient permissions")) {
          description += `Firestore permission denied when fetching messages from 'chatSessions/${currentChatSessionIdRef.current}/messages'. User: '${currentUser?.uid || "UNKNOWN_USER"}'. Check Firestore Security Rules for 'messages' subcollection.`;
          setFirestorePermissionError(description);
      } else if (errorMessageString.toLowerCase().includes("project") || errorMessageString.toLowerCase().includes("bad request") || errorMessageString.toLowerCase().includes("could not reach cloud firestore backend")) {
          description += "This could be due to incorrect Firebase Project ID in .env or Firestore service issues. Check .env and restart."
          setCriticalFirebaseError(description);
      } else {
        toast({ title: "Message Fetch Error", description: errorMessageString || description, variant: "destructive" });
      }
    });
    return () => unsubscribe();
  }, [currentChatSessionIdRef.current, toast, criticalFirebaseError, firestorePermissionError, firebaseAppInitialized, currentUser, authLoading]);


  const handleSendMessage = async (text: string) => {
    if (!firebaseAppInitialized) {
      toast({ title: "Firebase Not Configured", description: "Cannot send message. Please fix Firebase configuration.", variant: "destructive" });
      setCriticalFirebaseError("Attempted to send message, but Firebase is not configured in .env. Update .env and RESTART server.");
      return;
    }
    if (!currentUser) {
      toast({ title: "Not Authenticated", description: "Please sign in to send messages.", variant: "destructive"});
      return;
    }
    if (!text.trim()) return;

    setIsAISpeaking(true);
    setFirestorePermissionError(null); 

    try {
      const flowInput = {
        userId: currentUser.uid,
        chatSessionId: currentChatSessionIdRef.current || 'new',
        userQuery: text,
        associatedFileId: fileContext?.id || fileIdFromQuery || null,
        currentChatSessionTitle: fileContext ? `Chat about ${fileContext.fileName}` : undefined,
      };

      const result = await processUserChat(flowInput);
      
      if (result.newChatSessionId && (!currentChatSessionIdRef.current || currentChatSessionIdRef.current.startsWith('temp-'))) {
        const newPath = `/dashboard/chat/${result.newChatSessionId}`;
        router.replace(newPath, { scroll: false }); 
        currentChatSessionIdRef.current = result.newChatSessionId;
      }

      if (result.audioUrl && audioRef.current) {
        audioRef.current.src = result.audioUrl;
        audioRef.current.play().catch(e => console.error("Error auto-playing audio:", e));
      }

    } catch (error: any) {
      let description = "Could not send message or get AI response. ";
      const errorMessageString = typeof error === 'string' ? error : (error?.message || '');
      const errorCode = error?.code;

      let isPermissionError = false;
      if (errorCode === "permission-denied" || 
          errorMessageString.toLowerCase().includes("permission_denied") ||
          errorMessageString.toLowerCase().includes("missing or insufficient permissions")) {
          isPermissionError = true;
      }

      if (isPermissionError) {
        description += `Firestore permission denied during chat processing. User: '${currentUser.uid}'. This could be on creating a new session, writing messages to 'chatSessions/${currentChatSessionIdRef.current || 'potential_new_session'}/messages', or updating 'chatSessions/${currentChatSessionIdRef.current || 'potential_new_session'}'. Check Firestore Security Rules.`;
        if(errorMessageString.toLowerCase().includes("/null/")){
           description += " The error indicates an issue with using 'null' as a session ID. This might happen if the URL contains '/chat/null' or if session creation failed.";
        }
        setFirestorePermissionError(description);
      } else if (errorMessageString.toLowerCase().includes("project") || errorMessageString.toLowerCase().includes("bad request") || errorMessageString.toLowerCase().includes("could not reach cloud firestore backend") || errorMessageString.toLowerCase().includes("internal server error")) {
          description += "This could be due to incorrect Firebase Project ID in .env, Firestore service issues, or an internal error in the chat flow. Check .env and restart."
          if(errorMessageString.toLowerCase().includes("invalid session id")){
              description += ` Specific error: ${errorMessageString}. This often points to an issue initializing or identifying the chat session.`
          }
          setCriticalFirebaseError(description);
      } else {
        toast({ title: "Chat Error", description: errorMessageString || description, variant: "destructive" });
      }
    } finally {
      setIsAISpeaking(false);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!firebaseAppInitialized || !storage) {
        toast({ title: "Firebase Not Configured", description: "Cannot upload file.", variant: "destructive" });
        return;
    }
    if (!currentUser) {
        toast({ title: "Not Authenticated", description: "Please sign in to upload files.", variant: "destructive"});
        return;
    }

    const { id: toastId } = toast({ title: "Upload Started", description: `Uploading ${file.name}...` });

    const fileType = getFileType(file.name);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${currentUser.uid}/${Date.now()}-${sanitizedFileName}`;
    const storageRefInstance = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRefInstance, file);

    uploadTask.on('state_changed',
        (snapshot) => { /* Progress can be handled here if needed */ },
        (error) => {
            toast({ id: toastId, title: "Upload Failed", description: error.message, variant: "destructive" });
        },
        async () => {
            try {
                toast({ id: toastId, title: "Processing File", description: "Extracting knowledge..." });
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                const agentResult = await extractConceptsAndText({
                    fileName: file.name,
                    fileType: fileType,
                    fileDownloadUrl: downloadURL,
                });

                const fileDocData = {
                    userId: currentUser.uid,
                    fileName: file.name,
                    fileType: fileType,
                    storagePath: storagePath,
                    downloadUrl: downloadURL,
                    status: "completed",
                    transcript: agentResult.extractedText,
                    conceptualData: agentResult.conceptualData || null,
                    summary: agentResult.conceptualData?.summary || null,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                };

                const docRef = await addDoc(collection(db, "uploadedFiles"), fileDocData);
                toast({ id: toastId, title: "File Ready!", description: `${file.name} has been processed.` });
                
                // Redirect to a new chat with the file context
                router.push(`/dashboard/chat/new?fileId=${docRef.id}`);

            } catch (error: any) {
                toast({ id: toastId, title: "Processing Failed", description: error.message || "Could not save file metadata.", variant: "destructive" });
            }
        }
    );
  };

  const handleFeedback = async (messageId: string, feedback: 'up' | 'down') => {
    if (!currentUser || !currentChatSessionIdRef.current) {
        toast({ title: "Error", description: "Cannot submit feedback. Not authenticated or session not found.", variant: "destructive" });
        return;
    }
    try {
      await handleMessageFeedback({
        userId: currentUser.uid,
        chatSessionId: currentChatSessionIdRef.current,
        messageId: messageId,
        feedback: feedback,
      });
      toast({
        title: "Feedback Received!",
        description: "Thanks for helping Brahma learn and improve.",
      });
    } catch (e: any) {
      toast({
        title: "Feedback Error",
        description: e.message || "Could not save your feedback.",
        variant: "destructive",
      });
    }
  };
  
  const playAudioResponse = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
  };

   const handleShare = () => {
    if (!currentChatSessionIdRef.current || currentChatSessionIdRef.current.startsWith('temp-')) {
        toast({ title: "Cannot Share", description: "Please send a message to save the session before sharing.", variant: "destructive" });
        return;
    }
    const url = `${window.location.origin}/dashboard/chat/${currentChatSessionIdRef.current}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "A shareable link to this chat has been copied to your clipboard.",
    });
  };

  const handleDelete = async () => {
    if (!sessionToDelete || !currentUser) return;
    
    const sessionId = sessionToDelete.id;
    setSessionToDelete(null); 

    try {
      const messagesQuery = query(collection(db, "chatSessions", sessionId, "messages"));
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map(messageDoc => 
        deleteDoc(doc(db, "chatSessions", sessionId, "messages", messageDoc.id))
      );
      await Promise.all(deletePromises);
      
      await deleteDoc(doc(db, "chatSessions", sessionId));

      toast({ title: "Session Deleted", description: "The chat session and its messages have been removed." });
      router.push('/dashboard/chat/new');
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({ title: "Deletion Failed", description: "Could not delete the session.", variant: "destructive" });
    }
  };

  const handleArchive = () => {
      toast({
          title: "Archive (Coming Soon!)",
          description: "This feature is not yet implemented.",
      });
  };

  const handleRename = async () => {
    if (!sessionToRename || !newTitle.trim() || !currentUser) {
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
      setSession(prev => prev ? {...prev, title: newTitle.trim()} : null);
    } catch (error) {
       console.error("Error renaming session:", error);
       toast({ title: "Rename Failed", description: "Could not rename the session.", variant: "destructive" });
    } finally {
        setSessionToRename(null);
        setNewTitle("");
    }
  };

  const isEnvMisconfigured =
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes("YOUR_PROJECT_ID_HERE") ||
    !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.includes("YOUR_STORAGE_BUCKET_HERE") ||
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("YOUR_API_KEY_HERE");

  const isFirebaseMisconfigured = !firebaseAppInitialized || isEnvMisconfigured || !!criticalFirebaseError || !!firestorePermissionError;

  if (authLoading || (isLoading && chatId !== 'new')) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="flex-1 min-h-0 flex items-center justify-center">
            <Cpu className="h-12 w-12 animate-spin text-primary" />
        </div>
        <div className="flex-shrink-0 w-full">
            <ChatInput onSendMessage={() => {}} onFileSelect={() => {}} disabled={true} />
        </div>
      </div>
    );
  }
  
  const showWelcomeScreen = (chatId === 'new' && messages.length === 0 && !fileIdFromQuery);

  if (isFirebaseMisconfigured) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <Alert variant="default" className="mt-4 bg-primary/10 border-primary/30 text-primary-foreground max-w-2xl">
            {isEnvMisconfigured || criticalFirebaseError?.includes(".env") ? <DatabaseZap className="h-5 w-5 text-red-400" /> : <ShieldAlert className="h-5 w-5 text-red-400" />}
            <AlertTitle className="font-semibold text-red-300">
                {isEnvMisconfigured ? "CRITICAL: Firebase .env Configuration Incomplete!" :
                    criticalFirebaseError?.toLowerCase().includes("cors") ? "Firebase Storage CORS Issue!" :
                    criticalFirebaseError ? "Firebase Connection/Configuration Issue!" :
                    firestorePermissionError ? "Firebase Permission Issue!" : "Firebase Configuration Issue!"
                }
            </AlertTitle>
            <AlertDescription className="space-y-2 text-xs text-red-400/90">
                {isEnvMisconfigured && (
                    <p>Your <code>.env</code> file is missing essential Firebase project details or contains placeholder values. Firebase services **WILL NOT WORK**. Please update <code>.env</code> and **RESTART** your Next.js server.</p>
                )}
                {criticalFirebaseError && !isEnvMisconfigured && <p>{criticalFirebaseError}</p>}
                {firestorePermissionError && <p>{firestorePermissionError}</p>}
                <p className="font-semibold mt-2 text-red-300/90">Key Troubleshooting Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Correct <code>.env</code> File Values</strong>: Double-check all <code>NEXT_PUBLIC_FIREBASE_...</code> variables.</li>
                    <li><strong>Restart Server</strong>: After any <code>.env</code> changes, **YOU MUST RESTART** your dev server.</li>
                    <li>
                        <strong>Firestore Security Rules</strong>: (Firebase Console &gt; Firestore &gt; Rules). Ensure they allow access. Example:
                        <pre className="mt-1 p-1.5 bg-slate-800/50 rounded text-xs overflow-x-auto whitespace-pre-wrap text-slate-300">
                          {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /uploadedFiles/{fileId} {
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    match /chatSessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
      match /messages/{messageId} {
        allow read, write: if request.auth != null && get(/databases/$(database)/documents/chatSessions/$(sessionId)).data.userId == request.auth.uid;
      }
    }
  }
}`}
                        </pre>
                    </li>
                </ol>
            </AlertDescription>
        </Alert>
      </div>
    );
  }


  if (!session && !isLoading && chatId !== 'new') {
    return (
        <div className="flex flex-col h-full items-center justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="mt-4 text-muted-foreground">Chat session not found.</p>
             <Link href="/dashboard/chat/new"><Button variant="link">Start a new chat</Button></Link>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {session && !showWelcomeScreen && (
        <ChatHeader
          sessionTitle={session.title}
          onShare={handleShare}
          onDelete={() => setSessionToDelete(session)}
          onArchive={handleArchive}
          onRename={() => {
            setSessionToRename(session);
            setNewTitle(session.title);
          }}
        />
      )}
      <div className="flex-1 min-h-0 overflow-y-auto modern-scrollbar">
          {showWelcomeScreen ? (
              <ChatWelcomeScreen suggestions={suggestions} onSendMessage={handleSendMessage} disabled={isAISpeaking} />
          ) : (
              <ChatDisplay messages={messages} isAISpeaking={isAISpeaking} onPlayAudio={playAudioResponse} onFeedback={handleFeedback} />
          )}
      </div>
      <div className="flex-shrink-0">
        <ChatInput onSendMessage={handleSendMessage} onFileSelect={handleFileUpload} disabled={isAISpeaking || !!criticalFirebaseError || !!firestorePermissionError} />
      </div>
       <audio ref={audioRef} className="hidden" />
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
                        onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleRename(); }}}
                        className="bg-background/70 border-slate-600 focus:border-primary"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSessionToRename(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRename}>Save</AlertDialogAction>
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
                        onClick={handleDelete}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
