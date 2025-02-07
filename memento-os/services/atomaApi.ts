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

export class AtomaApiService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultModel = "meta-llama/llama-3.3-70b-instruct";

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_ATOMA_API_URL || 'https://api.atoma.network';
    this.apiKey = process.env.NEXT_PUBLIC_ATOMA_API_KEY || '';
  }

  async createConfidentialChatCompletion(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const endpoint = '/v1/confidential/chat/completions';
    const url = `${this.baseUrl}${endpoint}`;

    const requestBody: ChatCompletionRequest = {
      model: this.defaultModel,
      messages,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
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