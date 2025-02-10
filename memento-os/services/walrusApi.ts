export const walrusApi = {
  handleFileUpload: async (formData: FormData) => {
    const response = await fetch('https://publisher.walrus-testnet.walrus.space/v1/blobs?epochs=100', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    // 正確解析返回的 blobId
    return {
      blobId: data.newlyCreated.blobObject.blobId
    };
  },

  readBlob: async (blobId: string) => {
    const response = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-transform',
        'X-Content-Type-Options': 'nosniff'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    return response;
  },

  // ... 其他方法
};