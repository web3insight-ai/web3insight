import { NextResponse } from 'next/server';

import { fetchCurrentUser } from '~/auth/repository';
import { canManageEvents } from '~/auth/helper';
import { fetchOne, updateOne } from '~/event/repository';

interface Params {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const res = await fetchCurrentUser(request);

    if (!canManageEvents(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const resolvedParams = await params;
    const eventId = Number(resolvedParams.id);

    const result = await fetchOne(request, eventId);

    return NextResponse.json(result, { status: Number(result.code) });
  } catch (error) {
    console.error('Error in event contestants by ID GET:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const res = await fetchCurrentUser(request);

    if (!canManageEvents(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const resolvedParams = await params;
    const eventId = Number(resolvedParams.id);
    const data = await request.json();

    const result = await updateOne(request, {
      id: eventId,
      urls: data.urls,
      description: data.description,
    });

    return NextResponse.json(result, { status: Number(result.code) });
  } catch (error) {
    console.error('Error in event contestants by ID PUT:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
