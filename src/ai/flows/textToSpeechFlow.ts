
'use server';
/**
 * @fileOverview A Genkit flow for generating speech from text using Google AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/googleai';

/**
 * Converts PCM audio data buffer to a Base64-encoded WAV string.
 * @param pcmData - The raw PCM audio data from the TTS model.
 * @param channels - Number of audio channels.
 * @param rate - The sample rate of the audio.
 * @param sampleWidth - The width of each audio sample in bytes.
 * @returns A promise that resolves to a Base64-encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => {
      bufs.push(d);
    });
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: z.string().describe('The text to be converted to speech.'),
    outputSchema: z.object({
        media: z.string().url().nullable().describe("Data URI of the generated WAV audio."),
    }),
  },
  async (textToSpeak) => {
    if (!textToSpeak.trim()) {
      return { media: null };
    }
    
    try {
        const { media } = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-preview-tts'),
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A pleasant, standard voice
                },
                },
            },
            prompt: textToSpeak,
        });

        if (!media?.url) {
            console.warn('TTS model returned no media.');
            return { media: null };
        }
        
        // The media URL is a data URI with raw PCM data: 'data:audio/pcm;base64,...'
        const audioBuffer = Buffer.from(
            media.url.substring(media.url.indexOf(',') + 1),
            'base64'
        );
        
        const wavBase64 = await toWav(audioBuffer);
        
        return {
            media: 'data:audio/wav;base64,' + wavBase64,
        };

    } catch (error) {
        console.error("Error during text-to-speech generation:", error);
        // Do not throw the error, just return null so the primary flow can continue
        return { media: null };
    }
  }
);

// Export a simple wrapper function for easy calling
export async function generateAudio(text: string) {
  return textToSpeechFlow(text);
}
