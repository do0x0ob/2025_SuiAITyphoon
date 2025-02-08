import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('data');
    const epochs = formData.get('epochs') || '1';
    
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
    const walrusUrl = `${process.env.NEXT_PUBLIC_WALRUS_PUBLISHER}/v1/blobs?epochs=${epochs}`;

    console.log('Uploading to:', walrusUrl);

    const response = await fetch(walrusUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: fileBuffer,
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Upload failed: ${response.status} ${responseText}` },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(responseText);
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId');
    
    if (!blobId) {
      return NextResponse.json(
        { error: 'Invalid blobId' },
        { status: 400 }
      );
    }

    const walrusUrl = `${process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR}/v1/blobs/${encodeURIComponent(blobId)}`;
    console.log('Fetching from:', walrusUrl);

    const response = await fetch(walrusUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch blob: ${response.statusText} - ${errorText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('Content-Type');
    const data = await response.text();
    
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
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