// Window 相關類型
export type WindowName = 'memento' | 'phonebook' | 'eventbook' | 'about' | 'help' | 'walrusupload' | 'walrusview';

// Chat 相關類型
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionResponse {
  choices: {
    message: ChatMessage;
  }[];
}

// Memento 相關類型
export interface Memento {
  name: string;
  blobId: string;
  objectId: string;
}


// 其他類型定義...