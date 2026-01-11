export function getPathname(fullUrl: string) {
  return new URL(fullUrl).pathname;
}
