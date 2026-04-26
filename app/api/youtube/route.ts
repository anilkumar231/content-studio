import { getCached, getStaleCached, setCache } from "@/lib/api-cache";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

async function resolveChannelId(
  apiKey: string,
  channelIdOrHandle: string
): Promise<string | null> {
  // If it already looks like a channel ID (starts with UC), return as-is
  if (channelIdOrHandle.startsWith("UC")) {
    return channelIdOrHandle;
  }

  // If it's a handle like @Anilytix, look it up
  const handle = channelIdOrHandle.startsWith("@")
    ? channelIdOrHandle
    : `@${channelIdOrHandle}`;

  try {
    const res = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`
    );
    const data = await res.json();
    if (data.items?.[0]?.id) {
      return data.items[0].id;
    }
  } catch {
    // ignore
  }

  // Fallback: try as forUsername
  try {
    const res = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=id&forUsername=${encodeURIComponent(channelIdOrHandle.replace("@", ""))}&key=${apiKey}`
    );
    const data = await res.json();
    if (data.items?.[0]?.id) {
      return data.items[0].id;
    }
  } catch {
    // ignore
  }

  return null;
}

export async function GET() {
  if (!YOUTUBE_API_KEY || !YOUTUBE_CHANNEL_ID) {
    return Response.json(
      { error: "YouTube API key or Channel ID not configured" },
      { status: 500 }
    );
  }

  const cached = await getCached<{ channel: unknown; videos: unknown[] }>("youtube-own");
  if (cached) {
    return Response.json(cached);
  }

  try {
    // Resolve handle to channel ID if needed
    const resolvedChannelId = await resolveChannelId(YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID);
    if (!resolvedChannelId) {
      return Response.json(
        { error: `Could not resolve channel: ${YOUTUBE_CHANNEL_ID}. Make sure YOUTUBE_API_KEY is a Data API key (starts with AIzaSy...), not an OAuth client ID.` },
        { status: 404 }
      );
    }

    // Fetch channel statistics
    const channelRes = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=statistics&id=${resolvedChannelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();

    if (channelData.error) {
      console.error("YouTube API error:", channelData.error);
      const stale = await getStaleCached<{ channel: unknown; videos: unknown[] }>("youtube-own");
      if (stale) return Response.json(stale);
      return Response.json(
        { error: `YouTube API error: ${channelData.error.message}. Check that YOUTUBE_API_KEY is a Data API key.` },
        { status: channelData.error.code || 500 }
      );
    }

    if (!channelData.items?.[0]) {
      const stale = await getStaleCached<{ channel: unknown; videos: unknown[] }>("youtube-own");
      if (stale) return Response.json(stale);
      return Response.json({ error: "Channel not found" }, { status: 404 });
    }

    const stats = channelData.items[0].statistics;
    const channel = {
      subscriberCount: parseInt(stats.subscriberCount),
      viewCount: parseInt(stats.viewCount),
      videoCount: parseInt(stats.videoCount),
    };

    // Fetch recent videos
    const searchRes = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${resolvedChannelId}&order=date&maxResults=10&type=video&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchRes.json();

    const videoIds = (searchData.items || [])
      .map((item: { id: { videoId: string } }) => item.id.videoId)
      .join(",");

    let videos: Array<{
      title: string;
      views: number;
      likes: number;
      comments: number;
      publishedAt: string;
    }> = [];

    if (videoIds) {
      const videosRes = await fetch(
        `${YOUTUBE_API_BASE}/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      );
      const videosData = await videosRes.json();

      videos = (videosData.items || []).map(
        (video: {
          snippet: { title: string; publishedAt: string };
          statistics: {
            viewCount: string;
            likeCount: string;
            commentCount: string;
          };
        }) => ({
          title: video.snippet.title,
          views: parseInt(video.statistics.viewCount || "0"),
          likes: parseInt(video.statistics.likeCount || "0"),
          comments: parseInt(video.statistics.commentCount || "0"),
          publishedAt: video.snippet.publishedAt,
        })
      );
    }

    const result = { channel, videos };
    await setCache("youtube-own", result);
    return Response.json(result);
  } catch (err) {
    console.error("YouTube API error:", err);
    // Fall back to stale cache
    const stale = await getStaleCached<{ channel: unknown; videos: unknown[] }>("youtube-own");
    if (stale) {
      return Response.json(stale);
    }
    return Response.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
