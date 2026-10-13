(() => {
  const { locale, base } = document.documentElement.dataset;
  const preferenceKey = 'beiyan-site-language';
  // Explicit page URLs select their language. The home entrance also remembers
  // the last choice; translated links keep that choice throughout the site.
  try {
    const saved = localStorage.getItem(preferenceKey);
    const home = location.pathname === `${base}/` || location.pathname === `${base}/index.html`;
    if (home && locale === 'zh' && saved === 'en') {
      location.replace(`${base}/en/${location.search}${location.hash}`);
      return;
    }
    localStorage.setItem(preferenceKey, locale);
  } catch {
    // Static language links continue to work when storage is unavailable.
  }
  document.addEventListener('DOMContentLoaded', () => {
    for (const link of document.querySelectorAll('[data-language]')) {
      const target = new URL(link.href);
      target.search = location.search;
      target.hash = location.hash;
      link.href = target.href;
      link.addEventListener('click', () => {
        try { localStorage.setItem(preferenceKey, link.dataset.language); } catch {}
      });
    }
  });
})();
