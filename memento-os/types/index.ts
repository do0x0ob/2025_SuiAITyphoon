// Window 相關類型
export type WindowName = 
  | 'memento' 
  | 'phonebook' 
  | 'eventbook' 
  | 'about' 
  | 'help' 
  | 'walrusupload' 
  | 'walrusview'
  | 'memento-create'
  | 'capture-moment';

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

// Memento 相關類型
export interface Memento {
  name: string;
  blobId: string;
  objectId: string;
}

export interface MementoData {
  name: string;
  description: string;
  traits: string[];
}

export interface MementoMetadata {
  version: '1.0';
  type: 'memento';
  data: {
    name: string;
    description: string;
    traits: string[];
    createdAt: string;
  };
}

export type StatusType = 'idle' | 'uploading-metadata' | 'uploading-chain' | 'success' | 'error';

export interface StatusState {
  type: StatusType;
  message: string;
  digest?: string;
}

// 其他類型定義...