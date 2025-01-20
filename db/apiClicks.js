import supabase from "./supabase";
import { UAParser } from "ua-parser-js";
import Bowser from "bowser";

export async function getClicksForUrls(urlIds) {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .in("url_id", urlIds);

  if (error) {
    console.error("Error fetching clicks:", error);
    return null;
  }

  return data;
}

export async function getClicksForUrl(url_id) {
  const { data, error } = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

// const parser = new UAParser();

export const storeClicks = async ({ id, originalUrl }) => {
  try {
    // const res = parser.getResult();
    const res = Bowser.parse(navigator.userAgent);
    const device = res.platform?.type;
    let city = "Unknown";
    let country = "Unknown";
    try {
      const response = await fetch("https://ipapi.co/json");
      const data = await response.json();
      city = data.city;
      country = data.country_name;
    } catch (geoError) {
      console.error("Error fetching geolocation:", geoError);
    }

    // Record the click
    const { data, error } = await supabase.from("clicks").insert({
      url_id: id,
      city: city,
      country: country,
      device: device,
    });

    if (error) {
      console.error("Insert error:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, 600));
    // Redirect to the original URL
    window.location.href = originalUrl;
  } catch (error) {
    console.error("Error recording click:", error);

    // Redirect to the original URL
    window.location.href = originalUrl
  }
};
