export function subscribeLocation(listener: () => void): () => void {
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
  };
}

export function getLocationSearch(): string {
  return window.location.search;
}

export function getServerLocationSearch(): string {
  return '';
}
