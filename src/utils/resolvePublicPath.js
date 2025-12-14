export default function resolvePublicPath(p) {
  if (!p) return '';
  // If the path is already an absolute URL, return it unchanged
  if (p.startsWith('http://') || p.startsWith('https://')) return p;

  const pub = process.env.PUBLIC_URL || '';
  // If PUBLIC_URL is an absolute URL (a custom domain), avoid prefixing it
  // for media paths — this keeps media loading relative to the current origin
  // and prevents DNS resolution errors when the custom domain isn't configured.
  if (pub && (pub.startsWith('http://') || pub.startsWith('https://'))) {
    return p.startsWith('/') ? p : `/${p}`;
  }

  // If already prefixed with PUBLIC_URL, return as-is
  if (pub && p.startsWith(pub)) return p;

  // If it's an absolute path starting with '/', prepend PUBLIC_URL
  if (p.startsWith('/')) return `${pub}${p}`;

  // Otherwise return as provided (relative path)
  return p;
}
