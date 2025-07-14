
'use server';
/**
 * @fileOverview Scheduled task for maintaining the AI's memory.
 * THIS IS A PLACEHOLDER. This code is not automatically executed.
 * It must be deployed as a scheduled function (e.g., Google Cloud Scheduler + Cloud Function, or a cron job).
 */

import { adminDb as db } from '@/lib/firebase-admin';
import type { UploadedFile } from '@/types';

/**
 * Decays the importance weight of all memory documents over time.
 * This simulates forgetting and keeps the memory system relevant.
 */
async function decayMemoryWeights() {
  if (!db) {
    console.error("Nightly Task: Firestore Admin DB not available.");
    return { success: false, message: "Firestore not initialized." };
  }
  console.log("Starting nightly memory decay task...");

  const filesSnapshot = await db.collection('uploadedFiles').get();
  if (filesSnapshot.empty) {
    console.log("No files to process.");
    return { success: true, message: "No files to process." };
  }

  const batch = db.batch();
  let processedCount = 0;
  
  filesSnapshot.forEach(doc => {
    const file = doc.data() as UploadedFile;
    const currentWeight = file.importance_weight;

    if (typeof currentWeight === 'number') {
        const DECAY_RATE = 0.98; // Daily decay rate. A weight of 1.0 becomes ~0.5 after 34 days.
        const newWeight = currentWeight * DECAY_RATE;

        // Archive or delete very unimportant memories
        const ARCHIVE_THRESHOLD = 0.01;
        if (newWeight < ARCHIVE_THRESHOLD) {
            console.log(`Archiving memory: ${doc.id} (new weight: ${newWeight})`);
            batch.update(doc.ref, { status: 'archived', importance_weight: newWeight });
        } else {
            batch.update(doc.ref, { importance_weight: newWeight });
        }
        processedCount++;
    }
  });

  await batch.commit();
  const message = `Nightly memory decay task completed. Processed ${processedCount} documents.`;
  console.log(message);
  return { success: true, message };
}

/**
 * Main function to be triggered by a scheduler.
 * @returns A summary of the task execution.
 */
export async function runNightlyTasks() {
  try {
    const result = await decayMemoryWeights();
    // Other potential nightly tasks like "rehearsal" could be added here.
    return result;
  } catch (error: any) {
    console.error("Error running nightly tasks:", error);
    return { success: false, message: error.message };
  }
}

// To use this file:
// 1. Deploy this logic as a Google Cloud Function.
//    You can create an HTTP-triggered function that calls `runNightlyTasks`.
// 2. Create a Google Cloud Scheduler job to trigger this function (e.g., every day at 2 AM).
//    - The scheduler would make an authenticated HTTP POST request to the function's trigger URL.
//    - See Firebase documentation on "Schedule functions" for a detailed guide.
