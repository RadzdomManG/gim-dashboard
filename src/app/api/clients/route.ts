import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error || !clients || clients.length === 0) {
      // Canonical verified GIM clients fallback
      const fallbackClients = [
        { id: 'ltc', name: 'Little Treasures Company', code: 'LTC', lead_name: 'Radzdom Gallego', contact_name: 'Zoe Horner', contact_email: 'admin@littletreasurescompany.com', status: 'active' },
        { id: 'wrts', name: 'We Rock the Spectrum (WRTS)', code: 'WRTS', lead_name: 'Radzdom Gallego', contact_name: 'National Operations Lead', contact_email: 'ops@werockthespectrum.com.au', status: 'active' },
        { id: 'sn', name: 'Studio Nets', code: 'SN', lead_name: 'Erwin Manaog', contact_name: 'Creative Director', contact_email: 'hello@studionets.com', status: 'active' },
        { id: 'ivc', name: 'InVogue Cleans', code: 'IVC', lead_name: 'Ma. Rose Anne (RA) Malinao', contact_name: 'Operations Manager', contact_email: 'ops@invoguecleans.com.au', status: 'active' },
        { id: 'aob', name: 'Aaron Ofosu Bootcamp', code: 'AOB', lead_name: 'BJ Ricafrente', contact_name: 'Aaron Ofosu', contact_email: 'aaron@aaronofosubootcamp.com', status: 'active' },
        { id: 't2t', name: 'Tch2Thrive', code: 'T2T', lead_name: 'Divine Origines', contact_name: 'Program Coordinator', contact_email: 'info@tch2thrive.com', status: 'active' }
      ];
      return NextResponse.json({ clients: fallbackClients });
    }

    return NextResponse.json({ clients });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, lead_name, contact_name, contact_email, status = 'active' } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Client name and unique code are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        lead_name: lead_name?.trim() || null,
        contact_name: contact_name?.trim() || null,
        contact_email: contact_email?.trim() || null,
        status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, client: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
