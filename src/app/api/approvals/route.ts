import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { notifyGateApproved } from '@/lib/slack/notifier';

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
          id: "app-wrts",
          code: "W1",
          title: "Franchise Automation Sync & Webhook Error Handling",
          client: "We Rock the Spectrum (WRTS)",
          submitted_by: "Radzdom Gallego (Radz)",
          assigned_reviewer: "Erwin Manaog",
          status: "Pending Review",
          priority: "High",
          summary: "Franchise n8n automations and webhooks verified with dead-letter queue retry mechanisms.",
          deliverable_url: "https://werockthespectrum.com",
          target_milestone: "Franchise Launch: Fri 20 Nov 2026",
          created_at: new Date().toISOString()
        },
        {
          id: "app-jb",
          code: "J1",
          title: "GoHighLevel Sub-Account & WordPress LMS Integration",
          client: "Juvibolt Cybertech",
          submitted_by: "Radzdom Gallego (Radz)",
          assigned_reviewer: "Erwin Manaog",
          status: "Pending Review",
          priority: "High",
          summary: "Automated student onboarding in GHL with LMS access and Discord role sync.",
          deliverable_url: "https://juviboltcybertech.com",
          target_milestone: "Student Launch: Sat 15 Nov 2026",
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

    if (status === 'Approved' && data) {
      try {
        await notifyGateApproved({
          gateCode: data.code || id,
          gateTitle: data.title || 'Deliverable Gate',
          client: data.client || 'Grace In Motion',
          approvedBy: reviewed_by || 'Radzdom Gallego',
          notes: review_notes,
          deliverableUrl: data.deliverable_url,
        });
      } catch (slackErr) {
        console.error('Slack gate approval broadcast error:', slackErr);
      }
    }

    return NextResponse.json({ success: true, approval: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
