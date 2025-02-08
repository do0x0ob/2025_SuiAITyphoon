import { NextResponse } from 'next/server';
import { uploadBlob, readBlob } from '@/services/walrus';

export async function POST(request: Request) {
  try {
    const { data, epochs } = await request.json();
    const blobId = await uploadBlob(data, epochs);
    return NextResponse.json({ blobId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
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

    const blobData = await readBlob(blobId);
    return NextResponse.json({ data: blobData });
  } catch (error) {
    console.error('Read error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 