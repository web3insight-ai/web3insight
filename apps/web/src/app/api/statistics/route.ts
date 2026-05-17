import { NextResponse } from 'next/server';
import { fetchStatisticsOverview } from '@/services';

export async function GET() {
  try {
    const result = await fetchStatisticsOverview();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to fetch statistics'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Statistics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
