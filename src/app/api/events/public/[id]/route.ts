import { NextResponse } from 'next/server';

import { fetchPublicEventDetail } from '~/event/repository/public';

interface Params {
  id: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const resolvedParams = await params;
    const eventId = Number(resolvedParams.id);

    if (Number.isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID', code: '400', data: {} },
        { status: 400 },
      );
    }

    const result = await fetchPublicEventDetail(eventId);
    const statusCode = Number(result.code);
    const status = Number.isNaN(statusCode) ? (result.success ? 200 : 500) : statusCode;

    return NextResponse.json(result, { status });
  } catch (error) {
    console.error('[API] GET /api/events/public/:id error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', code: '500', data: {} },
      { status: 500 },
    );
  }
}
