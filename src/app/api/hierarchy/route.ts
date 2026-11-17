import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CANONICAL_GIM_SPACES } from "@/lib/hierarchy/defaults";
import { Space } from "@/lib/hierarchy/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // 1. Try querying Supabase spaces, folders, and lists
    const { data: dbSpaces, error: spacesError } = await supabase
      .from("spaces")
      .select(`
        id,
        workspace_id,
        name,
        slug,
        icon,
        color,
        is_private,
        status_config,
        position,
        folders (
          id,
          space_id,
          name,
          color,
          position,
          is_archived,
          lists (
            id,
            space_id,
            folder_id,
            name,
            description,
            color,
            status_config,
            position,
            is_archived
          )
        ),
        lists (
          id,
          space_id,
          folder_id,
          name,
          description,
          color,
          status_config,
          position,
          is_archived
        )
      `)
      .order("position", { ascending: true });

    if (!spacesError && dbSpaces && dbSpaces.length > 0) {
      // Process database spaces to segregate standalone lists
      const spaces: Space[] = dbSpaces.map((s: any) => ({
        ...s,
        // Only standalone lists that don't belong to a folder
        lists: (s.lists || []).filter((l: any) => !l.folder_id),
        folders: s.folders || [],
      }));

      return NextResponse.json({
        success: true,
        workspace: {
          id: "ws-gim",
          name: "Grace In Motion (GIM)",
          slug: "gim-agency",
        },
        spaces,
        source: "database",
      });
    }

    // 2. Fallback to canonical seed spaces (with zero interruption)
    return NextResponse.json({
      success: true,
      workspace: {
        id: "ws-gim",
        name: "Grace In Motion (GIM)",
        slug: "gim-agency",
      },
      spaces: CANONICAL_GIM_SPACES,
      source: "canonical_seed",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({
      success: true,
      workspace: {
        id: "ws-gim",
        name: "Grace In Motion (GIM)",
        slug: "gim-agency",
      },
      spaces: CANONICAL_GIM_SPACES,
      source: "fallback_seed",
      warning: message,
    });
  }
}
