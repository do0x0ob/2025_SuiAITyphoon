import { walrusApi } from '@/services/walrusApi';

export async function uploadToWalrus(data: any) {
  try {
    const jsonString = JSON.stringify(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'memento-data.json');
    
    // 使用現有的 walrusApi service
    const result = await walrusApi.handleFileUpload(formData);
    return result.blobId;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Memento data upload failed: ${error.message}`);
    }
    throw new Error('Memento data upload failed');
  }
}

export async function getMementoData(blobId: string) {
  try {
    const response = await walrusApi.readBlob(blobId);
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch memento data: ${error.message}`);
    }
    throw new Error('Failed to fetch memento data');
  }
} 