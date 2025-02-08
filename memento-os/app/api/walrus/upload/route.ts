import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 先解析請求內容
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const walrusUrl = `${process.env.NEXT_PUBLIC_WALRUS_PUBLISHER}/api/v1/upload`;

    console.log('Uploading to:', walrusUrl);  // 調試用

    const response = await fetch(walrusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    // 調試用：打印響應詳情
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();  // 先獲取原始響應
    console.log('Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upload failed: ${response.status} ${responseText}` },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseText);  // 嘗試解析 JSON
      return NextResponse.json(data);
    } catch (e) {
      return NextResponse.json(
        { error: `Invalid JSON response: ${responseText}` },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 