import { useState, useEffect } from "react";

/**
 * A custom hook to detect if a given media query matches.
 * @param {string} query - The media query string to evaluate.
 * @returns {boolean} - Whether the media query matches or not.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const updateMatch = (event) => setMatches(event.matches);
    setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", updateMatch);
    return () => {
      mediaQueryList.removeEventListener("change", updateMatch);
    };
  }, [query]);

  return matches;
}
