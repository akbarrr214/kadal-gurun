import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const kategori = request.nextUrl.searchParams.get('kategori') || 'balita';

    const { data: warga, error } = await supabaseServer
      .from('warga')
      .select('*')
      .eq('kategori', kategori);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    if (!warga || warga.length === 0) {
      return NextResponse.json(
        { error: 'No data found' },
        { status: 404 }
      );
    }

    const csv = convertToCSV(warga);
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''export_${kategori}_${new Date().toISOString().split('T')[0]}.csv`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Export failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function convertToCSV(data: unknown[]): string {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }
  
  try {
    const headers = Object.keys(data[0] as Record<string, unknown>);
    const headerRow = headers.map(h => escapeCSV(h)).join(',');
    
    const rows = data.map(row => {
      const record = row as Record<string, unknown>;
      return headers
        .map(header => escapeCSV(String(record[header] ?? '')))
        .join(',');
    });

    return [headerRow, ...rows].join('\n');
  } catch (error) {
    console.error('CSV conversion error:', error);
    return '';
  }
}

function escapeCSV(value: string): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}
