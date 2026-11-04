import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        id,
        email,
        full_name,
        role,
        client_id,
        assigned_clients,
        token,
        expires_at,
        accepted_at,
        is_revoked,
        created_at,
        clients:client_id (
          id,
          name,
          code
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, full_name, username: rawUsername, password, role = 'team_member', client_id, assigned_clients = [] } = body;

    const cleanUsername = (rawUsername || (full_name ? full_name.toLowerCase().replace(/\s+/g, '.') : '')).trim().toLowerCase();
    if (!cleanUsername && !full_name) {
      return NextResponse.json({ error: 'Full name and username are required.' }, { status: 400 });
    }

    const trimmedEmail = (email && email.includes('@')) ? email.trim().toLowerCase() : `${cleanUsername || 'member'}@graceinmotion.agency`;
    const displayName = (full_name || cleanUsername).trim();
    const clientList: string[] = Array.isArray(assigned_clients) ? assigned_clients : [];

    // Map role to valid PostgreSQL enum
    const validRoles = [
      'owner',
      'admin',
      'operations_manager',
      'project_owner',
      'team_member',
      'client_user',
    ];
    const assignedRole = validRoles.includes(role) ? role : 'team_member';

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const redirectUrl = `${origin}/login?invite=accepted&email=${encodeURIComponent(trimmedEmail)}`;

    const supabase = createAdminClient();

    // 0. If a password is provided by the admin, create or update the user in Supabase Auth immediately
    if (password && password.trim()) {
      const cleanPassword = password.trim();
      const { data: userList } = await supabase.auth.admin.listUsers();
      const existingUser = userList?.users?.find(
        (u) =>
          u.email?.toLowerCase() === trimmedEmail.toLowerCase() ||
          u.user_metadata?.username?.toLowerCase() === cleanUsername
      );

      let authUserRecord: any = null;
      if (existingUser) {
        const updateRes = await supabase.auth.admin.updateUserById(existingUser.id, {
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            ...existingUser.user_metadata,
            username: cleanUsername,
            full_name: displayName,
            nickname: displayName.split(' ')[0],
            role: assignedRole,
            title: body.title || assignedRole,
            assigned_clients: clientList,
            clientScope: assignedRole === 'admin' ? 'all' : (clientList[0] || 'Little Treasures Company'),
            isCoreAdmin: assignedRole === 'admin',
          },
        });
        if (updateRes.error) {
          throw new Error(`Failed to update credentials: ${updateRes.error.message}`);
        }
        authUserRecord = updateRes.data.user;
      } else {
        const createRes = await supabase.auth.admin.createUser({
          email: trimmedEmail,
          password: cleanPassword,
          email_confirm: true,
          user_metadata: {
            username: cleanUsername,
            full_name: displayName,
            nickname: displayName.split(' ')[0],
            role: assignedRole,
            title: body.title || assignedRole,
            assigned_clients: clientList,
            clientScope: assignedRole === 'admin' ? 'all' : (clientList[0] || 'Little Treasures Company'),
            isCoreAdmin: assignedRole === 'admin',
          },
        });
        if (createRes.error) {
          throw new Error(`Failed to create cloud user: ${createRes.error.message}`);
        }
        authUserRecord = createRes.data.user;
      }

      // Record in public.invitations for audit history
      const uniqueToken = `gim_usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data: record, error: dbError } = await supabase
        .from('invitations')
        .insert({
          email: trimmedEmail,
          full_name: displayName,
          role: assignedRole,
          client_id: client_id || null,
          assigned_clients: clientList,
          token: uniqueToken,
          expires_at: expiresAt.toISOString(),
          accepted_at: new Date().toISOString(),
          is_revoked: false,
        })
        .select()
        .single();

      return NextResponse.json({
        success: true,
        message: `Account for ${displayName} (@${cleanUsername}) successfully created and verified.`,
        invitation: record,
        user: authUserRecord,
      });
    }

    // 1. Generate invitation action link from Supabase Auth Admin (for password-less email invitations only)
    let actionLink: string | null = null;
    let authError: string | null = null;
    let emailSent = false;

    try {
      const linkResult = await supabase.auth.admin.generateLink({
        type: 'invite',
        email: trimmedEmail,
        options: {
          redirectTo: redirectUrl,
          data: {
            full_name: displayName,
            role: assignedRole,
            client_id: client_id || null,
            assigned_clients: clientList,
          },
        },
      });

      if (linkResult.data?.properties?.action_link) {
        actionLink = linkResult.data.properties.action_link;
      } else if (linkResult.error) {
        authError = linkResult.error.message;
      }
    } catch (e: unknown) {
      authError = e instanceof Error ? e.message : 'Auth link error';
    }

    // 2. Dispatch email via Supabase Auth Admin
    try {
      const inviteResult = await supabase.auth.admin.inviteUserByEmail(trimmedEmail, {
        redirectTo: redirectUrl,
        data: {
          full_name: displayName,
          role: assignedRole,
          client_id: client_id || null,
          assigned_clients: clientList,
        },
      });

      if (!inviteResult.error) {
        emailSent = true;
      }
    } catch {
      // If direct email send throws, actionLink is still available for manual delivery
    }

    // 3. Generate a secure fallback token for tracking
    const uniqueToken = (actionLink?.split('token=')[1]?.split('&')[0]) || 
      `gim_inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 4. Record the invitation in public.invitations
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: record, error: dbError } = await supabase
      .from('invitations')
      .insert({
        email: trimmedEmail,
        full_name: displayName,
        role: assignedRole,
        client_id: client_id || null,
        assigned_clients: clientList,
        token: uniqueToken,
        expires_at: expiresAt.toISOString(),
        is_revoked: false,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({
        error: `Database recording failed: ${dbError.message}`,
        action_link: actionLink,
        email_sent: emailSent,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? `Invitation successfully sent to ${trimmedEmail} via Supabase.`
        : `Invitation created. Share the link directly with ${trimmedEmail}.`,
      invitation: record,
      action_link: actionLink,
      email_sent: emailSent,
      auth_error: authError,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
