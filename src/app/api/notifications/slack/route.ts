import { NextRequest, NextResponse } from 'next/server';
import {
  notifyEosSubmitted,
  notifyGateApproved,
  notifyTaskUpdated,
  notifyCampaignStaged,
} from '@/lib/slack/notifier';

export async function GET() {
  const isConfigured = !!(process.env.SLACK_WEBHOOK_URL || process.env.N8N_SLACK_WEBHOOK_URL);
  return NextResponse.json({
    status: 'ok',
    isConfigured,
    provider: process.env.SLACK_WEBHOOK_URL
      ? 'direct_slack_webhook'
      : process.env.N8N_SLACK_WEBHOOK_URL
      ? 'n8n_relay'
      : 'simulated_local',
    targetChannels: {
      shiftReports: '#gim-shift-reports',
      clientOps: '#gim-client-ops',
      socialMedia: '#gim-social-media',
      general: '#gim-mission-control',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json(
        { error: 'Missing notification type or payload' },
        { status: 400 }
      );
    }

    let result;
    switch (type) {
      case 'eos':
        result = await notifyEosSubmitted(payload);
        break;
      case 'gate':
        result = await notifyGateApproved(payload);
        break;
      case 'task':
        result = await notifyTaskUpdated(payload);
        break;
      case 'campaign':
        result = await notifyCampaignStaged(payload);
        break;
      case 'test':
        result = await notifyTaskUpdated({
          taskTitle: 'Mission Control Slack Channel Handshake Test',
          client: 'Grace In Motion (Internal)',
          newStatus: 'Verified Active',
          assigneeName: 'Radzdom Gallego',
          updatedBy: payload.sender || 'System Administrator',
          priority: 'High',
        });
        break;
      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, dispatch: result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
