import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const backendUrl = 'http://127.0.0.1:5001/api/health';

    try {
        console.log(`[DebugProxy] Attempting to connect to ${backendUrl}...`);
        const startTime = Date.now();
        const response = await fetch(backendUrl, { cache: 'no-store' });
        const data = await response.json();
        const duration = Date.now() - startTime;

        return NextResponse.json({
            status: 'success',
            message: 'Connected to backend successfully',
            backendUrl,
            duration: `${duration}ms`,
            response: data
        });
    } catch (error) {
        console.error('[DebugProxy] Connection failed:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Failed to connect to backend',
            backendUrl,
            error: {
                message: error.message,
                code: error.code,
                cause: error.cause,
                name: error.name
            }
        }, { status: 500 });
    }
}
