import { useState } from "react";
import fallbackImage1 from "../../assets/avatar_fallback_1.svg";
import fallbackImage2 from "../../assets/avatar_fallback_2.svg";

/**
 * Reusable Avatar Component with deterministic fallback mechanism.
 * @param {string} src - The image URL
 * @param {string} alt - Alt text for accessibility
 * @param {string} identifier - Used to deterministically pick fallback 1 or 2 (e.g. ID, name)
 * @param {string} className - Optional tailwind classes for sizing and styling
 */
function Avatar({ src, alt, identifier = "", className = "h-8 w-8 rounded-full" }) {
  const [imgError, setImgError] = useState(false);

  // Deterministically choose fallback based on the identifier's first character code,
  // or default to fallback 1 if identifier is empty.
  const getFallback = () => {
    if (!identifier) return fallbackImage1;
    const charCode = identifier.charCodeAt(0) || 0;
    return charCode % 2 === 0 ? fallbackImage1 : fallbackImage2;
  };

  const currentSrc = (src && !imgError) ? src : getFallback();

  return (
    <img
      src={currentSrc}
      alt={alt || "Avatar"}
      onError={() => setImgError(true)}
      className={`object-cover ${className}`}
    />
  );
}

export default Avatar;
