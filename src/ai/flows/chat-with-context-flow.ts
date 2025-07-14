
// This file's logic has been moved to /src/ai/agents/responseGenerationAgent.ts
// and is orchestrated by the new /src/ai/flows/brahmaChatFlow.ts.
// This file can be deleted. To prevent build errors if it's still imported elsewhere
// before full propagation of changes, leave it empty or with a redirecting comment.

'use server';
/**
 * @fileOverview This flow has been refactored and moved.
 * Its functionality is now part of /src/ai/agents/responseGenerationAgent.ts
 * and is orchestrated by /src/ai/flows/brahmaChatFlow.ts.
 *
 * This file can be safely deleted.
 */

// Intentionally empty or minimal to avoid breaking imports during transition
// console.warn("Accessed deprecated flow: /src/ai/flows/chat-with-context-flow.ts. Use /src/ai/flows/brahmaChatFlow.ts instead.");

export {}; // Ensures it's treated as a module
