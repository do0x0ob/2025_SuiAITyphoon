import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { blobId: string } }
) {
  try {
    const { blobId } = params;
    
    if (!blobId) {
      return NextResponse.json(
        { error: 'Invalid blobId' },
        { status: 400 }
      );
    }

    const cleanBlobId = blobId.startsWith('0x') ? blobId.slice(2) : blobId;
    const walrusUrl = `${process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR}/v1/blobs/${cleanBlobId}`;
    
    console.log('Fetching blob:', {
      url: walrusUrl,
      originalId: blobId,
      cleanedId: cleanBlobId
    });

    const response = await fetch(walrusUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch blob: ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    // 直接返回原始響應，保持二進制格式
    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'image/jpeg',  // 或根據實際情況設置其他圖片類型
      },
    });
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 