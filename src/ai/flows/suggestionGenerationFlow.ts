
'use server';
/**
 * @fileOverview A Genkit flow for generating intelligent follow-up suggestions based on the user's last conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Input schema for the flow
const SuggestionGenerationInputSchema = z.object({
  lastSessionTitle: z.string().describe("The title of the user's most recent chat session."),
});
export type SuggestionGenerationInput = z.infer<typeof SuggestionGenerationInputSchema>;

const SuggestionSchema = z.object({
  title: z.string().describe("A short (1-3 word) label for the suggestion category, like 'Deeper Dive', 'Creative Angle', or 'Next Step'."),
  prompt: z.string().describe("The full, engaging follow-up question or suggestion for the user."),
});

// Output schema for the flow
const SuggestionGenerationOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).length(3, "Must provide exactly three suggestions."),
});
export type SuggestionGenerationOutput = z.infer<typeof SuggestionGenerationOutputSchema>;


// The prompt that drives the suggestion generation
const suggestionPrompt = ai.definePrompt({
  name: 'suggestionPrompt',
  input: { schema: SuggestionGenerationInputSchema },
  output: { schema: SuggestionGenerationOutputSchema },
  prompt: `You are a helpful AI assistant. A user has just finished a conversation with the title: "{{lastSessionTitle}}".

Your task is to generate exactly three distinct, thought-provoking, and open-ended follow-up prompts to re-engage the user. Each prompt needs a short 'title' or category label. The suggestions should be short (under 15 words) and encourage deeper thinking, creativity, or reflection related to the previous topic.

Do not be generic. Base your suggestions directly on the "{{lastSessionTitle}}".

Example:
If the last session title was "Brainstorming a marketing plan for a new coffee shop", a good response would be:
{
  "suggestions": [
    { "title": "Unconventional Idea", "prompt": "What's one wild marketing idea we didn't explore?" },
    { "title": "Launch Event", "prompt": "How could we make the launch event unforgettable?" },
    { "title": "Ideal Customer", "prompt": "Let's imagine the coffee shop's biggest fan. What are they like?" }
  ]
}

Generate three suggestions now.`,
});

// The main flow definition
const suggestionGenerationFlow = ai.defineFlow(
  {
    name: 'suggestionGenerationFlow',
    inputSchema: SuggestionGenerationInputSchema,
    outputSchema: SuggestionGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await suggestionPrompt(input);
    if (!output) {
      // Fallback for safety
      return {
        suggestions: [
          { title: "Continue Exploring", prompt: `Tell me more about ${input.lastSessionTitle}.` },
          { title: "New Topic", prompt: "Let's start a new topic." },
          { title: "Recap", prompt: `Can you summarize the key points of ${input.lastSessionTitle}?` },
        ]
      }
    }
    return output;
  }
);

// Exported wrapper function for easy use in the application
export async function generateSuggestions(input: SuggestionGenerationInput): Promise<SuggestionGenerationOutput> {
  return suggestionGenerationFlow(input);
}
