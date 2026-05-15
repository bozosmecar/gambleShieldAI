import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "div",
];

const ALLOWED_ATTR = [
  "href",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "target",
  "rel",
  "referrerpolicy",
  "colspan",
  "rowspan",
  "scope",
  "width",
  "height",
  "loading",
];

/**
 * Sanitize blog HTML before injecting it via dangerouslySetInnerHTML.
 * Strips <script>, on* handlers, javascript:/data:/vbscript: URLs, SVGs, etc.
 *
 * @param {string} dirty
 * @returns {string}
 */
export function sanitizeBlogHtml(dirty) {
  if (!dirty || typeof dirty !== "string") return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Block embedded SVGs and MathML entirely.
    USE_PROFILES: { html: true },
    // Force external links through enforceExternalAnchorRel() upstream; we still
    // refuse javascript:/data:/vbscript: schemes at the sanitizer level.
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto|tel|#|\/)[^\s]*)$/i,
    FORBID_TAGS: ["style", "svg", "math", "iframe", "object", "embed", "form"],
    FORBID_ATTR: [
      "style",
      "srcset",
      "formaction",
      "xlink:href",
      "onload",
      "onerror",
      "onclick",
      "onmouseover",
    ],
  });
}

/**
 * Returns the given URL only if it's a safe https/relative URL. Otherwise null.
 * Used to validate post.image / inline <img src> values that come from the DB.
 *
 * @param {unknown} value
 * @returns {string | null}
 */
export function safeImageUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:") return url.toString();
    return null;
  } catch {
    return null;
  }
}
