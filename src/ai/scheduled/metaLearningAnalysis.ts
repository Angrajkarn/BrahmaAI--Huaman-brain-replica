
'use server';
/**
 * @fileOverview Scheduled task for Meta-Learning Analysis.
 * THIS IS A PLACEHOLDER for a scheduled function (e.g., Cloud Scheduler).
 * This agent analyzes past interactions to adapt and improve strategies.
 */

import { adminDb as db } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import type { BrahmaAgentLog, ChatMessage, StrategyReport } from '@/types';

const STRATEGY_REGISTRY_COLLECTION = 'strategy_registry';
const AGENT_LOGS_COLLECTION = 'brahma_agent_logs';
const MESSAGES_SUBCOLLECTION = 'messages';

/**
 * The MetaControllerAgent's core logic.
 * Scans recent logs, scores performance, and updates strategy weights.
 */
async function analyzePerformance() {
  if (!db) {
    console.error("Meta-Learning Task: Firestore Admin DB not available.");
    return { success: false, message: "Firestore not initialized." };
  }
  console.log("Starting meta-learning analysis task...");

  // 1. Get all agent logs
  const logsSnapshot = await db.collection(AGENT_LOGS_COLLECTION).get();
  if (logsSnapshot.empty) {
    console.log("Meta-Learning: No agent logs to analyze.");
    return { success: true, message: "No agent logs found." };
  }

  const logs = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BrahmaAgentLog & { id: string }));
  
  // 2. Group logs by intent
  const intentReports: { [intent: string]: { confidenceScores: number[], feedbackScores: number[] } } = {};

  for (const log of logs) {
    if (!log.intent) continue;

    if (!intentReports[log.intent]) {
      intentReports[log.intent] = { confidenceScores: [], feedbackScores: [] };
    }

    intentReports[log.intent].confidenceScores.push(log.confidenceScore || 0);

    // Find the associated chat message to get feedback
    const messagesQuery = db.collectionGroup(MESSAGES_SUBCOLLECTION)
                           .where('agentLogId', '==', log.id)
                           .limit(1);

    const messageSnapshot = await messagesQuery.get();
    if (!messageSnapshot.empty) {
      const messageData = messageSnapshot.docs[0].data() as ChatMessage;
      intentReports[log.intent].feedbackScores.push(messageData.feedback || 0);
    } else {
       intentReports[log.intent].feedbackScores.push(0); // Assume neutral if no feedback or message link
    }
  }

  // 3. Calculate new scores and update the registry
  const batch = db.batch();
  let processedIntents = 0;

  for (const intent in intentReports) {
    const report = intentReports[intent];
    const totalInteractions = report.confidenceScores.length;
    
    if (totalInteractions === 0) continue;

    const averageConfidence = report.confidenceScores.reduce((a, b) => a + b, 0) / totalInteractions;
    const totalFeedbackScore = report.feedbackScores.reduce((a, b) => a + b, 0);
    const positiveFeedbackCount = report.feedbackScores.filter(s => s === 1).length;
    const negativeFeedbackCount = report.feedbackScores.filter(s => s === -1).length;
    
    // A simple performance score: equally weights confidence and feedback
    // Feedback is normalized to be between 0 and 1 before averaging
    const averageFeedback = totalFeedbackScore / totalInteractions;
    const normalizedFeedback = (averageFeedback + 1) / 2; // Converts [-1, 1] range to [0, 1]
    const performanceScore = (averageConfidence + normalizedFeedback) / 2; 

    const strategyReportData: Omit<StrategyReport, 'id' | 'lastAnalyzed'> & { lastAnalyzed: admin.firestore.FieldValue } = {
      lastAnalyzed: admin.firestore.FieldValue.serverTimestamp(),
      totalInteractions,
      positiveFeedbackCount,
      negativeFeedbackCount,
      averageConfidence: parseFloat(averageConfidence.toFixed(4)),
      performanceScore: parseFloat(performanceScore.toFixed(4)),
    };
    
    const docRef = db.collection(STRATEGY_REGISTRY_COLLECTION).doc(intent);
    batch.set(docRef, strategyReportData, { merge: true });
    processedIntents++;
  }

  await batch.commit();
  const message = `Meta-learning analysis completed. Processed ${logs.length} logs for ${processedIntents} unique intents.`;
  console.log(message);
  return { success: true, message };
}

/**
 * Main function to be triggered by a scheduler.
 */
export async function runMetaLearningAnalysis() {
  try {
    const result = await analyzePerformance();
    return result;
  } catch (error: any) {
    console.error("Error running meta-learning analysis task:", error);
    return { success: false, message: error.message };
  }
}
