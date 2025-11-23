export function isActiveTabPathValid(url: string, activeTab: string) {
  return url.endsWith(normalizeActiveTabPath(activeTab));
}

export function normalizeActiveTabPath(tab: string) {
  return `/${tab === 'vault' ? '' : tab}`;
}
