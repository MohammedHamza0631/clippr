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
    const res = Bowser.parse(window.navigator.userAgent);
    const device = res.platform.type;

    const response = await fetch("https://ipapi.co/json");
    const { city, country_name: country } = await response.json();

    // Record the click
    await supabase.from("clicks").insert({
      url_id: id,
      city: city,
      country: country,
      device: device,
    });

    // Redirect to the original URL
    window.location.href = originalUrl;
  } catch (error) {
    console.error("Error recording click:", error);
  }
};
