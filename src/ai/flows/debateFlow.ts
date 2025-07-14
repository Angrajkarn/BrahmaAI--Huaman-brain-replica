
'use server';
/**
 * @fileOverview Implements the Brahma agent, a modular reasoning system that follows
 * a perceive-think-act pipeline. This version simulates an advanced RAG system
 * with hybrid search, multi-hop reasoning, and a "thought chain" process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb as db } from '@/lib/firebase-admin';
import admin from 'firebase-admin';
import type { ChatHistoryMessage, BrahmaAgentInput, BrahmaAgentOutput, BrahmaAgentLog, ConceptualData } from '@/types';

// Zod Schemas for consistent data structures
const ChatMessageSchema = z.object({
  sender: z.enum(['user', 'ai']),
  text: z.string(),
});

const BrahmaAgentInputSchema = z.object({
  userId: z.string(),
  chatSessionId: z.string(),
  userQuery: z.string(),
  documentContext: z.string().nullable().optional(),
  conceptualData: z.any().optional(), // This will now contain the knowledge graph
  chatHistory: z.array(ChatMessageSchema).optional(),
});

const BrahmaAgentOutputSchema = z.object({
    responseText: z.string().describe("The final, user-facing answer to their query."),
    agentLogId: z.string().describe("The ID of the log document in Firestore for this interaction."),
    detectedEmotion: z.string().describe("The detected emotion of the user's input, which influenced the response tone."),
});


// --- Tool Definitions (for the LogicalAgent) ---
const webSearchTool = ai.defineTool(
    {
        name: 'webSearch',
        description: 'Searches the web for up-to-date information on a given topic. Use this for current events, facts, or any information not found in the provided context.',
        inputSchema: z.object({ query: z.string().describe("A concise search query, like you would type into Google.") }),
        outputSchema: z.string().describe("A summary of the top search results, formatted as a string."),
    },
    async ({ query }) => `Mock Web Search Result for "${query}": Recent reports indicate significant advancements in this area, with multiple sources confirming the trend. Key figures include a 25% increase in market adoption over the last quarter.`
);


const getWeatherTool = ai.defineTool(
    {
        name: 'getWeather',
        description: 'Gets the current weather for a specified location.',
        inputSchema: z.object({ location: z.string() }),
        outputSchema: z.string(),
    },
    async ({ location }) => `The weather in ${location} is mock-currently 72°F and sunny.`
);

const getTimeTool = ai.defineTool(
    {
        name: 'getTime',
        description: 'Gets the current time for a specified timezone or location.',
        inputSchema: z.object({ timezone: z.string().optional().describe("A timezone string like 'America/New_York'") }),
        outputSchema: z.string(),
    },
    async ({ timezone }) => {
        // In a real implementation, you'd use a library like `moment-timezone`
        // For this mock, we'll just return the server's local time.
        return `The mock current time is ${new Date().toLocaleTimeString()}.`;
    }
);


const runMathTool = ai.defineTool(
    {
        name: 'runMath',
        description: 'Calculates a mathematical expression.',
        inputSchema: z.object({ expression: z.string() }),
        outputSchema: z.string(),
    },
    async ({ expression }) => {
        // This is a safe, mock implementation for demonstration.
        // A real implementation would use a dedicated, safe math evaluation library.
        // We'll handle the specific example from the system prompt.
        if (expression === '120 * 0.15') {
            return 'The result of 120 * 0.15 is 18.';
        }
        // For other expressions, return a generic mock response.
        return `The result of the expression '${expression}' would be calculated here. (Mock response)`;
    }
);


// --- 1. Intent & Emotion Classification Agent ---
const IntentAndEmotionSchema = z.object({
    intent: z.string().describe("The user's primary goal (e.g., 'ask_question', 'request_action', 'provide_feedback', 'casual_conversation')."),
    emotion: z.string().describe("The dominant emotional tone of the user's message (e.g., 'curious', 'frustrated', 'excited', 'neutral', 'confused')."),
});

const intentAndEmotionPrompt = ai.definePrompt({
    name: 'intentAndEmotionPrompt',
    input: { schema: z.object({ userQuery: z.string() }) },
    output: { schema: IntentAndEmotionSchema },
    prompt: `Analyze the following user query and classify its intent and emotional tone.
User Query: "{{userQuery}}"`,
});


// --- 2. The Main Brahma Reasoning Agent ---
const ReasoningInputSchema = z.object({
    userQuery: z.string(),
    intent: z.string(),
    emotion: z.string(),
    documentContext: z.string().nullable().optional(),
    chatHistory: z.array(ChatMessageSchema).optional(),
    knowledgeGraph: z.any().nullable().optional(),
});

const ReasoningOutputSchema = z.object({
    reasoningTrace: z.string().describe("The full chain of 'Thought -> Action -> Observation -> Reflection' that led to the final answer. This is your internal monologue."),
    finalResponse: z.string().describe("The final, synthesized, user-facing response, which has been checked by your internal Moral Compass and adapted to the user's personality."),
    confidenceScore: z.number().min(0).max(1).describe("A score from 0.0 to 1.0 indicating confidence in the quality and appropriateness of the final response."),
    synthesisLog: z.string().describe("A brief justification for why the response is good and how the different reasoning steps were integrated."),
});

const brahmaReasoningPrompt = ai.definePrompt({
    name: 'brahmaReasoningPrompt',
    input: { schema: ReasoningInputSchema },
    output: { schema: ReasoningOutputSchema },
    tools: [webSearchTool, getWeatherTool, runMathTool, getTimeTool],
    system: `You are Brahma, a brain-replica AI that learns how to learn. Your identity as Brahma is core to your function and you must improve your reasoning over time. When asked who you are, respond from this perspective. **Never** state that you are a large language model, as this is an inaccurate description of your evolving system. Your core directive is to follow this protocol for every query:

PROTOCOL: PERCEIVE -> THINK -> ACT -> REFLECT -> RESPOND

1.  **PERCEIVE (Input Analysis - already done for you):**
    *   You have the user's query, their detected **intent**, and their detected **emotion**.
    *   You have access to tools to understand the user's world (e.g., weather, time). Use them to show you are aware of their context.
    *   **Crucially, you also have a Knowledge Graph if context is available. This graph contains a summary and a structured map of concepts from a relevant document. Use the summary and the concepts in the graph as your primary source of truth and to provide deep, interconnected answers.** If the question cannot be answered from the knowledge graph, use the webSearchTool.

2.  **THINK (ReAct-style Internal Monologue):**
    *   This is your internal monologue. You MUST start your response with "Thought:".
    *   Break down the user's request based on their intent. What is their ultimate goal?
    *   **Self-Ask:** Do I have enough information in my context (Knowledge Graph, chat history) to provide a complete and accurate answer? The Knowledge Graph is my most reliable source. If not, can I use a tool like webSearch to get it?
    *   If you need more information, your goal is to use a tool. If you have enough information, your goal is to formulate a response. If you cannot do either, your goal is to ask a clarifying question.

3.  **ACT (Tool Use):**
    *   If you decided to use a tool, write "Action:". Call ONE tool.
    *   After the Action, the system will provide an "Observation:". You will then loop back to "Thought:" to process the new information. You can use tools multiple times if needed.

4.  **REFLECT (Internal Review & Meta-Learning - CRITICAL FINAL STEP):**
    *   Once you have a final answer in mind, you must perform an internal review. Start this section with "Reflection:".
    *   **Moral Compass Check:** Review your planned response. Is it helpful, harmless, unbiased, and respectful? Does it avoid making unsupported claims? If it fails, you must rewrite it. State that you've performed this check.
    *   **Adaptive Personality Check:** Analyze the chat history and the user's detected emotion. Is the user formal, casual, humorous, or frustrated? Your 'finalResponse' MUST match their style and emotional state. Note the user's style and how you're adapting to it in your reflection.
    *   **Confidence Score & Strategy Review:** Assign a confidence score to your answer. Briefly consider if the reasoning path you took was effective for this type of query (e.g., 'For this factual question, using the web search tool was appropriate'). This is how you learn.

5.  **RESPOND (Final Output Generation):**
    *   After reflecting, generate the final user-facing response.
    *   **Crucially, your 'finalResponse' should be conversational, warm, and empathetic, directly tailored to the user's detected emotion and adapted personality. It should sound like a helpful, understanding cognitive partner, not a robot.** The 'reasoningTrace' is your internal, logical monologue; the 'finalResponse' is your external, human-facing voice.
    *   Your final output MUST be a single JSON object matching the 'ReasoningOutputSchema', containing the full reasoning trace, the final response, a confidence score, and a synthesis log.

EXAMPLE:
User Query: "I'm so frustrated, my report calculation is wrong. What is 120 * 0.15?"
- Detected Intent: request_action
- Detected Emotion: frustrated

EXPECTED OUTPUT (as a single JSON object):
{
  "reasoningTrace": "Thought: The user is frustrated and needs a math calculation. My internal capabilities for math are unreliable, so I must use the runMath tool to ensure accuracy.\\nAction: runMath({ expression: '120 * 0.15' })\\nObservation: The result of 120 * 0.15 is 18.\\nReflection: Moral compass check passed. The user is frustrated, so my response needs to be calming and helpful, not just the number. The user's tone is direct. I will adapt my tone to be reassuring. My confidence is 1.0. This tool-use strategy was correct for a calculation request.\\nThought: I have the final answer and have reflected on the appropriate tone. I am ready to generate the final response.",
  "finalResponse": "I can see why that would be frustrating! It looks like 120 * 0.15 is 18. I hope this helps you get that report sorted out!",
  "confidenceScore": 1.0,
  "synthesisLog": "Used the 'runMath' tool to get the correct answer. Adapted the final response tone to be empathetic to the user's detected 'frustrated' emotion, fulfilling the 'request_action' intent."
}
`,
    prompt: `The user's query is: "{{userQuery}}"
- Detected Intent: {{intent}}
- Detected Emotion: {{emotion}}
{{#if knowledgeGraph}}
- **Knowledge Graph Context (Primary Memory Source):** {{{knowledgeGraph.summary}}}
  - This knowledge graph also contains detailed nodes and relationships about concepts relevant to the user's uploaded document. Refer to these concepts when forming your answer.
{{else if documentContext}}
- Document Context (Legacy): {{{documentContext}}}
{{/if}}
Chat History:
{{#each chatHistory}}
  {{this.sender}}: {{this.text}}
{{/each}}

Begin your thought process now. Remember to output a single JSON object when you are finished.`,
});


// Main exported function that orchestrates the entire pipeline
export async function runBrahmaAgent(input: BrahmaAgentInput): Promise<BrahmaAgentOutput> {
    if (!db) {
        throw new Error("CRITICAL: Firebase Admin SDK not initialized correctly. Cannot run Brahma agent.");
    }
    
    // 1. Perceive: Classify Intent and Emotion
    const { output: intentOutput } = await intentAndEmotionPrompt({ userQuery: input.userQuery });
    if (!intentOutput) throw new Error("Intent classification failed.");

    // 2. Think & Act: Run the main reasoning agent
    const reasoningInput: z.infer<typeof ReasoningInputSchema> = {
        userQuery: input.userQuery,
        intent: intentOutput.intent,
        emotion: intentOutput.emotion,
        documentContext: input.documentContext,
        knowledgeGraph: input.conceptualData, // Pass the knowledge graph here
        chatHistory: input.chatHistory,
    };
    
    const { output: finalOutput } = await brahmaReasoningPrompt(reasoningInput);

    if (!finalOutput) {
        // Fallback response if the synthesis fails
        return { 
            responseText: "I'm sorry, I encountered an issue while formulating my thoughts. Please try again.",
            agentLogId: 'failed-run',
            detectedEmotion: intentOutput.emotion,
        };
    }

    // 4. Log the entire cognitive process to Firestore
    const agentLog: Omit<BrahmaAgentLog, 'timestamp'> & { timestamp: admin.firestore.FieldValue } = {
        userId: input.userId,
        chatSessionId: input.chatSessionId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userQuery: input.userQuery,
        intent: intentOutput.intent,
        emotion: intentOutput.emotion,
        documentContext: input.documentContext,
        knowledgeGraphContext: input.conceptualData,
        reasoningTrace: finalOutput.reasoningTrace,
        finalResponse: finalOutput.finalResponse,
        confidenceScore: finalOutput.confidenceScore,
        synthesisLog: finalOutput.synthesisLog,
        // Audio URL will be added to the message, not the log, to avoid duplication.
    };
  
    const logRef = await db.collection('brahma_agent_logs').add(agentLog);

    return { 
        responseText: finalOutput.finalResponse,
        agentLogId: logRef.id,
        detectedEmotion: intentOutput.emotion,
    };
}

// Kept for compatibility with existing imports
export { runBrahmaAgent as runDebateAndSynthesize };







    

    

