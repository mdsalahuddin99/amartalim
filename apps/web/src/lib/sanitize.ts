import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize rich HTML (blog content, editor preview).
 * Allows common formatting + media (img, iframe for YouTube), strips scripts/handlers.
 */
export const sanitizeHtml = (dirty: string): string => {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "target",
      "rel",
      "loading",
      "referrerpolicy",
    ],
    FORBID_TAGS: ["style", "script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data:image\/):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
};

/**
 * Stricter: for admin-supplied ad snippets (allow scripts intentionally — admin only).
 * Kept opt-in and separate so it never accidentally runs on user content.
 */
export const sanitizeAdSnippet = (dirty: string): string => {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ADD_TAGS: ["iframe", "script", "ins"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "async", "src", "data-*", "crossorigin"],
  });
};

/** Escape XML/HTML entities for RSS. */
export const escapeXml = (s: string): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** Strip all HTML tags for plaintext excerpts. */
export const stripHtml = (dirty: string): string =>
  sanitizeHtml(dirty).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
