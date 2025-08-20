import { NextRequest } from 'next/server';
import { fetchList as serverFetchList, insertOne as serverInsertOne } from '~/event/repository';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const result = await serverFetchList(params, request);

    if (!result.success) {
      return Response.json(result, { status: parseInt(result.code || '400') });
    }

    return Response.json(result);
  } catch (error) {
    console.error('GET /api/events error:', error);
    return Response.json(
      { success: false, message: 'Internal server error', code: '500' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const result = await serverInsertOne(data, request);

    if (!result.success) {
      return Response.json(result, { status: parseInt(result.code || '400') });
    }

    return Response.json(result);
  } catch (error) {
    console.error('POST /api/events error:', error);
    return Response.json(
      { success: false, message: 'Internal server error', code: '500' },
      { status: 500 },
    );
  }
}
