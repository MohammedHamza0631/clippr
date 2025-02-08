import { NextResponse } from "next/server";
import Bowser from "bowser";
import supabase from "@/db/supabase";
import { getLongUrl } from "@/db/apiUrls";
import { checkRateLimit, getCachedUrl, cacheUrl } from "@/utils/redis";

export async function GET(request, { params }) {
  const { id } = params;

  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0].trim() || "127.0.0.1";

  const rateLimitResult = await checkRateLimit(clientIp);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
        },
      }
    );
  }

  // Check cache first
  const cachedData = await getCachedUrl(id);
  let shortLinkData;

  if (cachedData) {
    shortLinkData = JSON.parse(cachedData);
  } else {
    // If not in cache, get from database
    shortLinkData = await getLongUrl(id);

    if (shortLinkData) {
      // Cache the result for future requests
      await cacheUrl(id, JSON.stringify(shortLinkData));
    }
  }
  if (!shortLinkData || !shortLinkData.original_url) {
    return NextResponse.json(
      { error: "Short link not found" },
      { status: 404 }
    );
  }

  let city = "";
  let country = "";
  try {
    const geoRes = await fetch(
      `https://ipinfo.io/${clientIp}?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`
    );
    const geoData = await geoRes.json();
    city = geoData.city || "";
    country = geoData.country || "";
  } catch (err) {
    console.error("ipapi error:", err);
  }

  const userAgent = request.headers.get("user-agent") || "";
  const parsed = Bowser.parse(userAgent);
  const device = parsed.platform?.type;

  const { error } = await supabase.from("clicks").insert({
    url_id: shortLinkData.id,
    city: city,
    country: country,
    device: device,
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (error) {
    console.error("Error inserting click:", error.message);
    // if error then also redirect, don't want users to get stuck
    // return NextResponse.redirect(shortLinkData.original_url, 302);
  }

  // 5) Do a server-side 302 redirect to the original URL
  return NextResponse.redirect(shortLinkData.original_url, 302);
}
