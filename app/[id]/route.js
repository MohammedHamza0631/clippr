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

  // 2) Optionally parse user agent for device info
  const userAgent = request.headers.get("user-agent") || "";
  const parsed = Bowser.parse(userAgent);
  const device = parsed.platform?.type;

  const res = await fetch("https://ipapi.co/json/");
  const data = await res.json();
  const city = data.city;
  const country = data.country_name;

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
