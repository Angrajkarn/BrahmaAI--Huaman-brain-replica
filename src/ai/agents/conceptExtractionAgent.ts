
'use server';
/**
 * @fileOverview Agent responsible for simulating text extraction and building a knowledge graph (Ontology).
 * This agent simulates the output of a more complex perception pipeline (like one using Whisper and DeepFace)
 * and focuses the AI's task on ontology generation from that simulated perception.
 *
 * - extractConceptsAndText - Simulates text extraction and builds a knowledge graph.
 * - ConceptExtractionAgentOutput - Output type for the agent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod'; // Use zod from zod, not genkit
import type { UploadedFile, GraphNode, GraphEdge, ConceptualData, ConceptExtractionAgentInput, ConceptExtractionAgentOutput } from '@/types';
import { addConceptsToGraph } from '@/lib/neo4j';

// Schemas for the Knowledge Graph
const GraphNodeSchema = z.object({
    id: z.string().describe("A unique, machine-readable ID for the node (e.g., 'concept_blockchain')."),
    label: z.string().describe("The human-readable name of the node (e.g., 'Blockchain')."),
    type: z.enum(['Concept', 'Entity', 'Emotion', 'Topic', 'Action']).describe("The type of the node."),
    description: z.string().optional().describe("A brief definition of the node."),
    metadata: z.record(z.any()).optional().describe("Additional metadata, e.g., for entities: category (PERSON, ORG, LOC).")
});

const GraphEdgeSchema = z.object({
    source: z.string().describe("The ID of the source node."),
    target: z.string().describe("The ID of the target node."),
    relationship: z.enum(['is-a', 'part-of', 'causes', 'enables', 'related-to', 'antonym-of', 'seen-in', 'feels-like', 'explains', 'used-for']).describe("The type of relationship between the nodes."),
    description: z.string().optional().describe("A brief description of how the nodes are related."),
    weight: z.number().optional().describe("The strength of the connection (0-1).")
});

const ConceptualDataSchema = z.object({
    summary: z.string().describe("A high-level, one-paragraph summary of the entire text content."),
    nodes: z.array(GraphNodeSchema).describe("A list of identified nodes for the knowledge graph."),
    edges: z.array(GraphEdgeSchema).describe("A list of inferred edges connecting the nodes in the knowledge graph."),
});

// A simpler input schema just for the ontology building prompt
const OntologyPromptInputSchema = z.object({
    fileContentHint: z.string().describe("A snippet of text content to base the graph on.")
});

// The final output schema for the entire flow
const ConceptExtractionAgentOutputSchema = z.object({
  extractedText: z.string().describe('The simulated extracted textual content from the file.'),
  conceptualData: ConceptualDataSchema.nullable().describe('The generated knowledge graph (ontology) with a summary, nodes, and edges. Can be null if not applicable or failed.'),
});


// Exported function to be called by other flows or frontend
export async function extractConceptsAndText(input: Omit<ConceptExtractionAgentInput, 'fileContentHint'>): Promise<ConceptExtractionAgentOutput> {
  return conceptExtractionAgentFlow(input);
}


// This prompt is now simplified to ONLY generate the knowledge graph.
const ontologyBuilderPrompt = ai.definePrompt({
  name: 'ontologyBuilderPrompt',
  input: { schema: OntologyPromptInputSchema },
  output: { schema: ConceptualDataSchema },
  prompt: `You are an advanced AI assistant acting as an Ontology Builder. Your task is to analyze the following text and construct a knowledge graph from it.

Text to Analyze:
'''
{{fileContentHint}}
'''

Based *only* on the provided text, perform the following actions:
1.  **Summary**: Write a concise, one-paragraph summary of the text.
2.  **Nodes**: Identify the key concepts, entities, topics, and actions. Create a 'GraphNode' for each.
    *   Use clear, machine-readable IDs (e.g., 'concept_distributed_ledger').
    *   Assign a relevant type: 'Concept', 'Entity', 'Topic', 'Action', 'Emotion'.
3.  **Edges**: This is the most critical step. Infer the relationships between the nodes you identified. Create a 'GraphEdge' for each connection.
    *   Use relationship types like 'is-a', 'part-of', 'causes', 'enables', 'related-to', 'antonym-of', 'seen-in', 'feels-like', 'explains', 'used-for'.
    *   Infer at least 2-5 meaningful relationships from the text.

Ensure your output strictly adheres to the schema. If the text is unsupported or too short to analyze, return an empty array for nodes and edges.
`,
});

// This function simulates a multi-modal perception pipeline (e.g., Whisper, DeepFace).
function simulatePerception(fileName: string, fileType: UploadedFile['fileType']): string {
    switch (fileType) {
        case 'pdf':
            return `This is a simulated textual summary for the PDF document named "${fileName}". For this simulation, we'll imagine it contains a project proposal outlining key objectives, a timeline, and budget allocations for developing a new machine learning model.`;
        case 'audio':
        case 'video':
            return `[Simulated Whisper Transcript from ${fileName}]: "Our quarterly earnings report shows a revenue growth of 15%, primarily driven by the strong market performance of our new AI-powered analytics platform. Customer feedback has been overwhelmingly positive, highlighting the intuitive user interface and the actionable insights it provides." [Simulated DeepFace Emotion: Pleased]`;
        case 'text':
        case 'md':
            return `This is a sample of simulated text from the file "${fileName}". It contains notes on project management, including the importance of clear communication and setting realistic deadlines.`;
        default:
            return `Text extraction is not supported for the file type: ${fileType} for ${fileName}.`;
    }
}


const conceptExtractionAgentFlow = ai.defineFlow(
  {
    name: 'conceptExtractionAgentFlow',
    inputSchema: z.object({ // The public-facing function input
        fileName: z.string(),
        fileType: z.custom<UploadedFile['fileType']>(),
        fileDownloadUrl: z.string().url(),
    }),
    outputSchema: ConceptExtractionAgentOutputSchema,
  },
  async ({ fileName, fileType, fileDownloadUrl }) => {
    const simulatedText = simulatePerception(fileName, fileType);
    
    if (simulatedText.includes("not supported")) {
      return {
        extractedText: simulatedText,
        conceptualData: null,
      };
    }

    try {
      // Call the AI to generate ONLY the conceptual data
      const { output: conceptualData } = await ontologyBuilderPrompt({ fileContentHint: simulatedText });

      if (conceptualData && conceptualData.nodes && conceptualData.nodes.length > 0) {
        
        // Asynchronously write to Neo4j without waiting.
        // This prevents the database write from slowing down the user response.
        addConceptsToGraph(conceptualData.nodes, conceptualData.edges)
            .catch(err => console.error("[Neo4j Integration] Failed to write to Neo4j:", err));

        return {
          extractedText: simulatedText,
          conceptualData: conceptualData,
        };
      }
      
      console.warn(`Ontology generation returned empty graph for ${fileName}. Returning text only.`);
      return {
        extractedText: simulatedText,
        conceptualData: null,
      };

    } catch (e) {
      console.error(`Error during ontology generation for ${fileName}:`, e);
      // Fallback gracefully, providing the base text so the app doesn't break.
      return {
        extractedText: `(A system error occurred during knowledge graph generation, so context is limited to the basic text.) \n\n${simulatedText}`,
        conceptualData: null,
      };
    }
  }
);
