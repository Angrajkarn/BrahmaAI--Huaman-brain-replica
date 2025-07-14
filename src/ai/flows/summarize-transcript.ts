
'use server';

/**
 * @fileOverview Summarizes a transcript for efficient chatbot context.
 *
 * - summarizeTranscript - A function that summarizes the transcript.
 * - SummarizeTranscriptInput - The input type for the summarizeTranscript function.
 * - SummarizeTranscriptOutput - The return type for the summarizeTranscript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTranscriptInputSchema = z.object({
  transcript: z
    .string()
    .describe('The transcript text to summarize.'),
});
export type SummarizeTranscriptInput = z.infer<typeof SummarizeTranscriptInputSchema>;

const SummarizeTranscriptOutputSchema = z.object({
  summary: z.string().describe('The summarized transcript text.'),
});
export type SummarizeTranscriptOutput = z.infer<typeof SummarizeTranscriptOutputSchema>;

export async function summarizeTranscript(input: SummarizeTranscriptInput): Promise<SummarizeTranscriptOutput> {
  return summarizeTranscriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTranscriptPrompt',
  input: {schema: SummarizeTranscriptInputSchema},
  output: {schema: SummarizeTranscriptOutputSchema},
  prompt: `Summarize the following transcript concisely, capturing the main points. If the transcript is very short, generic, or seems like placeholder text, state that a detailed summary cannot be generated from it.

Transcript:
{{transcript}}`,
});

const summarizeTranscriptFlow = ai.defineFlow(
  {
    name: 'summarizeTranscriptFlow',
    inputSchema: SummarizeTranscriptInputSchema,
    outputSchema: SummarizeTranscriptOutputSchema,
  },
  async input => {
    if (!input.transcript || input.transcript.trim().length < 30) { // Check for reasonably lengthed transcript
      return { summary: "The provided text was too short or unavailable to generate a meaningful summary." };
    }
    // Check for common placeholder/error messages from the extraction step
    const lowerTranscript = input.transcript.toLowerCase();
    if (lowerTranscript.includes("simulated textual content for the document") ||
        lowerTranscript.includes("system error occurred during the simulated text extraction") ||
        lowerTranscript.includes("placeholder text for the document")) {
      return { summary: "The available text appears to be a generic placeholder or simulation, from which a specific summary cannot be derived."};
    }

    try {
      const {output} = await prompt(input);
      if (!output || !output.summary || output.summary.trim() === "") {
        return { summary: "Unable to generate a specific summary for the provided text at this time." };
      }
      return output;
    } catch (e) {
      console.error("Error during summarization flow:", e);
      return { summary: "An error occurred while trying to generate the summary." };
    }
  }
);
