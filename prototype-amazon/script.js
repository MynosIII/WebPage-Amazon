(function () {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const language = root.lang === 'en' ? 'en' : 'es';
  const isEnglish = language === 'en';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The discovery bar is one shared product component on every route. The
  // static markup remains a no-JS fallback; this is the runtime source of
  // truth for labels, order, destinations and English state.
  (function normalizeDiscoveryHeader() {
    const nav = document.querySelector('.department-nav__track');
    const scope = document.querySelector('.search-scope');
    const inPrototypeFolder = window.location.pathname.startsWith('/prototype-amazon/');
    const prefix = inPrototypeFolder ? '' : '/';
    const params = new URLSearchParams(window.location.search);
    const currentSection = document.body.classList.contains('catalog-page') ? (params.get('section') || 'all') : '';
    const sections = isEnglish ? [
      ['all', 'All work'],
      ['ecommerce', 'Amazon Growth & PPC'],
      ['bi', 'Business Intelligence'],
      ['creative', 'Data-to-Creative'],
      ['articles', 'Systems & articles'],
      ['research', 'Research'],
      ['other', 'Automation & code']
    ] : [
      ['all', 'Todo el portfolio'],
      ['ecommerce', 'Amazon Growth & PPC'],
      ['bi', 'Business Intelligence'],
      ['creative', 'Data-to-Creative'],
      ['articles', 'Sistemas y artículos'],
      ['research', 'Investigación'],
      ['other', 'Automatización y código']
    ];
    const sectionHref = function (key) {
      return prefix + 'catalog.html?section=' + key + (isEnglish ? '&lang=en' : '');
    };
    if (nav) {
      nav.replaceChildren.apply(nav, sections.map(function (section, index) {
        const link = document.createElement('a');
        link.href = sectionHref(section[0]);
        link.textContent = section[1];
        link.dataset.sectionLink = section[0];
        if (index === 0) link.className = 'department-nav__all';
        if (section[0] === currentSection) link.setAttribute('aria-current', 'page');
        return link;
      }));
    }
    if (scope) {
      const selected = scope.value;
      scope.replaceChildren.apply(scope, sections.map(function (section) {
        const option = document.createElement('option');
        option.value = section[0];
        option.textContent = section[1];
        return option;
      }));
      scope.value = sections.some(function (section) { return section[0] === selected; }) ? selected : 'all';
    }
  })();

  // One icon vocabulary across navigation, account tiles and contact actions.
  // Brand marks identify real destinations; functional icons describe actions.
  const icons = {
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12l9 3 9-3M10 14v3h4v-3"/>',
    history: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/>',
    integrations: '<path d="M8 3v5m8-5v5M6 8h12v3a6 6 0 0 1-6 6v4M8 8V6m8 2V6"/>',
    cv: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M6 16c0-3 6-3 6 0m3-7h3m-3 4h3m-3 3h3"/>',
    chart: '<path d="M4 3v17h17M8 16v-5m5 5V7m5 9V4"/>',
    creative: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
    focus: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
    github: '<path fill="currentColor" stroke="none" d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.79-1.508-3.79-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.022-.698.077-.684.077-.684 1.13.08 1.724 1.16 1.724 1.16 1.005 1.722 2.635 1.224 3.277.936.103-.728.393-1.224.715-1.506-2.498-.284-5.124-1.25-5.124-5.563 0-1.23.44-2.234 1.16-3.023-.116-.285-.503-1.429.111-2.978 0 0 .945-.303 3.094 1.155A10.79 10.79 0 0 1 12 6.182c.956.005 1.918.13 2.816.378 2.148-1.458 3.092-1.155 3.092-1.155.615 1.549.228 2.693.112 2.978.722.789 1.158 1.793 1.158 3.023 0 4.324-2.63 5.275-5.136 5.553.404.35.765 1.043.765 2.1 0 1.518-.014 2.743-.014 3.116 0 .3.203.65.774.54A11.252 11.252 0 0 0 12 .75Z"/>',
    linkedin: '<path fill="currentColor" stroke="none" d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.46 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.29 10.85H15.8V14.1c0-1.11-.02-2.53-1.55-2.53-1.55 0-1.79 1.2-1.79 2.45v4.73H9.51V9.2h2.83v1.31h.04c.39-.75 1.35-1.55 2.78-1.55 2.97 0 3.52 1.96 3.52 4.5v5.29Z"/>'
  };
  function icon(name) {
    const span = document.createElement('span');
    span.className = 'ui-icon';
    span.setAttribute('aria-hidden', 'true');
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + icons[name] + '</svg>';
    return span;
  }
  const accountIcons = ['briefcase', 'history', 'integrations', 'cv', 'mail'];
  document.querySelectorAll('.account-card__icon').forEach(function (element, index) { element.replaceChildren(icon(accountIcons[index] || 'briefcase')); });
  document.querySelectorAll('.help-option__code').forEach(function (element, index) { element.replaceChildren(icon(['chart', 'chart', 'creative'][index])); });
  document.querySelectorAll('a[href]').forEach(function (link) {
    if (link.classList.contains('account-card') || link.classList.contains('help-option')) return;
    const href = link.getAttribute('href');
    const name = /github\.com/.test(href) ? 'github' : /linkedin\.com/.test(href) ? 'linkedin' : /^mailto:|^contact\.html/.test(href) ? 'mail' : /source=.*cv-/.test(href) ? 'cv' : null;
    if (name) link.prepend(icon(name));
  });
  const themeToggle = document.querySelector('[data-theme-toggle]');

  function syncThemeToggle() {
    if (!themeToggle) return;
    const isDark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isEnglish ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : (isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'));
    const label = themeToggle.querySelector('[data-theme-label]');
    if (label) label.textContent = isEnglish ? (isDark ? 'Light mode' : 'Dark mode') : (isDark ? 'Modo claro' : 'Modo oscuro');
  }

  if (themeToggle) {
    syncThemeToggle();
    themeToggle.addEventListener('click', function () {
      const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = nextTheme;
      try { localStorage.setItem('mg-theme', nextTheme); } catch (error) { /* Preference remains session-only. */ }
      syncThemeToggle();
    });
  }

  const revealTargets = Array.from(document.querySelectorAll([
    '.sponsored-banner > *',
    '.filter-panel',
    '.results-heading',
    '.portfolio-result',
    '.section-heading',
    '.evidence-strip > *',
    '.operator-profile__grid > *',
    '.contact-strip__grid > *',
    '.breadcrumb',
    '.case-product > *',
    '.workspace-heading > *',
    '.workspace-nav',
    '.workspace-panel',
    '.account-hero > *',
    '.account-card',
    '.activity-row',
    '.catalog-toolbar > *',
    '.catalog-result',
    '.source-shell > *',
    '.help-hero > *',
    '.help-option',
    '.contact-checklist > *',
    '.direct-contact > *'
  ].join(',')));

  revealTargets.forEach(function (target, index) {
    target.dataset.reveal = '';
    target.style.setProperty('--reveal-delay', Math.min(index % 5, 4) * 55 + 'ms');
  });

  function revealPage() {
    root.classList.add('is-ready');

    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach(function (target) { target.classList.add('is-visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '140px 0px', threshold: 0.01 });

    revealTargets.forEach(function (target) { observer.observe(target); });
    window.setTimeout(function () {
      revealTargets.forEach(function (target) {
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    }, 1600);
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(revealPage);
  });

  function prepareOuterMedia() {
    const media = Array.from(document.querySelectorAll('img:not(.identity__logo), video'));
    media.forEach(function (element, index) {
      const container = element.closest('.sponsored-banner__media, .result-media, .case-gallery__stage, .case-gallery__thumbs button');
      if (!container) return;
      container.classList.add('is-media-pending');
      if (element.tagName === 'IMG') {
        element.decoding = 'async';
        if (index === 0) {
          element.loading = 'eager';
          element.fetchPriority = 'high';
        }
      }
      const ready = function () {
        container.classList.remove('is-media-pending', 'is-media-error');
        container.classList.add('is-media-ready');
      };
      const failed = function () {
        container.classList.remove('is-media-pending', 'is-media-ready');
        container.classList.add('is-media-error');
      };
      element.addEventListener(element.tagName === 'VIDEO' ? 'loadeddata' : 'load', ready, { once: true });
      element.addEventListener('error', failed, { once: true });
      if ((element.tagName === 'IMG' && element.complete && element.naturalWidth) || (element.tagName === 'VIDEO' && element.readyState >= 2)) ready();
    });
  }

  prepareOuterMedia();

  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  function closeMenu() {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('.sr-only').textContent = isEnglish ? 'Open navigation' : 'Abrir navegación';
    menu.classList.remove('is-open');
    body.classList.remove('menu-open');
  }

  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function () {
      const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(willOpen));
      menuToggle.querySelector('.sr-only').textContent = isEnglish ? (willOpen ? 'Close navigation' : 'Open navigation') : (willOpen ? 'Cerrar navegación' : 'Abrir navegación');
      menu.classList.toggle('is-open', willOpen);
      body.classList.toggle('menu-open', willOpen);
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  // The catalog owns filtering. Homepage shortcuts are ordinary, shareable links.
  document.querySelectorAll('a[data-query]').forEach(function (link) {
    const url = new URL(link.href);
    url.searchParams.set('q', link.dataset.query);
    link.href = url.href;
  });

  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const mainImage = gallery.querySelector('[data-gallery-main]');
    const galleryButtons = Array.from(gallery.querySelectorAll('[data-gallery-src]'));

    galleryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        mainImage.classList.remove('is-switching');
        void mainImage.offsetWidth;
        mainImage.src = button.dataset.gallerySrc;
        mainImage.alt = button.dataset.galleryAlt;
        mainImage.classList.add('is-switching');
        galleryButtons.forEach(function (item) {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        window.setTimeout(function () { mainImage.classList.remove('is-switching'); }, 280);
      });
    });
  }

  const tabList = document.querySelector('[data-tabs]');
  if (tabList) {
    const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
    const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));

    function activateTab(tab, moveFocus) {
      tabs.forEach(function (item) {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });

      panels.forEach(function (panel) {
        const active = panel.id === tab.getAttribute('aria-controls');
        panel.hidden = !active;
        if (active) {
          panel.classList.remove('is-panel-entering');
          void panel.offsetWidth;
          panel.classList.add('is-panel-entering');
        }
      });

      if (moveFocus) tab.focus();
      window.history.replaceState(null, '', '#' + tab.getAttribute('aria-controls').replace('panel-', ''));
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { activateTab(tab, false); });
      tab.addEventListener('keydown', function (event) {
        let nextIndex = null;
        if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          activateTab(tabs[nextIndex], true);
        }
      });
    });

    const requested = window.location.hash.replace('#', '');
    const requestedTab = tabs.find(function (tab) {
      return tab.getAttribute('aria-controls') === 'panel-' + requested;
    });
    if (requestedTab) activateTab(requestedTab, false);
  }
})();
