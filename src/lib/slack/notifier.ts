/**
 * Grace in Motion (GIM) — Slack Automation Notifier
 * 
 * Dispatches real-time operational notifications and EOS reports to GIM Slack channels
 * via standard incoming webhooks or an n8n webhook relay.
 */

export interface EosNotificationPayload {
  memberName: string;
  memberNickname?: string;
  role: string;
  clientScope?: string;
  completedTasks: string;
  blockers?: string;
  prioritiesTomorrow?: string;
  hoursLogged?: number;
}

export interface GateApprovalPayload {
  gateCode: string;
  gateTitle: string;
  client: string;
  approvedBy: string;
  notes?: string;
  deliverableUrl?: string;
}

export interface TaskStatusPayload {
  taskTitle: string;
  client: string;
  oldStatus?: string;
  newStatus: string;
  assigneeName?: string;
  updatedBy: string;
  priority?: string;
}

export interface CampaignStagedPayload {
  campaignTitle: string;
  client: string;
  platforms: string[];
  postCount: number;
  stagedBy: string;
}

/**
 * Sends a raw Slack Block Kit message to configured webhook
 */
async function sendToSlack(payload: Record<string, unknown>): Promise<{ success: boolean; simulated: boolean; error?: string }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.N8N_SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[SLACK SIMULATION] No SLACK_WEBHOOK_URL configured. Payload preview:', JSON.stringify(payload, null, 2));
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[SLACK ERROR] Dispatch failed:', res.status, errText);
      return { success: false, simulated: false, error: errText };
    }

    return { success: true, simulated: false };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown Slack dispatch error';
    console.error('[SLACK EXCEPTION]', msg);
    return { success: false, simulated: false, error: msg };
  }
}

/**
 * 1. End of Shift (EOS) Report Notification
 * Broadcasts to #gim-shift-reports
 */
export async function notifyEosSubmitted(data: EosNotificationPayload) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📝 End of Shift (EOS) Report — ${data.memberNickname || data.memberName}`,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Role:* ${data.role}  |  *Client Context:* ${data.clientScope || 'All Accounts'}  |  *Hours:* ${data.hoursLogged ? `${data.hoursLogged}h` : 'Full Shift'}`,
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*✅ Completed Today:*\n${data.completedTasks}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🚧 Blockers / Flags:*\n${data.blockers && data.blockers.trim() ? data.blockers : 'None (All deliverables green)'}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎯 Priorities for Next Shift:*\n${data.prioritiesTomorrow || 'Continue sprint targets'}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `_Submitted via GIM Mission Control at ${new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Sydney' })} AEST_`,
        },
      ],
    },
  ];

  return sendToSlack({
    text: `📝 EOS Report: ${data.memberNickname || data.memberName} completed their shift.`,
    blocks,
  });
}

/**
 * 2. Deliverable Quality Gate Approval Notification
 * Broadcasts to #gim-client-ops
 */
export async function notifyGateApproved(data: GateApprovalPayload) {
  const blocks: Array<Record<string, unknown>> = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🛡️ Deliverable Gate Approved: [${data.gateCode}]`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Client:*\n${data.client}`,
        },
        {
          type: 'mrkdwn',
          text: `*Deliverable:*\n${data.gateTitle}`,
        },
        {
          type: 'mrkdwn',
          text: `*Approved By:*\n${data.approvedBy}`,
        },
        {
          type: 'mrkdwn',
          text: `*Status:*\n:white_check_mark: *Signed Off (Production Ready)*`,
        },
      ],
    },
  ];

  if (data.notes) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Review Notes:*\n${data.notes}`,
        },
      ],
    });
  }

  if (data.deliverableUrl) {
    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Deliverable Asset 🔗',
            emoji: true,
          },
          url: data.deliverableUrl,
          style: 'primary',
        },
      ],
    });
  }

  return sendToSlack({
    text: `🛡️ Deliverable Approved: Gate ${data.gateCode} for ${data.client} signed off by ${data.approvedBy}.`,
    blocks,
  });
}

/**
 * 3. Task Status Move or Reassignment Notification
 */
export async function notifyTaskUpdated(data: TaskStatusPayload) {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `📌 *Task Updated:* *${data.taskTitle}*\n*Client:* ${data.client}  |  *New Status:* \`${data.newStatus}\`${data.assigneeName ? `  |  *Assigned To:* ${data.assigneeName}` : ''}\n_Updated by ${data.updatedBy}_`,
      },
    },
  ];

  return sendToSlack({
    text: `📌 Task update: "${data.taskTitle}" moved to ${data.newStatus}.`,
    blocks,
  });
}

/**
 * 4. Social Media Campaign Staged Notification
 */
export async function notifyCampaignStaged(data: CampaignStagedPayload) {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📱 Social Media Campaign Staged — ${data.client}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Campaign:*\n${data.campaignTitle}`,
        },
        {
          type: 'mrkdwn',
          text: `*Platforms:*\n${data.platforms.join(', ')}`,
        },
        {
          type: 'mrkdwn',
          text: `*Total Posts:*\n${data.postCount} Scheduled`,
        },
        {
          type: 'mrkdwn',
          text: `*Staged By:*\n${data.stagedBy}`,
        },
      ],
    },
  ];

  return sendToSlack({
    text: `📱 Social Campaign: "${data.campaignTitle}" staged for ${data.client}.`,
    blocks,
  });
}
