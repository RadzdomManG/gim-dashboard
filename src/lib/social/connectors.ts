// Multi-Tenant Social Media OAuth Connectors & AI Copy Adapter Suite
// Platforms: Facebook, TikTok, LinkedIn, YouTube

export interface SocialPlatformConfig {
  id: "facebook" | "tiktok" | "linkedin" | "youtube";
  name: string;
  brandColor: string;
  badgeBg: string;
  badgeText: string;
  supportedMedia: ("image" | "video" | "carousel" | "cloud_link")[];
  oauthScopes: string[];
  description: string;
}

export const SOCIAL_PLATFORMS: Record<string, SocialPlatformConfig> = {
  facebook: {
    id: "facebook",
    name: "Facebook Pages & Groups",
    brandColor: "#1877F2",
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    supportedMedia: ["image", "video", "cloud_link"],
    oauthScopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    description: "Publish to client Facebook Business Pages, schedule community posts, and sync comment replies.",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Creator & Business",
    brandColor: "#000000",
    badgeBg: "bg-zinc-100 border-zinc-300",
    badgeText: "text-zinc-900",
    supportedMedia: ["video"],
    oauthScopes: ["video.upload", "video.publish", "user.info.basic"],
    description: "Direct TikTok video publishing, viral hook scheduling, sound syncing, and creator analytics.",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn Company & Profile",
    brandColor: "#0A66C2",
    badgeBg: "bg-sky-50 border-sky-200",
    badgeText: "text-sky-700",
    supportedMedia: ["image", "video", "carousel", "cloud_link"],
    oauthScopes: ["w_member_social", "w_organization_social", "r_organization_social"],
    description: "Post thought leadership, carousel slides from Canva/Drive, and company announcements.",
  },
  youtube: {
    id: "youtube",
    name: "YouTube Channel & Shorts",
    brandColor: "#FF0000",
    badgeBg: "bg-red-50 border-red-200",
    badgeText: "text-red-700",
    supportedMedia: ["video"],
    oauthScopes: ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"],
    description: "Schedule YouTube Shorts, upload video releases with high-CTR tags, and auto-reply to comments.",
  },
};

export interface ClientSocialAccount {
  clientId: string;
  clientName: string;
  platform: "facebook" | "tiktok" | "linkedin" | "youtube";
  isConnected: boolean;
  accountHandle: string;
  accountName: string;
  avatarUrl?: string;
  connectedAt?: string;
  connectedBy?: string;
  tokenExpires?: string;
}

export interface SocialPost {
  id: string;
  clientId: string;
  clientName: string;
  authorName: string;
  authorNickname: string;
  platforms: ("facebook" | "tiktok" | "linkedin" | "youtube")[];
  rawBrief: string;
  adaptedCopy: {
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
  };
  mediaType: "direct_upload" | "cloud_link" | "none";
  mediaUrl?: string;
  mediaName?: string;
  cloudProvider?: "canva" | "gdrive" | "dropbox";
  scheduledFor: string;
  status: "Draft" | "Scheduled" | "Published" | "Failed";
  taskIdRef?: string;
  createdAt: string;
  commentsCount?: number;
  recentComments?: {
    id: string;
    platform: "facebook" | "tiktok" | "linkedin" | "youtube";
    author: string;
    avatar?: string;
    text: string;
    timestamp: string;
    reply?: string;
  }[];
}

// Active client configurations for social media connectors
const CLIENT_CONFIGS = [
  { id: "we-rock-the-spectrum", name: "We Rock the Spectrum (WRTS)" },
  { id: "juvibolt-cybertech", name: "Juvibolt Cybertech" },
  { id: "studio-nets", name: "Studio Nets" },
  { id: "invogue-cleans", name: "InVogue Cleans" },
  { id: "risewise", name: "Risewise" },
  { id: "noirlab", name: "NoirLab" },
  { id: "gim-internal", name: "Grace In Motion (Internal)" },
];

// Initial pre-configured accounts: all start disconnected until authentic credentials/OAuth are granted
export const INITIAL_CLIENT_ACCOUNTS: ClientSocialAccount[] = CLIENT_CONFIGS.flatMap((client) => [
  {
    clientId: client.id,
    clientName: client.name,
    platform: "facebook",
    isConnected: false,
    accountHandle: "",
    accountName: "",
  },
  {
    clientId: client.id,
    clientName: client.name,
    platform: "tiktok",
    isConnected: false,
    accountHandle: "",
    accountName: "",
  },
  {
    clientId: client.id,
    clientName: client.name,
    platform: "linkedin",
    isConnected: false,
    accountHandle: "",
    accountName: "",
  },
  {
    clientId: client.id,
    clientName: client.name,
    platform: "youtube",
    isConnected: false,
    accountHandle: "",
    accountName: "",
  },
]);

// Seeded active scheduled posts
export const SEED_SOCIAL_POSTS: SocialPost[] = [
  {
    id: "post-101",
    clientId: "we-rock-the-spectrum",
    clientName: "We Rock the Spectrum (WRTS)",
    authorName: "Camille Lopez",
    authorNickname: "Camille",
    platforms: ["facebook", "tiktok"],
    rawBrief: "Sensory Sunday Open Gym announcement with quiet rooms and CVRC approval reminder for parents.",
    adaptedCopy: {
      facebook: "🌟 Attention Clovis Families! Our Sensory Sunday Open Gym is officially open this weekend! 🎈 Safe, inclusive, and tailored for all sensory needs with certified sensory specialists. 💡 Reminder: CVRC authorized families can verify their winter sessions with our front desk team today. Drop a comment below or DM us to reserve your spot! 💚 #SensoryGym #WRTSClovis #InclusionMatters",
      tiktok: "Wait till you see this sensory zip-line! 🤩 Sunday open gym is back in Clovis CA! CVRC accepted. Link in bio to book your quiet session! 🎈✨ #sensorygym #autismfriendly #clovisca #sensoryplay",
    },
    mediaType: "direct_upload",
    mediaName: "sensory-gym-weekend-hero.mp4",
    mediaUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1200&q=80",
    scheduledFor: "2026-11-15T10:00:00",
    status: "Scheduled",
    taskIdRef: "wrts-social-01",
    createdAt: "2026-11-12T14:30:00",
    commentsCount: 3,
    recentComments: [
      {
        id: "c-1",
        platform: "facebook",
        author: "Sarah Jenkins (Parent)",
        text: "Are CVRC approvals required in advance or can we bring our paperwork on Sunday?",
        timestamp: "2 hours ago",
        reply: "Hi Sarah! You can bring your CVRC authorization letter right to the front desk, and our team will get your little one checked in immediately. Can't wait to see you! 💚",
      },
    ],
  },
  {
    id: "post-102",
    clientId: "juvibolt-cybertech",
    clientName: "Juvibolt Cybertech",
    authorName: "Camille Lopez",
    authorNickname: "Camille",
    platforms: ["linkedin", "youtube"],
    rawBrief: "Juvibolt Cohort 1 Cybersecurity Career Roadmap: 3 high-paying security roles for non-technical beginners in 2027.",
    adaptedCopy: {
      linkedin: "The biggest myth in tech: \"You need a Computer Science degree to work in Cybersecurity.\"\n\nHere are 3 high-paying cybersecurity specializations actively hiring non-technical career switchers in 2027:\n\n1. SOC Analyst Tier 1 (Security Operations Center) — Focus on monitoring alerts & incident triage.\n2. GRC Analyst (Governance, Risk & Compliance) — Focus on security frameworks (NIST, ISO 27001) and policy auditing.\n3. Junior Cloud Security Associate — Focus on AWS/Azure IAM permissions and identity security.\n\nAt Juvibolt Cybertech, our Cohort 1 students get hands-on lab experience from Day 1 with real enterprise breach simulations.\n\nReady to build your cyber career? Apply for Cohort 1 via the link in the comments. 🛡️\n\n#Cybersecurity #TechCareers #CareerTransition #Juvibolt",
      youtube: "Top 3 Cybersecurity Jobs in 2027 (NO Degree Needed) 🛡️ | Juvibolt Career Blueprint\n\nLooking to break into cybersecurity with zero coding background? In this short breakdown, Aaron Ofosu and the Juvibolt team reveal the 3 fastest growing entry-level roles:\n1. SOC Analyst\n2. GRC Specialist\n3. Cloud IAM Auditor\n\n📌 Join Juvibolt Cohort 1: https://juviboltcybertech.com/cohort1\n\nTags: #cybersecurity #techcareers #socanalyst #juvibolt",
    },
    mediaType: "cloud_link",
    mediaName: "Canva: Juvibolt 3-Roles Carousel Deck",
    mediaUrl: "https://www.canva.com/design/juvibolt-cyber-careers-2027",
    cloudProvider: "canva",
    scheduledFor: "2026-11-16T14:00:00",
    status: "Scheduled",
    taskIdRef: "142f25zmxg",
    createdAt: "2026-11-12T16:00:00",
    commentsCount: 5,
  },
  {
    id: "post-103",
    clientId: "studio-nets",
    clientName: "Studio Nets",
    authorName: "Camille Lopez",
    authorNickname: "Camille",
    platforms: ["facebook", "linkedin"],
    rawBrief: "Client brand transformation case study: How minimal brand typography and consistent design tokens doubled conversion.",
    adaptedCopy: {
      facebook: "Design is not just what it looks like — it is how it performs! 🎨 Check out our latest client identity overhaul at Studio Nets. A clean, high-contrast palette combined with WCAG AAA accessibility resulted in a 42% lift in lead conversions. What do you think of this warm aesthetic? 💬✨ #BrandDesign #StudioNets #CreativeStrategy",
      linkedin: "Why 80% of B2B rebrands fail: They focus on aesthetics without conversion architecture.\n\nFor our latest partner at Studio Nets, we engineered a modular design token system and streamlined user journeys:\n• Page speed improved by 60%\n• Accessible contrast passed WCAG AAA\n• Form submissions increased by 42%\n\nGood design is good business. Read our full case study below. 🚀\n\n#DesignTokens #BrandStrategy #UIUX #StudioNets",
    },
    mediaType: "cloud_link",
    mediaName: "Google Drive: Studio Nets Case Study Slides.pdf",
    mediaUrl: "https://drive.google.com/drive/folders/studionets-assets",
    cloudProvider: "gdrive",
    scheduledFor: "2026-11-14T09:00:00",
    status: "Published",
    createdAt: "2026-11-11T11:00:00",
    commentsCount: 2,
  },
];

// 1-Click Multi-Platform AI Copywriter Engine
export function generatePlatformCopy(
  brief: string,
  clientName: string,
  platform: "facebook" | "tiktok" | "linkedin" | "youtube"
): string {
  const cleanBrief = brief.trim();
  if (!cleanBrief) return "";

  switch (platform) {
    case "tiktok":
      return `Wait till you hear this! 🤯 ${cleanBrief.slice(0, 80)}... \n\nSave this for later! Drop a comment if you want part 2 👇✨ \n\n#trending #${clientName.replace(/\s+/g, "").toLowerCase()} #viral #fyp`;

    case "youtube":
      return `${cleanBrief.slice(0, 60)} 🔥 (Watch This!)\n\nIn this video, ${clientName} breaks down: ${cleanBrief}\n\n👉 Subscribe for more weekly insights!\n💬 Let us know your thoughts in the comments.\n\n#shorts #${clientName.replace(/\s+/g, "").toLowerCase()} #tips`;

    case "linkedin":
      return `Here's what nobody talks about when it comes to ${clientName}:\n\n${cleanBrief}\n\nKey takeaways for team leads and founders:\n• Focus on speed of execution\n• Build transparent systems\n• Protect quality across all customer touchpoints\n\nWhat has been your experience with this? Would love to hear your perspective in the comments below! 👇\n\n#Leadership #Operations #${clientName.replace(/\s+/g, "")} #Productivity`;

    case "facebook":
      return `Hey everyone! 👋 Quick update from the ${clientName} team:\n\n${cleanBrief}\n\nWe would love to know — how is your team handling this right now? Drop a comment below and let's discuss! 💬✨\n\n#${clientName.replace(/\s+/g, "")} #Community #Updates`;

    default:
      return cleanBrief;
  }
}
