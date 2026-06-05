import { NextRequest, NextResponse } from 'next/server';

const TELEGRAM_API = 'https://api.telegram.org';

async function handleProxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const url = new URL(request.url);
    const telegramUrl = `\( {TELEGRAM_API}/ \){path.join('/')}${url.search}`;

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('x-forwarded-host');
    headers.delete('x-forwarded-for');

    const response = await fetch(telegramUrl, {
      method: request.method,
      headers,
      body: request.body,
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
    console.error('Proxy error:', error);
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