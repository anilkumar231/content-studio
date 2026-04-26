// ============================================================
// CONTENT STUDIO CONFIGURATION
// ============================================================
// Edit this file to personalize your Content Studio.
// ============================================================

export const studio = {
  // --- Creator Identity ---
  creator: {
    name: "Anil Kumar",
    channelName: "Anilytix",
    handle: "@Anilytix",
    subscriberCount: "Growing",
    niche: "AI & Technology",
    nicheDescription: "AI tools, tips, and automation in Hinglish for Indian audience",
  },

  // --- Brand Voice ---
  voice: {
    tone: "enthusiastic but grounded, Hinglish mix",
    rules: [
      "Direct, action-oriented",
      "First-person, conversational Hinglish",
      "Short paragraphs with line breaks",
      "Mix Hindi and English naturally — like how educated Indians talk",
      "Tech terms stay in English (AI, prompt, tool, feature, API)",
      "No AI-sounding phrases like 'game-changer', 'revolutionary', 'let's dive in'",
    ],
  },

  // --- Links (shown in video descriptions, CTAs, etc.) ---
  links: {
    primary: "https://youtube.com/@Anilytix",
    primaryLabel: "Subscribe on YouTube",
    secondary: "https://instagram.com/anilytix",
    secondaryLabel: "Follow on Instagram",
  },

  // --- Video Description Template ---
  publishTemplate: {
    descriptionHeader: `━━━━━━━━━━━━━━━━━━━━━━━━━━
Anilytix - AI Samjho. Life Badlo.
Har din ek nayi AI trick, bilkul simple Hinglish mein.
━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    pinnedCommentCTA:
      "Agar aapko yeh video helpful lagi toh LIKE karo aur SUBSCRIBE karo! Comment mein batao aapne kya seekha 👇",
  },

  // --- Carousel Slide Branding ---
  carousel: {
    brandName: "Anilytix",
    creatorFullName: "Anil Kumar",
    handle: "@Anilytix",
    accentColor: "#4F6AFF",
    headshot: "/assets/headshot.png",
  },

  // --- Peer Channels to Track ---
  peers: [
    {
      name: "Anilytix",
      handle: "@Anilytix",
      url: "https://www.youtube.com/@Anilytix",
      isOwn: true,
    },
    {
      name: "Technical Guruji",
      handle: "@TechnicalGuruji",
      url: "https://www.youtube.com/@TechnicalGuruji",
    },
    {
      name: "Gaurav Thakkar",
      handle: "@GauravThakkarChannel",
      url: "https://www.youtube.com/@GauravThakkarChannel",
    },
    {
      name: "AI Wallah",
      handle: "@AIWallah",
      url: "https://www.youtube.com/@AIWallah",
    },
    {
      name: "College Wallah",
      handle: "@CollegeWallah",
      url: "https://www.youtube.com/@CollegeWallah",
    },
  ] as { name: string; handle: string; url: string; isOwn?: boolean }[],

  // --- AI News Analysis ---
  newsAnalysis: {
    audienceDescription:
      "Indian students, professionals, and small business owners (18-40) curious about using AI in daily life",
    focusTopics: ["AI", "automation", "Gemini", "ChatGPT", "productivity", "India"],
  },
};

// --- Helper: Build system prompt intro ---
export function creatorContext(): string {
  const { creator } = studio;
  return `"${creator.channelName}" (${creator.subscriberCount} subs, ${creator.niche} niche - ${creator.nicheDescription})`;
}

// --- Helper: Build voice rules string ---
export function voiceRules(): string {
  return studio.voice.rules.map((r) => `- ${r}`).join("\n");
}
