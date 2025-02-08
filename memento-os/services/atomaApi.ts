import { X25519KeyPair, generateKeyPair, deriveSharedSecret } from '@/utils/crypto';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
}

interface ChatCompletionResponse {
  choices: Array<{
    message?: ChatMessage;
    finish_reason?: string;
    index?: number;
  }>;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens?: number;
  };
}

interface ConfidentialChatRequest {
  ciphertext: string;           // base64 encoded
  client_dh_public_key: string; // base64 encoded
  model_name: string;
  node_dh_public_key: string;   // base64 encoded
  nonce: string;                // base64 encoded
  plaintext_body_hash: string;  // base64 encoded
  salt: string;                 // base64 encoded
  stack_small_id: number;
}

interface ConfidentialChatResponse {
  ciphertext: string;      // base64 encoded
  nonce: string;          // base64 encoded
  response_hash: string | null;
  signature: string | null;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
    completion_tokens?: number;
  };
}

export class AtomaApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = 'https://api.atoma.network';
    this.apiKey = process.env.NEXT_PUBLIC_ATOMA_API_KEY || '';
  }

  async createChatCompletion(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const endpoint = '/v1/chat/completions';
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API request failed: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Atoma API Error:', error);
      throw error;
    }
  }
}