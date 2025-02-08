import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const baseUrl = process.env.ATOMA_API_URL;
    const body = await req.json();
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ATOMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct",
        messages: body.messages,
      }),
    });

    console.log('API Response Status:', response.status);  // 添加日誌
    const data = await response.json();
    console.log('API Response Data:', data);  // 添加日誌

    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 