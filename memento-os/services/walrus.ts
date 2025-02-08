const WALRUS_AGGREGATOR = process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR!;
const WALRUS_PUBLISHER = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER!;

// 上傳 blob 到 Walrus Publisher
export const uploadBlob = async (data: string | File, epochs = 1): Promise<string> => {
  const url = `${WALRUS_PUBLISHER}/v1/blobs?epochs=${epochs}`;

  const body = typeof data === "string" ? data : await data.text();
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body, // 將數據作為 payload 傳遞
  });

  if (!response.ok) {
    throw new Error(`Failed to upload blob: ${response.statusText}`);
  }

  const result = await response.json();
  return result.newlyCreated.blobObject.blobId; // 返回 blobId
};

// 從 Walrus Aggregator 讀取 blob
export const readBlob = async (blobId: string): Promise<string> => {
  const url = `${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to read blob: ${response.statusText}`);
  }

  return response.text(); // 返回 blob 的內容
};