import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_API = 'https://api.telegram.org';

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const url = new URL(request.url);
    const pathStr = path.join('/');
    const telegramUrl = `${TELEGRAM_API}/${pathStr}${url.search || ''}`;

    if (!pathStr.startsWith('bot')) {
      return new NextResponse('Not Found', { status: 404 });
    }

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-for');

    const body = request.method !== 'GET' && request.method !== 'HEAD'
      ? await request.arrayBuffer()
      : undefined;

    const response = await fetch(telegramUrl, {
      method: request.method,
      headers,
      body: body ? Buffer.from(body) : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Proxy Error', message: error?.message || 'Unknown error' },
      { status: 502 }
    );
  }
}

export const GET = (req: NextRequest, ctx: any) => handleProxy(req, ctx);
export const POST = (req: NextRequest, ctx: any) => handleProxy(req, ctx);
export const PUT = (req: NextRequest, ctx: any) => handleProxy(req, ctx);
export const DELETE = (req: NextRequest, ctx: any) => handleProxy(req, ctx);
export const PATCH = (req: NextRequest, ctx: any) => handleProxy(req, ctx);