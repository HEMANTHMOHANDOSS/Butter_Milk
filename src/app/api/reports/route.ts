import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const reports = await sql`
      SELECT * FROM buttermilk_reports 
      ORDER BY date DESC, day DESC
    `;
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, day, mahilas, gents, bv_girls, bv_boys, beneficiary_count, photos } = body;

    const result = await sql`
      INSERT INTO buttermilk_reports (
        date, day, mahilas, gents, bv_girls, bv_boys, beneficiary_count, photos
      ) VALUES (
        ${date}, ${day}, ${mahilas}, ${gents}, ${bv_girls}, ${bv_boys}, ${beneficiary_count}, ${photos}
      ) RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
