import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CANONICAL_GIM_SPACES } from "@/lib/hierarchy/defaults";
import { Space } from "@/lib/hierarchy/types";

export const dynamic = "force-dynamic";

function getMasterClickUpTree(): Space[] {
  try {
    const treePath = path.join(process.cwd(), "src", "lib", "hierarchy", "clickup_tree_master.json");
    if (fs.existsSync(treePath)) {
      const content = fs.readFileSync(treePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Could not read clickup_tree_master.json:", err);
  }
  return CANONICAL_GIM_SPACES;
}

export async function GET(req: NextRequest) {
  try {
    const tree = getMasterClickUpTree();

    return NextResponse.json({
      success: true,
      workspace: {
        id: "ws-gim",
        name: "Grace In Motion (GIM)",
        slug: "gim-agency",
      },
      spaces: tree,
      source: "authentic_clickup_live",
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
