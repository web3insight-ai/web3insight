import { NextRequest } from 'next/server';
import { fetchOne as serverFetchOne, updateOne as serverUpdateOne } from '~/event/repository';

interface Params {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<Params> }) {
  let idString = 'unknown';
  try {
    const resolvedParams = await params;
    idString = resolvedParams.id;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return Response.json(
        { success: false, message: 'Invalid event ID', code: '400' },
        { status: 400 },
      );
    }

    const result = await serverFetchOne(request, id);

    if (!result.success) {
      return Response.json(result, { status: parseInt(result.code || '400') });
    }

    return Response.json(result);
  } catch (error) {
    console.error(`GET /api/events/${idString} error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error', code: '500' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<Params> }) {
  let idString = 'unknown';
  try {
    const resolvedParams = await params;
    idString = resolvedParams.id;
    const id = parseInt(idString);

    if (isNaN(id)) {
      return Response.json(
        { success: false, message: 'Invalid event ID', code: '400' },
        { status: 400 },
      );
    }

    const data = await request.json();
    data.id = id; // Ensure the ID is included in the data

    const result = await serverUpdateOne(request, data);

    if (!result.success) {
      return Response.json(result, { status: parseInt(result.code || '400') });
    }

    return Response.json(result);
  } catch (error) {
    console.error(`PUT /api/events/${idString} error:`, error);
    return Response.json(
      { success: false, message: 'Internal server error', code: '500' },
      { status: 500 },
    );
  }
}
