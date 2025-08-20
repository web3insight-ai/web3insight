import { NextResponse } from 'next/server';

import { fetchCurrentUser } from '~/auth/repository';
import { canManageEvents } from '~/auth/helper';
import { fetchList, insertOne } from '~/event/repository';

export async function GET(request: Request) {
  try {
    const res = await fetchCurrentUser(request);

    if (!canManageEvents(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const result = await fetchList(request, params);

    return NextResponse.json(result, { status: Number(result.code) });
  } catch (error) {
    console.error('Error in event contestants GET:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const res = await fetchCurrentUser(request);

    if (!canManageEvents(res.data)) {
      return NextResponse.json(
        { success: false, message: "Access denied", code: "404" },
        { status: 404 },
      );
    }

    const data = await request.json();
    const result = await insertOne(request, data);

    return NextResponse.json(result, { status: Number(result.code) });
  } catch (error) {
    console.error('Error in event contestants POST:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error", code: "500" },
      { status: 500 },
    );
  }
}
