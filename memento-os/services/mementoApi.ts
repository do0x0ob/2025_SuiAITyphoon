import type { MementoMetadata } from '@/types/index';

export const uploadMementoMetadata = async (metadata: MementoMetadata) => {
  const formData = new FormData();
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  formData.append('data', blob, 'memento.json');
  formData.append('epochs', '100');

  const response = await fetch('/api/walrus', {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return response.json();
}; 