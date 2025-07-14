
// Basic user type, can be expanded with Firebase User properties
export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

// Types for the Knowledge Graph / Ontology System
export interface GraphNode {
    id: string; // e.g., "concept_photosynthesis"
    label: string; // "Photosynthesis"
    type: 'Concept' | 'Entity' | 'Emotion' | 'Topic' | 'Action';
    description?: string; // Brief definition
    metadata?: Record<string, any>; // e.g., for entities: category (PERSON, ORG, LOC)
}

export interface GraphEdge {
    source: string; // ID of the source node
    target: string; // ID of the target node
    relationship: 'is-a' | 'part-of' | 'causes' | 'enables' | 'related-to' | 'antonym-of' | 'seen-in' | 'feels-like' | 'explains' | 'used-for';
    description?: string; // How/why they are related
    weight?: number; // Strength of the connection (0-1)
}


export interface ConceptualData {
  summary: string; // A high-level summary of the content.
  nodes: GraphNode[];
  edges: GraphEdge[];
  emotions?: any[]; // Placeholder for emotion data if needed
}

// Type for uploaded files (video, audio, text)
export interface UploadedFile {
  id: string; // Firestore document ID
  userId: string;
  fileName: string;
  fileType: 'video' | 'audio' | 'text' | 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'unknown';
  storagePath: string; // Path in Firebase Storage
  downloadUrl?: string; // Download URL from Firebase Storage
  transcript?: string | null;
  summary?: string | null;
  conceptualData?: ConceptualData | null; // Stores the extracted knowledge graph
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'archived';
  uploadProgress?: number;
  createdAt: Date;
  updatedAt: Date;
  // New memory fields for feedback-aware system
  retrieval_count?: number; // How many times this file has been used as context
  last_retrieved?: any; // Can be a Date or a Firestore ServerTimestamp
  importance_weight?: number; // Calculated score for memory prioritization
  emotion_score?: number; // Overall emotional intensity score from content
  feedback_score_total?: number; // Sum of feedback scores (+1 / -1)
  feedback_count?: number; // Total number of feedback entries
}

// Type for a chat message
export interface ChatMessage {
  id: string;
  chatSessionId: string;
  sender: 'user' | 'ai';
  text: string;
  audioUrl?: string | null;
  timestamp: Date;
  metadata?: Record<string, any>;
  feedback?: 1 | 0 | -1; // 1 for thumbs up, -1 for thumbs down, 0 for neutral/cleared
  agentLogId?: string; // Reference to the agent log for this message
  detectedEmotion?: string; // Emotion detected from the user query that prompted this AI response
}
export type ChatHistoryMessage = Pick<ChatMessage, 'sender' | 'text'>;


// Type for a chat session
export interface ChatSession {
  id:string;
  userId: string;
  title: string;
  associatedFileId?: string; // ID of the UploadedFile
  createdAt: Date;
  lastMessageAt: Date;
}

// Type for logs
export interface QueryLog {
  id: string;
  userId: string;
  timestamp: Date;
  query: string;
  response?: string;
  isError?: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Type for user settings
export interface UserSettings {
  userId: string;
  preferredVoice?: string;
  theme?: 'dark' | 'light';
  voiceId?: string; // For voice cloning, e.g., an ID from a service like ElevenLabs
  voiceProvider?: 'elevenlabs' | 'google' | 'resemble' | 'bark';
  enableExpressiveReplies?: boolean;
}

// Agent specific types
export interface ConceptExtractionAgentInput {
  fileName: string;
  fileType: UploadedFile['fileType'];
  fileDownloadUrl: string; // For context, not direct access by LLM in simulation
}
export interface ConceptExtractionAgentOutput {
  extractedText: string;
  conceptualData: ConceptualData | null;
}

// DEPRECATED - This can be removed once all references are updated to debateFlow
export interface ResponseGenerationAgentInput {
  userQuery: string;
  documentContext?: string | null; // Transcript or Summary
  conceptualData?: ConceptualData | null;
  chatHistory?: ChatHistoryMessage[];
  importance_weight?: number; // Importance of the provided document context
}
// DEPRECATED
export interface ResponseGenerationAgentOutput {
  aiResponseText: string;
}

// Main chat orchestrator flow types
export interface BrahmaChatFlowInput {
  userId: string;
  chatSessionId: string; // Can be 'new' if starting a new chat
  userQuery: string;
  associatedFileId?: string | null; // ID of the UploadedFile
  currentChatSessionTitle?: string; // Used if creating a new session based on file
  voiceName?: string; // The voice to use for the TTS response
}
export interface BrahmaChatFlowOutput {
  aiResponseText: string;
  audioUrl?: string | null;
  newChatSessionId?: string; // Returned if a new session was created
}

// Main Brahma Agent flow types
export interface BrahmaAgentInput {
  userId: string;
  chatSessionId: string;
  userQuery: string;
  documentContext?: string | null;
  conceptualData?: ConceptualData | null; // The knowledge graph for the current context
  chatHistory?: ChatHistoryMessage[];
}
export interface BrahmaAgentOutput {
  responseText: string;
  agentLogId: string; // The ID of the log document in Firestore for this turn
  detectedEmotion: string; // The detected emotion of the user's query
}

// Log for the new agent, capturing the full cognitive trace
export interface BrahmaAgentLog {
  userId: string;
  chatSessionId: string;
  timestamp: any; // Firestore ServerTimestamp
  userQuery: string;
  intent: string;
  emotion: string;
  documentContext?: string | null;
  knowledgeGraphContext?: ConceptualData | null;
  reasoningTrace: string; // The full "Thought: ... -> Action: ... -> Observation: ..." chain
  finalResponse: string;
  confidenceScore: number;
  synthesisLog: string; // Summary of how the response was formed
  audioUrl?: string | null; // Add audio URL to the log
}

// New type for the Meta-Learning Strategy Registry
export interface StrategyReport {
  id: string; // The intent name, e.g., 'request_action'
  lastAnalyzed: Date;
  totalInteractions: number;
  positiveFeedbackCount: number;
  negativeFeedbackCount: number;
  averageConfidence: number;
  performanceScore: number; // A calculated score (0-1) based on feedback and confidence
}

// --- Author Dashboard Specific Types ---

export interface AuthorBrain {
  id: string;
  name: string;
  tags: string[];
  price: number;
  subscribersCount: number;
  avgRating: number;
  revenue: number;
  visibility: 'Public' | 'Private';
  createdAt: string;
  avatarUrl: string;
  version?: string;
  isABTesting?: boolean;
}

export interface BrainReview {
  id: string;
  brainId: string;
  brainName: string;
  userId: string;
  userName: string;
  rating: number;
  text: string;
  date: string;
}

export interface Payout {
    id: string;
    amount: number;
    status: 'Paid' | 'Pending';
    date: string;
}
