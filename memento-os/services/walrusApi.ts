export class WalrusApiService {
  private publisherUrl: string;
  private aggregatorUrl: string;

  constructor() {
    this.publisherUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || '';
    this.aggregatorUrl = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || '';
  }

  // 上傳 blob
  async uploadBlob(fileBuffer: Buffer, epochs: string = '1') {
    const response = await fetch(`${this.publisherUrl}/v1/blobs?epochs=${epochs}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${responseText}`);
    }

    return JSON.parse(responseText);
  }

  // 讀取 blob
  async readBlob(blobId: string) {
    const response = await fetch(`${this.aggregatorUrl}/v1/blobs/${encodeURIComponent(blobId)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    return response;
  }

  // 處理文件上傳
  async handleFileUpload(formData: FormData, method: 'PUT' | 'POST' = 'POST') {
    const file = formData.get('data') || formData.get('file');
    const epochs = formData.get('epochs')?.toString() || '1';
    
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file');
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    return this.uploadBlob(fileBuffer, epochs);
  }
}

export const walrusApi = new WalrusApiService(); 