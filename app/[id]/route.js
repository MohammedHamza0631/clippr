import { NextResponse } from "next/server";
import Bowser from "bowser";
import supabase from "@/db/supabase";
import { getLongUrl } from "@/db/apiUrls";

export async function GET(request, { params }) {
  const { id } = params;

  // 1) Look up your short link or custom link by 'id'
  //    This uses your existing getLongUrl() function
  const shortLinkData = await getLongUrl(id);
  if (!shortLinkData || !shortLinkData.original_url) {
    // If no matching link, respond with 404
    return NextResponse.json(
      { error: "Short link not found" },
      { status: 404 }
    );
  }

  // 2) Extract client IP from headers
  // Usually "x-forwarded-for" is a comma-separated list; take the first IP
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const clientIp = forwardedFor.split(",")[0].trim() || "127.0.0.1";
  // 3) Query ipapi.co with the client IP
  //    (Might need a paid plan if you exceed free usage)
  let city = "";
  let country = "";
  try {
    const geoRes = await fetch(`https://ipinfo.io/${clientIp}?token=${process.env.NEXT_PUBLIC_IPINFO_TOKEN}`);
    const geoData = await geoRes.json();
    city = geoData.city || "";
    country = geoData.country || "";
  } catch (err) {
    console.error("ipapi error:", err);
  }

  // 4) Parse user agent for device info
  const userAgent = request.headers.get("user-agent") || "";
  const parsed = Bowser.parse(userAgent);
  const device = parsed.platform?.type;

  const { error } = await supabase.from("clicks").insert({
    url_id: shortLinkData.id,
    city: city,
    country: country,
    device: device,
  });
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (error) {
    console.error("Error inserting click:", error.message);
    // Decide whether to redirect anyway or show error
    // Typically you still redirect, so users aren’t stuck
  }

  // 5) Do a server-side 302 redirect to the original URL
  return NextResponse.redirect(shortLinkData.original_url, 302);
}
