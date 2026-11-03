import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('deliverable_approvals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      const fallbackApprovals = [
        {
          id: "app-g5",
          code: "G5",
          title: "Website: Six Pages in Zoe's Brand (Copy & Mobile Layout)",
          client: "Little Treasures Company",
          submitted_by: "Radzdom Gallego (Radz)",
          assigned_reviewer: "Erwin Manaog",
          status: "Pending Review",
          priority: "High",
          summary: "All 6 website pages built in GoHighLevel with brand styling and responsive layout.",
          deliverable_url: "https://littletreasurescompany.com",
          target_milestone: "Summit Ready: Fri 11 Dec 2026",
          created_at: new Date().toISOString()
        },
        {
          id: "app-g7",
          code: "G7",
          title: "Enquiry Workflow, Custom Fields & Phone Notification Alert",
          client: "Little Treasures Company",
          submitted_by: "Radzdom Gallego (Radz)",
          assigned_reviewer: "Erwin Manaog",
          status: "Pending Review",
          priority: "High",
          summary: "Automated enquiry intake routing in GHL with SMS alert to Zoe.",
          deliverable_url: "https://app.gohighlevel.com",
          target_milestone: "Summit Ready: Fri 11 Dec 2026",
          created_at: new Date().toISOString()
        }
      ];
      return NextResponse.json({ approvals: fallbackApprovals });
    }

    return NextResponse.json({ approvals: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, review_notes, reviewed_by } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('deliverable_approvals')
      .update({
        status,
        review_notes: review_notes || null,
        reviewed_by: reviewed_by || 'Radzdom Gallego',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, approval: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
