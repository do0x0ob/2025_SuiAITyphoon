// Window 相關類型
export type WindowName = 'memento' | 'phonebook' | 'eventbook' | 'about' | 'help' | 'walrusupload' | 'walrusview';

// Chat 相關類型
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatCompletionResponse {
  choices: {
    message: ChatMessage;
  }[];
}

// 其他類型定義...