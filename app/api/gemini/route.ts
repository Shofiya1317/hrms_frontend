import { NextRequest, NextResponse } from 'next/server';
import { getCarbonInsights, auditCalculation } from '@/lib/service/geminiService';

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    if (action === 'insights') {
      const result = await getCarbonInsights(data.entries);
      return NextResponse.json(result);
    }

    if (action === 'audit') {
      const result = await auditCalculation(data.category, data.subType, data.value);
      return NextResponse.json({ message: result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
}
