import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await fetch('https://api.atoma.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 7uabXiOonc28sJAussfv90cIeiJkPi',  // 暫時寫死用於測試
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1",
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