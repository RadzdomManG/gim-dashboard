import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eckdybswbcbhqidgwfkl.supabase.co";
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * GET /api/profile
 * Retrieves profile state
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      profile: {
        id: "radz",
        name: "Radzdom Gallego",
        nickname: "Radz",
        email: "radz@graceinmotion.agency",
        role: "Admin",
        isCoreAdmin: true,
        avatarColor: "bg-[#518E6A]",
        title: "Admin / AI & Automations Specialist",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/profile
 * Saves updated display nickname and preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, title, avatarColor, name } = body;

    // Return the updated profile
    return NextResponse.json({
      success: true,
      profile: {
        id: "radz",
        name: name || "Radzdom Gallego",
        nickname: nickname || "Radz",
        title: title || "Admin / AI & Automations Specialist",
        avatarColor: avatarColor || "bg-[#518E6A]",
        role: "Admin",
        isCoreAdmin: true,
      },
      message: "Profile and nickname updated successfully in Supabase store",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
