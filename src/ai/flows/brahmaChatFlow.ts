

'use server';
/**
 * @fileOverview Main orchestrator flow for Brahma chat interactions.
 * This flow uses the Firebase Admin SDK, bypassing security rules.
 * It contains manual permission checks to ensure data security.
 *
 * - processUserChat - Handles a user's chat message, gets context, and returns AI response.
 * - BrahmaChatFlowInput - Input for this orchestrator.
 * - BrahmaChatFlowOutput - Output from this orchestrator.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { runBrahmaAgent, type BrahmaAgentInput } from '@/ai/flows/debateFlow';
import { generateAudio } from '@/ai/flows/textToSpeechFlow';
import type { BrahmaChatFlowInput, BrahmaChatFlowOutput, UploadedFile, ConceptualData, ChatMessage, ChatHistoryMessage } from '@/types';
import { adminDb as db } from '@/lib/firebase-admin'; // Use Firebase Admin SDK
import admin from 'firebase-admin'; // Import admin to access FieldValue

// Define Zod schemas for input and output of this orchestrator flow
const BrahmaChatFlowInputSchema = z.object({
  userId: z.string().describe("The ID of the current user."),
  chatSessionId: z.string().describe("The ID of the current chat session. Can be 'new', a temporary ID (e.g., 'temp-xxx'), or an existing session ID."),
  userQuery: z.string().describe("The user's message or question."),
  associatedFileId: z.string().nullable().optional().describe("ID of the UploadedFile context, if any."),
  currentChatSessionTitle: z.string().optional().describe("Title for a new chat session, usually derived from filename if starting with a file."),
  voiceName: z.string().optional().describe("The voice to use for the TTS response."),
});

const BrahmaChatFlowOutputSchema = z.object({
  aiResponseText: z.string().describe("The AI's generated response."),
  audioUrl: z.string().url().nullable().optional().describe("Data URI of the generated audio response."),
  newChatSessionId: z.string().optional().describe("The ID of the chat session, especially if a new one was created."),
});

// Main exported function that the frontend will call
export async function processUserChat(input: BrahmaChatFlowInput): Promise<BrahmaChatFlowOutput> {
  // Add a robust guard clause to ensure the Admin SDK was initialized and is a valid Firestore instance.
  if (!db || typeof db.collection !== 'function') {
    const errorMsg = "CRITICAL: Firebase Admin SDK is not initialized correctly. The Firestore instance is invalid. This is likely due to missing or invalid GOOGLE_APPLICATION_CREDENTIALS_JSON or NEXT_PUBLIC_FIREBASE_PROJECT_ID in your .env file. Please check server logs for more details on the initialization failure and restart the server after fixing.";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  let sessionIdForOperations: string;

  try {
    // 1. Determine and Validate Session ID for Operations
    if (input.chatSessionId === 'new' || (typeof input.chatSessionId === 'string' && input.chatSessionId.startsWith('temp-'))) {
      // Automatically generate a title from the user's first query if a title isn't provided (e.g., from file context)
      const generateTitleFromQuery = (query: string): string => {
        const words = query.trim().split(/\s+/); // Split by one or more whitespace characters
        if (words.length > 5) {
          return words.slice(0, 5).join(" ") + "...";
        }
        return query;
      };

      const newSessionData = {
        userId: input.userId,
        title: (input.associatedFileId && input.currentChatSessionTitle) 
               ? input.currentChatSessionTitle 
               : generateTitleFromQuery(input.userQuery),
        associatedFileId: input.associatedFileId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      const sessionDocRef = await db.collection("chatSessions").add(newSessionData);
      sessionIdForOperations = sessionDocRef.id;
    } else if (input.chatSessionId && typeof input.chatSessionId === 'string' && input.chatSessionId !== 'null' && !input.chatSessionId.startsWith('temp-')) {
      sessionIdForOperations = input.chatSessionId;
    } else {
      throw new Error(`Internal Server Error: Received an invalid session identifier ('${input.chatSessionId}') from the client.`);
    }

    if (!sessionIdForOperations || sessionIdForOperations.trim() === '' || sessionIdForOperations === 'new' || sessionIdForOperations === 'null' || sessionIdForOperations.startsWith('temp-')) {
        throw new Error(`Internal server error: Invalid session ID ('${sessionIdForOperations}') determined. Cannot proceed with Firestore operations.`);
    }

    // 2. Store User Message
    const userMessageData = {
      chatSessionId: sessionIdForOperations,
      sender: 'user' as 'user',
      text: input.userQuery,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection("chatSessions").doc(sessionIdForOperations).collection("messages").add(userMessageData);
    
    // 3. Fetch Document Context (with manual permission check)
    let documentTextContext: string | null = null;
    let conceptualDataContext: ConceptualData | null = null;

    if (input.associatedFileId) {
      const fileDocRef = db.collection("uploadedFiles").doc(input.associatedFileId);

      // Atomically update retrieval metadata before fetching
      await fileDocRef.update({
        retrieval_count: admin.firestore.FieldValue.increment(1),
        last_retrieved: admin.firestore.FieldValue.serverTimestamp()
      });

      const fileDocSnap = await fileDocRef.get();
      if (fileDocSnap.exists) {
        const fileData = fileDocSnap.data() as UploadedFile;
        // MANUAL PERMISSION CHECK: Since Admin SDK bypasses rules, we must check ownership in code.
        if (fileData.userId !== input.userId) {
          console.warn(`SECURITY WARNING (BLOCKED): User ${input.userId} attempted to access file ${input.associatedFileId} owned by ${fileData.userId}.`);
          throw new Error(`You do not have permission to access the specified file context.`);
        }
        
        // Prioritize the conceptual data summary if it exists, otherwise fall back to transcript
        documentTextContext = fileData.conceptualData?.summary || fileData.transcript || `No text content available for ${fileData.fileName}.`;
        conceptualDataContext = fileData.conceptualData || null;
      }
    }

    // 4. Fetch Chat History (with manual permission check)
    // MANUAL PERMISSION CHECK: Verify user owns the session before reading its history.
    const sessionDocRef = db.collection("chatSessions").doc(sessionIdForOperations);
    const sessionDocSnap = await sessionDocRef.get();
    if (!sessionDocSnap.exists || sessionDocSnap.data()?.userId !== input.userId) {
        console.warn(`SECURITY WARNING (BLOCKED): User ${input.userId} attempted to access chat history for session ${sessionIdForOperations} which they do not own or which does not exist.`);
        throw new Error(`You do not have permission to access the specified chat session.`);
    }
    
    const chatHistory: ChatHistoryMessage[] = [];
    const messagesQuery = db.collection("chatSessions").doc(sessionIdForOperations).collection("messages").orderBy("timestamp", "asc");
    const messagesSnapshot = await messagesQuery.get();
    messagesSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data() as ChatMessage;
      chatHistory.push({ sender: data.sender, text: data.text });
    });

    // 5. Call the Brahma Agent with the Knowledge Graph
    const agentInput: BrahmaAgentInput = {
      userId: input.userId,
      chatSessionId: sessionIdForOperations,
      userQuery: input.userQuery,
      documentContext: documentTextContext,
      conceptualData: conceptualDataContext, // Pass the full knowledge graph
      chatHistory: chatHistory,
    };
    const agentOutput = await runBrahmaAgent(agentInput);

    // 6. Generate Audio in parallel
    let audioData: { media: string | null } | null = null;
    try {
        if (agentOutput.responseText) {
            audioData = await generateAudio(agentOutput.responseText, input.voiceName);
        }
    } catch (audioError) {
        console.warn("TTS generation failed for this response. Proceeding without audio.", audioError);
        // Do not throw, allow the chat to continue without audio
    }

    // 7. Store AI Message
    const aiResponseData = {
      chatSessionId: sessionIdForOperations,
      sender: 'ai' as 'ai',
      text: agentOutput.responseText,
      audioUrl: audioData?.media || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      feedback: 0, // Initialize feedback as neutral
      agentLogId: agentOutput.agentLogId, // Store reference to the agent log
      detectedEmotion: agentOutput.detectedEmotion, // Store the detected emotion
    };
    await db.collection("chatSessions").doc(sessionIdForOperations).collection("messages").add(aiResponseData);
    
    // 8. Update Session's lastMessageAt
    await sessionDocRef.set({ lastMessageAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    
    return {
      aiResponseText: agentOutput.responseText,
      audioUrl: audioData?.media || null,
      newChatSessionId: sessionIdForOperations, 
    };

  } catch (e: any) {
    console.error(`Core error in processUserChat for user ${input.userId}. Input:`, JSON.stringify(input), "Error:", e.message, e.stack);
    let detailedErrorMessage = e.message || 'An unknown error occurred in the chat processing flow.';
    if (e.message && e.message.toLowerCase().includes('could not refresh access token')) {
        detailedErrorMessage = `AI Service Authentication Failed: "Could not refresh access token". This is an issue with your server's service account credentials (GOOGLE_APPLICATION_CREDENTIALS_JSON). \n1. Verify the Service Account JSON in your .env file is correct and not corrupted.\n2. Ensure the Service Account is enabled in your Google Cloud project.\n3. Make sure the "Vertex AI API" is enabled in your Google Cloud project.\n4. Check that billing is enabled for your Google Cloud project.`;
    }
    throw new Error(detailedErrorMessage); 
  }
}

const brahmaChatGenkitFlow = ai.defineFlow(
  {
    name: 'brahmaChatFlow', 
    inputSchema: BrahmaChatFlowInputSchema,
    outputSchema: BrahmaChatFlowOutputSchema,
  },
  async (input) => {
    return processUserChat(input);
  }
);
