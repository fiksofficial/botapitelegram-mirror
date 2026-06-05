import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_API = 'https://api.telegram.org';

export async function GET(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxy(request, context.params.path);
}

export async function POST(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxy(request, context.params.path);
}

export async function PUT(
  request: NextRequest,
  context: { params: { path: string[] } }
) {
  return handleProxy(request, context.params.path);
}

async function handleProxy(request: NextRequest, pathSegments: string[]) {
  try {
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const telegramUrl = `\( {TELEGRAM_API}/ \){path}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-for');

    const response = await fetch(telegramUrl, {
      method: request.method,
      headers,
      body: request.body,
      duplex: 'half' as const,
    });

    const responseHeaders = new Headers(response.headers);
    // Убираем проблемные заголовки
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy Error', message: error?.message || 'Unknown error' },
      { status: 502 }
    );
  }
}