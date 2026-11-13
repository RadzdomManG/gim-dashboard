import { NextRequest, NextResponse } from "next/server";
import { generatePlatformCopy } from "@/lib/social/connectors";

export const dynamic = "force-dynamic";

interface ParsedDayPost {
  dayIndex: number;
  dayLabel: string;
  topic: string;
  driveLink?: string;
  mediaName?: string;
  caption: string;
  scheduledDate: string;
  platforms: ("facebook" | "tiktok" | "linkedin" | "youtube")[];
  adaptedCopies: {
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, clientName = "We Rock the Spectrum (WRTS)", defaultPlatforms = ["facebook", "tiktok"] } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Campaign prompt is required." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();

    // 1. Extract Google Drive or Cloud Links from prompt
    const driveRegex = /(https?:\/\/(?:drive\.google\.com|docs\.google\.com|www\.canva\.com|dropbox\.com)[^\s]+)/gi;
    const driveMatches = cleanPrompt.match(driveRegex) || [];
    const primaryDriveUrl = driveMatches[0] || "";

    // 2. Detect Target Platforms from prompt
    const lower = cleanPrompt.toLowerCase();
    const detectedPlatforms: ("facebook" | "tiktok" | "linkedin" | "youtube")[] = [];
    if (lower.includes("facebook") || lower.includes("fb")) detectedPlatforms.push("facebook");
    if (lower.includes("tiktok") || lower.includes("tt")) detectedPlatforms.push("tiktok");
    if (lower.includes("linkedin") || lower.includes("li")) detectedPlatforms.push("linkedin");
    if (lower.includes("youtube") || lower.includes("yt") || lower.includes("shorts")) detectedPlatforms.push("youtube");

    const activePlatforms = detectedPlatforms.length > 0 ? detectedPlatforms : defaultPlatforms;

    // 3. Multi-Day Batch Parsing (Day 1, Day 2, Day 3... or multi-line items)
    // Matches patterns like "Day 1:", "Day 1 -", "Day 1.", "Day 2:", etc.
    const dayRegex = /(?:^|\n)(?:day\s*(\d+)[:\s\.-]+)([^\n]+(?:\n(?!day\s*\d+)[^\n]+)*)/gi;
    let match;
    const parsedDays: ParsedDayPost[] = [];
    let matchCount = 0;

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1); // Start tomorrow
    baseDate.setHours(10, 0, 0, 0);

    while ((match = dayRegex.exec(cleanPrompt)) !== null) {
      matchCount++;
      const dayNum = parseInt(match[1], 10) || matchCount;
      const rawDayContent = match[2].trim();

      // Separate title/topic vs caption
      const captionMatch = rawDayContent.match(/caption[:\s-]+([^\n]+(?:\n.+)*)/i);
      let dayCaption = "";
      let dayTopic = "";

      if (captionMatch) {
        dayCaption = captionMatch[1].trim();
        dayTopic = rawDayContent.substring(0, captionMatch.index).trim();
      } else {
        const lines = rawDayContent.split("\n").filter((l) => l.trim().length > 0);
        dayTopic = lines[0] || `Day ${dayNum} Content`;
        dayCaption = lines.slice(1).join("\n").trim() || dayTopic;
      }

      // Schedule date spaced out (every 1 or 2 days at 10:00 AM)
      const postDate = new Date(baseDate);
      postDate.setDate(baseDate.getDate() + (dayNum - 1) * 2);

      // Generate multi-platform copy for this day
      const adaptedCopies: Record<string, string> = {};
      activePlatforms.forEach((plat: "facebook" | "tiktok" | "linkedin" | "youtube") => {
        adaptedCopies[plat] = generatePlatformCopy(dayCaption, clientName, plat);
      });

      parsedDays.push({
        dayIndex: dayNum,
        dayLabel: `Day ${dayNum}`,
        topic: dayTopic,
        driveLink: primaryDriveUrl,
        mediaName: `GDrive Asset - Day ${dayNum} (${clientName})`,
        caption: dayCaption,
        scheduledDate: postDate.toISOString(),
        platforms: activePlatforms,
        adaptedCopies,
      });
    }

    // Fallback if user didn't explicitly write "Day 1, Day 2" but gave a single brief or list
    if (parsedDays.length === 0) {
      // Split by numbered list "1.", "2.", "3."
      const numListRegex = /(?:^|\n)(?:(\d+)\.[\s]+)([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/gi;
      let numMatch;
      let numCount = 0;

      while ((numMatch = numListRegex.exec(cleanPrompt)) !== null) {
        numCount++;
        const itemNum = parseInt(numMatch[1], 10) || numCount;
        const itemContent = numMatch[2].trim();

        const postDate = new Date(baseDate);
        postDate.setDate(baseDate.getDate() + (itemNum - 1) * 2);

        const adaptedCopies: Record<string, string> = {};
        activePlatforms.forEach((plat: "facebook" | "tiktok" | "linkedin" | "youtube") => {
          adaptedCopies[plat] = generatePlatformCopy(itemContent, clientName, plat);
        });

        parsedDays.push({
          dayIndex: itemNum,
          dayLabel: `Day ${itemNum}`,
          topic: itemContent.slice(0, 50),
          driveLink: primaryDriveUrl,
          mediaName: `GDrive Asset - Day ${itemNum}`,
          caption: itemContent,
          scheduledDate: postDate.toISOString(),
          platforms: activePlatforms,
          adaptedCopies,
        });
      }
    }

    // If still no multi-day items, treat whole prompt as a 1-day campaign post
    if (parsedDays.length === 0) {
      const adaptedCopies: Record<string, string> = {};
      activePlatforms.forEach((plat: "facebook" | "tiktok" | "linkedin" | "youtube") => {
        adaptedCopies[plat] = generatePlatformCopy(cleanPrompt, clientName, plat);
      });

      parsedDays.push({
        dayIndex: 1,
        dayLabel: "Day 1",
        topic: cleanPrompt.slice(0, 60),
        driveLink: primaryDriveUrl,
        mediaName: primaryDriveUrl ? "Cloud Drive Asset" : "Social Campaign Creative",
        caption: cleanPrompt,
        scheduledDate: baseDate.toISOString(),
        platforms: activePlatforms,
        adaptedCopies,
      });
    }

    return NextResponse.json({
      success: true,
      clientName,
      primaryDriveUrl,
      platforms: activePlatforms,
      totalDays: parsedDays.length,
      parsedDays,
      replyMessage: `I've analyzed your brief and Google Drive assets! 📁✨ I successfully parsed **${parsedDays.length} scheduled posts** for **${clientName}** across **${activePlatforms.join(", ")}**. 
      
Review each day's tailored copy below, make any tweaks, and click **Approve & Schedule All** to push them straight to the live queue! 🚀`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error parsing campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
