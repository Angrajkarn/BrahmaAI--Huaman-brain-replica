
'use server';
/**
 * @fileOverview Flow for handling user feedback on chat messages and updating memory weights.
 * This flow uses the Firebase Admin SDK.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb as db } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import type { UploadedFile, ChatSession, ChatMessage } from '@/types';

// Zod schema for the input
const HandleMessageFeedbackInputSchema = z.object({
  userId: z.string().describe("The ID of the user providing feedback."),
  chatSessionId: z.string().describe("The ID of the chat session containing the message."),
  messageId: z.string().describe("The ID of the message being rated."),
  feedback: z.enum(['up', 'down']).describe("The feedback provided by the user."),
});

export type HandleMessageFeedbackInput = z.infer<typeof HandleMessageFeedbackInputSchema>;

/**
 * Calculates the new importance weight for a memory item based on various factors.
 * @param fileData The current data of the file from Firestore.
 * @returns A new importance weight score.
 */
function calculateImportanceWeight(fileData: UploadedFile): number {
  const feedbackScoreTotal = fileData.feedback_score_total || 0;
  const feedbackCount = fileData.feedback_count || 1; // Avoid division by zero
  const averageFeedback = feedbackScoreTotal / feedbackCount;

  // Recency score: decays over time. Value is between 0 and 1.
  // This example decays over a 30-day period.
  const now = Date.now();
  const lastRetrieved = fileData.last_retrieved ? fileData.last_retrieved.toDate().getTime() : now;
  const thirtyDaysInMillis = 30 * 24 * 60 * 60 * 1000;
  const recencyScore = Math.exp(-(now - lastRetrieved) / thirtyDaysInMillis);
  
  const retrievalScore = Math.log1p(fileData.retrieval_count || 0);

  // Calculate emotion score from conceptual data if not already present
  let emotionScore = fileData.emotion_score || 0;
  if (!emotionScore && fileData.conceptualData?.emotions?.length) {
      const totalIntensity = fileData.conceptualData.emotions.reduce((sum, e) => sum + (e.intensity || 0), 0);
      emotionScore = totalIntensity / fileData.conceptualData.emotions.length;
  }

  // importance_weight = (0.4 * user_feedback) + (0.2 * log1p(retrievals)) + (0.2 * recency_score) + (0.2 * emotion_score)
  const importanceWeight = 
    (0.4 * averageFeedback) +     // Feedback is heavily weighted
    (0.2 * retrievalScore) +      // Usage is important
    (0.2 * recencyScore) +        // Recent things are more important
    (0.2 * emotionScore);         // Emotional content is a factor

  return importanceWeight;
}

/**
 * Handles a user's feedback on a specific AI message.
 * @param input The feedback details from the client.
 * @returns An object indicating success and the new weight.
 */
export async function handleMessageFeedback(input: HandleMessageFeedbackInput): Promise<{ success: boolean; newWeight?: number }> {
    if (!db) {
        throw new Error("CRITICAL: Firebase Admin SDK is not initialized correctly.");
    }
    
    const { userId, chatSessionId, messageId, feedback } = input;
    const feedbackValue = feedback === 'up' ? 1 : -1;

    const sessionRef = db.collection("chatSessions").doc(chatSessionId);
    const messageRef = sessionRef.collection("messages").doc(messageId);

    try {
        // --- Security Check ---
        const sessionSnap = await sessionRef.get();
        if (!sessionSnap.exists || sessionSnap.data()?.userId !== userId) {
            throw new Error("Permission denied: You do not own this chat session.");
        }
        const sessionData = sessionSnap.data() as ChatSession;
        
        // Run transaction to ensure atomicity
        return await db.runTransaction(async (transaction) => {
            const currentMessageSnap = await transaction.get(messageRef);
            if (!currentMessageSnap.exists) {
                throw new Error("Message not found.");
            }
            const currentMessageData = currentMessageSnap.data() as ChatMessage;

            if (currentMessageData.sender !== 'ai') {
                throw new Error("Feedback can only be given on AI messages.");
            }

            // Calculate feedback score change
            const oldFeedback = currentMessageData.feedback || 0;
            const feedbackDelta = feedbackValue - oldFeedback;

            // If user clicks the same button twice, retract feedback
             if (feedbackValue === oldFeedback) {
                transaction.update(messageRef, { feedback: 0 });
                 // Also reverse the original feedback delta on the file
                 if (sessionData.associatedFileId) {
                     const fileRef = db.collection("uploadedFiles").doc(sessionData.associatedFileId);
                     transaction.update(fileRef, {
                        feedback_score_total: admin.firestore.FieldValue.increment(-feedbackValue),
                        feedback_count: admin.firestore.FieldValue.increment(-1),
                    });
                 }
                return { success: true };
            }
            
            // Update message with new feedback
            transaction.update(messageRef, { feedback: feedbackValue });

            // If there's no associated file, we're done.
            if (!sessionData.associatedFileId) {
                return { success: true };
            }

            // Update the associated file's memory scores
            const fileRef = db.collection("uploadedFiles").doc(sessionData.associatedFileId);
            const fileSnap = await transaction.get(fileRef);
            if (!fileSnap.exists) {
                // File might have been deleted, which is okay.
                return { success: true };
            }

            let fileData = fileSnap.data() as UploadedFile;

            // Update feedback scores
            fileData.feedback_score_total = (fileData.feedback_score_total || 0) + feedbackDelta;
            if (oldFeedback === 0) { // Only increment count on first feedback for this message
                fileData.feedback_count = (fileData.feedback_count || 0) + 1;
            }

            // Recalculate importance weight
            const newWeight = calculateImportanceWeight(fileData);

            transaction.update(fileRef, {
                feedback_score_total: fileData.feedback_score_total,
                feedback_count: fileData.feedback_count,
                importance_weight: newWeight,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            return { success: true, newWeight: newWeight };
        });

    } catch (error: any) {
        console.error("Error in handleMessageFeedback flow:", error);
        throw new Error(error.message || "Failed to process feedback.");
    }
}


// Define and export the Genkit flow
const handleMessageFeedbackFlow = ai.defineFlow(
  {
    name: 'handleMessageFeedbackFlow',
    inputSchema: HandleMessageFeedbackInputSchema,
    outputSchema: z.object({ success: z.boolean(), newWeight: z.number().optional() }),
  },
  async (input) => {
    return handleMessageFeedback(input);
  }
);
