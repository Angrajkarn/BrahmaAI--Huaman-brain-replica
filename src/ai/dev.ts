
import { config } from 'dotenv';
config();

// Existing flows
import '@/ai/flows/summarize-transcript.ts';

// New agent-based structure
import '@/ai/agents/conceptExtractionAgent.ts';
import '@/ai/flows/brahmaChatFlow.ts';
import '@/ai/flows/feedbackFlow.ts';
import '@/ai/flows/debateFlow.ts'; // This now contains the main Brahma Agent logic
import '@/ai/flows/suggestionGenerationFlow.ts'; // For smart new chat suggestions
import '@/ai/flows/textToSpeechFlow.ts'; // New TTS Flow

// Scheduled tasks
import '@/ai/scheduled/nightlyMemoryUpdate.ts';
import '@/ai/scheduled/metaLearningAnalysis.ts';
