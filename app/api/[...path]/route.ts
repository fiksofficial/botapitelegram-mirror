import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_API = 'https://api.telegram.org';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params.path);
}

// Поддержка всех методов (PUT, DELETE и т.д., если понадобится)
export async function PUT(req: NextRequest, { params }: any) {
  return handleRequest(req, params.path);
}

async function handleRequest(request: NextRequest, pathSegments: string[]) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    
    // Получаем token из пути (обычно bot<token>)
    const fullPath = `\( {path} \){url.search}`;

    const telegramUrl = `\( {TELEGRAM_API}/ \){fullPath}`;

    // Копируем заголовки (кроме host)
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!['host', 'x-forwarded-host'].includes(key.toLowerCase())) {
        headers.set(key, value);
      }
    });

    let body: BodyInit | null = null;
    if (request.body) {
      body = await request.text(); // или .blob() / .arrayBuffer() для файлов
    }

    const response = await fetch(telegramUrl, {
      method: request.method,
      headers,
      body: body || undefined,
    });

    // Копируем ответ
    const responseBody = await response.text();
    const responseHeaders = new Headers(response.headers);

    // Убираем заголовки, которые могут вызвать проблемы
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: (error as Error).message },
      { status: 502 }
    );
  }
}