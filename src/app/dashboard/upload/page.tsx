
"use client";

import { FileUploadCard } from "@/components/dashboard/file-upload-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UploadedFile, ConceptualData } from "@/types";
import { FileText, FileVideo, FileAudio, CheckCircle, AlertTriangle, MoreHorizontal, Trash2, FileQuestion, File as FileIcon, ShieldAlert, DatabaseZap, Computer, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { storage, db, firebaseAppInitialized } from "@/lib/firebase"; 
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, query, where, onSnapshot, orderBy, Timestamp, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { extractConceptsAndText } from "@/ai/agents/conceptExtractionAgent";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Helper function to determine file type from filename
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

// Component for displaying a file type icon
const FileTypeIcon = ({ fileType }: { fileType: UploadedFile['fileType'] }) => {
  if (fileType === 'video') return <FileVideo className="h-5 w-5 text-primary" />;
  if (fileType === 'audio') return <FileAudio className="h-5 w-5 text-accent" />;
  if (fileType === 'text') return <FileText className="h-5 w-5 text-green-500" />;
  if (fileType === 'pdf') return <FileIcon className="h-5 w-5 text-yellow-500" />; 
  if (['doc', 'docx'].includes(fileType)) return <FileText className="h-5 w-5 text-blue-500" />;
  if (['ppt', 'pptx'].includes(fileType)) return <FileIcon className="h-5 w-5 text-orange-500" />;
  if (['xls', 'xlsx'].includes(fileType)) return <FileIcon className="h-5 w-5 text-emerald-500" />;
  return <FileQuestion className="h-5 w-5 text-muted-foreground" />;
};

// Component for displaying status indicator
const StatusIndicator = ({ status }: { status: UploadedFile['status'] }) => {
  if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (status === 'processing' || status === 'uploading') return <BrahmaLogoIcon className="h-5 w-5 animate-spin" />;
  if (status === 'error') return <AlertTriangle className="h-5 w-5 text-red-500" />;
  return null;
};

// Safely convert Firestore Timestamp or other date formats to a JS Date object
function safeConvertToDate(fieldValue: any): Date {
  if (fieldValue instanceof Timestamp) {
    return fieldValue.toDate();
  }
  if (fieldValue && typeof fieldValue === 'object' && typeof fieldValue.toDate === 'function') {
    try {
      const d = fieldValue.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) {
        return d;
      }
    } catch (e) {
    }
  }
  if (fieldValue) {
     try {
        const d = new Date(fieldValue as string | number | Date);
        if (d instanceof Date && !isNaN(d.getTime())) {
            return d;
        }
     } catch (e) {
     }
  }
  return new Date();
}

// SVG for Google Drive icon
const GoogleDriveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M7.7071 3.5L12 12H3.41421L7.7071 3.5Z" fill="#34A853"/>
        <path d="M16.2929 3.5L20.5858 12H12L16.2929 3.5Z" fill="#FFC107"/>
        <path d="M3.41421 12L7.7071 20.5H16.2929L20.5858 12H3.41421Z" fill="#4285F4"/>
    </svg>
)

export default function UploadPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState<UploadedFile | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [appOrigin, setAppOrigin] = useState<string>("Unavailable (server-side)");

  const [criticalFirebaseError, setCriticalFirebaseError] = useState<string | null>(null);
  const [firestorePermissionError, setFirestorePermissionError] = useState<string | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setAppOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!firebaseAppInitialized) {
      const errorMsg = "CRITICAL: Firebase is not configured in .env! Update .env and RESTART server. Firebase services will not work.";
      setCriticalFirebaseError(errorMsg);
      return; 
    }
    setCriticalFirebaseError(null);
    setFirestorePermissionError(null); 

    if (authLoading) return; 

    if (!currentUser) {
      router.push("/");
      return;
    }

    const q = query(
      collection(db, "uploadedFiles"),
      where("userId", "==", currentUser.uid), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setFirestorePermissionError(null); 
      const filesData = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          fileName: data.fileName,
          fileType: data.fileType,
          storagePath: data.storagePath,
          downloadUrl: data.downloadUrl,
          transcript: data.transcript,
          summary: data.summary,
          conceptualData: data.conceptualData,
          status: data.status,
          createdAt: safeConvertToDate(data.createdAt),
          updatedAt: safeConvertToDate(data.updatedAt),
        } as UploadedFile;
      });
      setUploads(filesData);
    }, (error: any) => {
      let description = "Could not fetch existing uploads. ";
      const errorMessageString = typeof error === 'string' ? error : (error?.message || '');
      const errorCode = error?.code;

      if (errorCode === "permission-denied" || 
          errorMessageString.toLowerCase().includes("permission_denied") ||
          errorMessageString.toLowerCase().includes("missing or insufficient permissions")) {
        description = `Firestore permission denied when trying to read 'uploadedFiles'. User ID: ${currentUser.uid}. Please check your Firestore Security Rules. Example: \`match /uploadedFiles/{fileId} { allow read: if request.auth.uid == resource.data.userId; }\``;
        setFirestorePermissionError(description);
      } else if (errorMessageString.toLowerCase().includes("project") || errorMessageString.toLowerCase().includes("bad request") || errorMessageString.toLowerCase().includes("could not reach cloud firestore backend")) {
        description += "This might be due to an incorrect Project ID in your .env file or Firestore not being properly set up. Verify .env and restart the server.";
        setCriticalFirebaseError(description);
      } else {
        description += "Check Firestore connection and rules. See console for detailed errors.";
      }
    });

    return () => unsubscribe();
  }, [toast, currentUser, authLoading, router, firebaseAppInitialized]);

  const handleFileUpload = (files: FileList | null) => {
    if (!firebaseAppInitialized) {
      return;
    }
    if (!currentUser) {
      router.push("/");
      return;
    }
    if (!files || files.length === 0) return;
    if (uploadingFile && (uploadingFile.status === 'uploading' || uploadingFile.status === 'processing')) {
      toast({ title: "In Progress", description: "Another file operation is already in progress.", variant: "default" });
      return;
    }
    
    setIsUploadModalOpen(false); // Close the modal
    const fileToUpload = files[0];
    const tempId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const fileType = getFileType(fileToUpload.name);
    const sanitizedFileName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${currentUser.uid}/${tempId}/${sanitizedFileName}`; 
    
    const currentUploadProcess: UploadedFile = {
      id: tempId, 
      userId: currentUser.uid, 
      fileName: fileToUpload.name,
      fileType: fileType,
      storagePath: storagePath,
      status: "uploading", 
      uploadProgress: 0,
      createdAt: new Date(), 
      updatedAt: new Date(),
    };
    setUploadingFile(currentUploadProcess);
    setFirestorePermissionError(null); 
    setCriticalFirebaseError(null);

    const storageRefInstance = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRefInstance, fileToUpload);

    uploadTask.on('state_changed',
      (snapshot) => { 
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadingFile(prev => prev ? {...prev, uploadProgress: progress, status: 'uploading'} : null);
      },
      (error: any) => { 
        let title = "Storage Upload Failed";
        let description = `Error: ${error.code || error.message || 'Unknown storage error'}.`;
        const errorMessageString = typeof error === 'string' ? error : (error?.message || '');
        const errorCode = error?.code;
        
        if (errorCode === 'storage/unauthorized' || 
            errorMessageString.toLowerCase().includes("permission_denied") || // More generic check for permission denied
            errorMessageString.toLowerCase().includes("storage/unauthorized")) {
            title = "Storage Permission Denied";
            description = `Firebase Storage Error: User does not have permission to access '${storagePath}'. User UID: ${currentUser.uid}.
            1) **CHECK FIREBASE STORAGE RULES**: Your rules in the Firebase Console (Storage > Rules) MUST allow writes for user '${currentUser.uid}' to the path '${storagePath}'.
            Example rule: \`match /uploads/{userId}/{allPaths=**} { allow read, write: if request.auth != null && request.auth.uid == userId; }\`
            2) Ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env is correct.`;
            setFirestorePermissionError(description); // Use a general permission error state or a specific storage one
        } else if (errorMessageString.toLowerCase().includes("cors policy") || errorCode === 'storage/object-not-found' || errorMessageString.toLowerCase().includes("does not have http ok status")) {
             title = "Storage CORS or Path Issue";
             description = `A CORS policy error occurred. Your Firebase Storage bucket MUST be configured to allow requests from your app's origin ('${appOrigin}'). This requires a manual configuration change on your Firebase Storage bucket using 'gsutil'.
            See detailed instructions in the alert on this page or in the browser console.`;
            setCriticalFirebaseError(description); 
        } else {
            description += " Check Firebase Storage setup, network, .env config, Storage CORS & Rules. See browser console for more details.";
             setCriticalFirebaseError(description);
        }

        setUploadingFile(prev => prev ? {...prev, status: "error", uploadProgress: 0} : null);
        toast({ title: title, description, variant: "destructive", duration: 30000 });
        setTimeout(() => setUploadingFile(null), 15000); 
      },
      async () => { 
        toast({ title: "Upload Complete", description: "Building knowledge graph..." });
        setUploadingFile(prev => prev ? {...prev, status: "processing", uploadProgress: 100} : null); 
        
        let extractedTextContent: string | null = null;
        let conceptualDataContent: ConceptualData | null = null;

        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          try {
            const agentResult = await extractConceptsAndText({
              fileName: fileToUpload.name,
              fileType: fileType,
              fileDownloadUrl: downloadURL,
            });
            extractedTextContent = agentResult.extractedText;
            conceptualDataContent = agentResult.conceptualData || null;
            toast({ title: "Knowledge Graph Generated", description: "Simulated ontology has been built from the file content." });
          } catch (extractionError: any) {
            const extractionErrorMessage = typeof extractionError === 'string' ? extractionError : (extractionError?.message || 'Unknown extraction error');
            toast({ title: "Knowledge Graph Failed", description: `Could not build graph: ${extractionErrorMessage}. Proceeding with limited context.`, variant: "destructive" });
          }

          const fileDocData: Omit<UploadedFile, 'id' | 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = {
            userId: currentUser.uid, 
            fileName: fileToUpload.name,
            fileType: fileType,
            storagePath: storagePath,
            downloadUrl: downloadURL,
            status: "completed", 
            transcript: extractedTextContent, 
            conceptualData: conceptualDataContent,
            summary: conceptualDataContent?.summary || null, // Use summary from conceptual data
            createdAt: serverTimestamp(), 
            updatedAt: serverTimestamp(),
          };
          
          await addDoc(collection(db, "uploadedFiles"), fileDocData);
          
          toast({ title: "File Processed", description: `${fileToUpload.name} has been saved and analyzed.` });
          setUploadingFile(null); 
        } catch (error: any) { 
            let firestoreErrorDesc = "File uploaded and analyzed, but metadata couldn't be saved to Firestore. ";
            const errorMessageString = typeof error === 'string' ? error : (error?.message || '');
            const errorCode = error?.code;

            if (errorCode === "permission-denied" || 
                errorMessageString.toLowerCase().includes("permission_denied") ||
                errorMessageString.toLowerCase().includes("missing or insufficient permissions")) {
                 firestoreErrorDesc += `Firestore permission denied when trying to save metadata for '${fileToUpload.name}'. User ID: ${currentUser.uid}. Please check your Firestore Security Rules. Example: \`match /uploadedFiles/{fileId} { allow write: if request.auth.uid == request.resource.data.userId; }\``;
                 setFirestorePermissionError(firestoreErrorDesc);
            } else if (errorMessageString.toLowerCase().includes("project") || errorMessageString.toLowerCase().includes("bad request") || errorMessageString.toLowerCase().includes("could not reach cloud firestore backend")) {
                firestoreErrorDesc += "This could be due to incorrect NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env or Firestore security rules."
                setCriticalFirebaseError("Firestore operation failed. Check NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env and Firestore setup. Restart server after .env changes.");
            } else {
                firestoreErrorDesc += `${errorMessageString}. Check Firestore rules and console for errors.`;
                 setCriticalFirebaseError(firestoreErrorDesc);
            }
            setUploadingFile(prev => prev ? {...prev, status: "error" } : null); 
            toast({ title: "Saving Metadata Failed", description: firestoreErrorDesc, variant: "destructive", duration: 20000 });
            setTimeout(() => setUploadingFile(null), 10000);
        }
      }
    );
  };
  
  const handleFileFromComputer = () => {
    fileInputRef.current?.click();
  };

  const handleFileChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        handleFileUpload(e.target.files);
    }
    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!firebaseAppInitialized || !currentUser) {
      return;
    }
    if (file.userId !== currentUser.uid) {
      return;
    }
    if (!file.id || !file.storagePath) {
      toast({ title: "Error", description: "File information is missing for deletion.", variant: "destructive" });
      return;
    }

    try {
      const storageRefInstance = ref(storage, file.storagePath);
      await deleteObject(storageRefInstance);
      await deleteDoc(doc(db, "uploadedFiles", file.id));
      toast({ title: "File Deleted", description: `${file.fileName} has been removed.` });
    } catch (error: any) {
      let deleteErrorDesc = `Could not delete file. `;
      const errorMessageString = typeof error === 'string' ? error : (error?.message || error.code || '');
      const errorCode = error?.code;

      if (errorCode === 'storage/unauthorized' || 
          errorCode === 'permission-denied' || 
          errorMessageString.toLowerCase().includes("permission_denied") ||
          errorMessageString.toLowerCase().includes("storage/unauthorized") ||
          errorMessageString.toLowerCase().includes("missing or insufficient permissions")) {
        deleteErrorDesc += `Firebase Storage or Firestore permission denied. Ensure your rules allow delete operations for user '${currentUser.uid}'. Check both Storage and Firestore rules.`;
        setFirestorePermissionError(deleteErrorDesc); 
      } else {
        deleteErrorDesc += `${errorMessageString}. Check console and Firebase rules.`
        setCriticalFirebaseError(deleteErrorDesc); 
      }
      toast({ title: "Deletion Failed", description: deleteErrorDesc, variant: "destructive" });
    }
  };

  if (authLoading && !currentUser) { 
    return <div className="flex justify-center items-center py-10"><BrahmaLogoIcon className="h-12 w-12 animate-spin" /></div>;
  }

  const isEnvMisconfigured =
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.includes("YOUR_PROJECT_ID_HERE") ||
    !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.includes("YOUR_STORAGE_BUCKET_HERE") ||
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes("YOUR_API_KEY_HERE");

  const isFirebaseMisconfigured = !firebaseAppInitialized || isEnvMisconfigured || criticalFirebaseError || firestorePermissionError;


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Upload Your Content</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Add video, audio, PDF, or text files to build context for Brahma. A knowledge graph will be automatically (simulated) built.
        </p>
        {isFirebaseMisconfigured && (
            <Alert variant="default" className="mt-4 bg-primary/10 border-primary/30 text-primary-foreground">
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
                        <p>Your <code>.env</code> file is missing essential Firebase project details or contains placeholder values (e.g., &quot;YOUR_PROJECT_ID_HERE&quot;).
                        Firebase services **WILL NOT WORK**. Please update <code>.env</code> and **RESTART** your Next.js server.</p>
                    )}
                    {criticalFirebaseError && !isEnvMisconfigured && <p>{criticalFirebaseError}</p>}
                    {firestorePermissionError && <p>{firestorePermissionError}</p>}

                    <p className="font-semibold mt-2 text-red-300/90">Key Troubleshooting Steps:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li><strong>Correct <code>.env</code> File Values</strong>: Double-check all <code>NEXT_PUBLIC_FIREBASE_...</code> variables in <code>.env</code> against your Firebase project's actual values (Project ID, Storage Bucket, API Key, Auth Domain, etc.).</li>
                        <li><strong>Restart Server</strong>: After any <code>.env</code> changes, **YOU MUST RESTART** your Next.js server (e.g., stop and re-run <code>npm run dev</code>).</li>
                        <li>
                            <strong>Firebase Storage Rules</strong>: (Firebase Console &gt; Storage &gt; Rules). Ensure they allow reads/writes for authenticated users. Example for user <code>{currentUser?.uid || "{YOUR_USER_ID}"}</code>:
                            <pre className="mt-1 p-1.5 bg-slate-800/50 rounded text-xs overflow-x-auto whitespace-pre-wrap text-slate-300">
                              {`rules_version = '2';
service firebase.storage {
  match /b/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_BUCKET_NAME.appspot.com"}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
                            </pre>
                        </li>
                        <li><strong>Firebase Firestore Rules</strong>: (Firebase Console &gt; Firestore Database &gt; Rules). Ensure they allow reads/writes for relevant collections for authenticated users based on `request.auth.uid`. Example:
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
                        <li>
                            <strong>Firebase Storage CORS Configuration</strong>: If you see CORS errors for <code>firebasestorage.googleapis.com</code>, your Storage bucket needs to allow requests from your app's origin.
                            Your app's origin is: {isMounted ? (<code>{appOrigin}</code>) : (<code>Unavailable (server-side)</code>)}.
                            Create a <code>cors.json</code> file:
                            <pre className="mt-1 p-1.5 bg-slate-800/50 rounded text-xs overflow-x-auto whitespace-pre-wrap text-slate-300">
                              {`[
  {
    "origin": ["${isMounted ? appOrigin : "YOUR_APP_ORIGIN_HERE_e.g._http://localhost:9002"}", "${isMounted && appOrigin.startsWith('http://localhost') ? 'http://localhost:3000' : appOrigin}"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "Authorization", "X-Goog-Upload-Protocol"],
    "maxAgeSeconds": 3600
  }
]`}
                            </pre>
                             Apply with: <code>gsutil cors set cors.json gs://{process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-bucket.appspot.com"}</code> (replace with your actual bucket name).
                        </li>
                    </ol>
                </AlertDescription>
            </Alert>
        )}
      </header>

      <FileUploadCard 
        onCardClick={() => setIsUploadModalOpen(true)}
        disabled={isFirebaseMisconfigured || (!!uploadingFile && (uploadingFile.status === 'uploading' || uploadingFile.status === 'processing'))}
      />
      
      {/* Hidden file input, controlled by the dialog */}
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChangeEvent}
        accept=".mp4,.mov,.mp3,.wav,.txt,.pdf,.docx,.pptx,.xlsx"
      />

      {/* Upload Options Dialog */}
       <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogContent className="glassmorphism-card sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="gradient-text text-xl">Choose Upload Source</DialogTitle>
                    <DialogDescription>
                        Select where you'd like to import your content from.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                    <Button variant="outline" className="h-24 flex-col gap-2 text-base border-slate-600 hover:border-primary" onClick={handleFileFromComputer}>
                        <Computer className="h-8 w-8 text-primary"/>
                        From Computer
                    </Button>
                     <Button variant="outline" className="h-24 flex-col gap-2 text-base border-slate-600 hover:border-accent" disabled>
                        <GoogleDriveIcon className="h-8 w-8" />
                        Google Drive
                    </Button>
                    <Button variant="outline" className="h-24 flex-col gap-2 text-base sm:col-span-2 border-slate-600 hover:border-yellow-500" disabled>
                        <LinkIcon className="h-8 w-8 text-yellow-500"/>
                        From Web Link
                    </Button>
                </div>
            </DialogContent>
        </Dialog>


      <Card className="glassmorphism-card">
        <CardHeader>
          <CardTitle className="gradient-text">Upload Status & Recent Files</CardTitle>
          <CardDescription>Manage your uploaded files. If uploads fail, carefully check the troubleshooting steps above, your Firebase configuration and rules. See browser console for detailed errors.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {uploadingFile && (
              <li key={uploadingFile.id} className="flex items-center space-x-4 p-4 bg-slate-800/70 rounded-lg shadow-md border border-primary/50">
                <FileTypeIcon fileType={uploadingFile.fileType} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate" title={uploadingFile.fileName}>{uploadingFile.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadingFile.fileType} -
                    {uploadingFile.status === 'uploading' && `Uploading...`}
                    {uploadingFile.status === 'processing' && `Building knowledge graph...`}
                    {uploadingFile.status === 'error' && `Error during operation`}
                  </p>
                  {uploadingFile.status === 'uploading' && uploadingFile.uploadProgress !== undefined && (
                      <div className="mt-1">
                        <Progress value={uploadingFile.uploadProgress} className="h-1.5 w-full md:w-3/4" />
                        <p className="text-xs text-yellow-400 mt-0.5">{Math.round(uploadingFile.uploadProgress)}%</p>
                      </div>
                  )}
                  {uploadingFile.status === 'processing' && <BrahmaLogoIcon className="h-4 w-4 animate-spin mt-1" />}
                  {uploadingFile.status === 'error' && <p className="text-xs text-red-400 mt-0.5">Operation failed. See notifications or console for details.</p>}
                </div>
                <StatusIndicator status={uploadingFile.status} />
              </li>
            )}

            {uploads.length === 0 && !uploadingFile && !firebaseAppInitialized && criticalFirebaseError ? (
                 <p className="text-destructive text-center py-8">Cannot load files. Firebase initialization failed. {criticalFirebaseError}</p>
            ) : uploads.length === 0 && !uploadingFile && firestorePermissionError ? (
                 <p className="text-destructive text-center py-8">Cannot load files. {firestorePermissionError}</p>
            ) : uploads.length === 0 && !uploadingFile && !authLoading && !currentUser ? (
                 <p className="text-muted-foreground text-center py-8">Please sign in to view and upload files.</p>
            ) : uploads.length === 0 && !uploadingFile ? (
              <p className="text-muted-foreground text-center py-8">No files uploaded yet. Start by uploading a file above.</p>
            ) : (
              uploads.map((file) => (
                <li key={file.id} className="flex items-center space-x-4 p-4 bg-slate-800/50 rounded-lg shadow-sm hover:bg-slate-700/50 transition-colors">
                  <FileTypeIcon fileType={file.fileType} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate" title={file.fileName}>{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'} - {file.fileType} - {file.status}
                    </p>
                    {(file.status === 'uploading' || file.status === 'processing') && file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                       <div className="mt-1">
                         <Progress value={file.uploadProgress} className="h-1.5 w-full md:w-1/2" />
                         <p className="text-xs text-yellow-400 mt-0.5">{Math.round(file.uploadProgress)}% {file.status}</p>
                       </div>
                    )}
                     {file.status === 'error' && <p className="text-xs text-red-400 mt-0.5">Processing failed</p>}
                  </div>
                  <StatusIndicator status={file.status} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border">
                      {file.status === "completed" && (
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/chat/new?fileId=${file.id}`)}>
                          Start Chat
                        </DropdownMenuItem>
                       )}
                      <DropdownMenuItem className="text-red-500 hover:!bg-red-500/10" onClick={() => handleDelete(file)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
