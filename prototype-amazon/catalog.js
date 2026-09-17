(function () {
  'use strict';

  const list = document.querySelector('[data-catalog-list]');
  if (!list) return;

  const input = document.querySelector('[data-catalog-input]');
  const form = document.querySelector('[data-catalog-search]');
  const count = document.querySelector('[data-catalog-count]');
  const empty = document.querySelector('[data-catalog-empty]');
  const sort = document.querySelector('[data-catalog-sort]');
  const scope = document.querySelector('[data-catalog-scope]');
  const title = document.querySelector('[data-catalog-title]');
  const description = document.querySelector('[data-catalog-description]');
  const crumb = document.querySelector('[data-catalog-crumb]');
  const params = new URLSearchParams(window.location.search);
  const language = params.get('lang') === 'en' ? 'en' : 'es';
  const isEnglish = language === 'en';
  let section = params.get('section') || 'all';
  let items = [];
  let searchTimer;
  const mediaCache = new Map();

  const sectionMeta = isEnglish ? {
    all: ['All work', 'Cases, working systems, research and creative work within one architecture.'],
    ecommerce: ['Ecommerce and Amazon Growth', 'Cases and systems where traffic, conversion, media, catalog and profitability are read together.'],
    bi: ['Business Intelligence', 'Sales, advertising and profitability analysis.'],
    creative: ['Creative and media', 'Galleries, campaigns, motion and product content built to answer concrete questions.'],
    articles: ['Systems and articles', 'Operational frameworks that turn experience into reusable methods.'],
    research: ['Research and analysis', 'Projects that turn data, discourse and behavior into actionable readings.'],
    other: ['Other projects', 'Software, automations and technical experiments outside the main ecommerce flow.']
  } : {
    all: ['Todo el catálogo', 'Casos, sistemas de trabajo, investigación y piezas creativas dentro de una sola arquitectura.'],
    ecommerce: ['Ecommerce y Amazon Growth', 'Casos y sistemas donde tráfico, conversión, pauta, catálogo y rentabilidad se leen en conjunto.'],
    bi: ['Business Intelligence', 'Análisis de ventas, publicidad y rentabilidad.'],
    creative: ['Creatividad y medios', 'Galerías, campañas, motion y contenido de producto construido para responder preguntas concretas.'],
    articles: ['Sistemas y artículos', 'Frameworks operativos para transformar experiencia en métodos reutilizables.'],
    research: ['Investigación y análisis', 'Proyectos que convierten datos, discurso y comportamiento en una lectura accionable.'],
    other: ['Otros proyectos', 'Software, automatizaciones y experimentos técnicos fuera del flujo principal de ecommerce.']
  };

  function normalize(value) {
    return String(value || '').toLocaleLowerCase(language).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function prototypeUrl(url) {
    const suffix = isEnglish ? '?lang=en' : '';
    if (url === 'caso-1-' + language + '.html') return 'case-amazon-growth.html' + suffix;
    if (url === 'sobre-mi-' + language + '.html') return 'about.html' + suffix;
    if (url === 'index.html' || url === 'index-' + language + '.html') return 'index.html' + suffix;
    return 'page.html?source=' + encodeURIComponent('../' + url) + (isEnglish ? '&lang=en' : '');
  }

  function toolText(toolLogos) {
    return Array.isArray(toolLogos) ? toolLogos.map(function (tool) { return tool.name; }).join(' ') : '';
  }

  function escape(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; });
  }

  function toolLogoMarkup(toolLogos) {
    if (!Array.isArray(toolLogos) || !toolLogos.length) return '';
    const names = toolLogos.map(function (tool) { return tool.name; }).join(', ');
    return '<ul class="case-logo-row" aria-label="' + escape(names) + '">' + toolLogos.map(function (tool) {
      return '<li title="' + escape(tool.name) + '"><img src="../assets/software-logos/' + escape(tool.asset) + '" alt="" width="28" height="28" loading="lazy" decoding="async"></li>';
    }).join('') + '</ul>';
  }

  function cardMarkup(item) {
    return '<article class="catalog-result" data-source="' + item.url + '">' +
      '<a class="catalog-result__media is-media-pending" data-media-fit="' + (item.mediaFit || 'cover') + '"' + (item.imageSet?.length ? ' data-media-kind="icon-mosaic"' : '') + ' href="' + prototypeUrl(item.url) + '" tabindex="-1" aria-hidden="true"><span class="catalog-media-skeleton" data-catalog-placeholder></span></a>' +
      '<div class="catalog-result__body"><p class="result-kicker">' + item.categoryLabel + '</p><h3><a href="' + prototypeUrl(item.url) + '">' + escape(item.title) + '</a></h3><p>' + escape(item.description) + '</p>' + toolLogoMarkup(item.toolLogos) + '</div></article>';
  }

  function resolveMedia(value, source) {
    if (!value || value.startsWith('data:')) return '';
    return new URL(value, new URL('../' + source, window.location.href)).href.replace(/\+/g, '%2B');
  }

  function markMediaState(mediaBox, state) {
    mediaBox.classList.remove('is-media-pending', 'is-media-ready', 'is-media-error');
    mediaBox.classList.add('is-media-' + state);
  }

  function showMedia(card, media, priority) {
    const mediaBox = card.querySelector('.catalog-result__media');
    const placeholder = mediaBox.querySelector('[data-catalog-placeholder]');
    let element;

    if (media.type === 'video') {
      element = document.createElement('video');
      element.src = media.url;
      element.muted = true;
      element.loop = true;
      element.playsInline = true;
      element.preload = 'metadata';
      element.setAttribute('aria-hidden', 'true');
      element.addEventListener('loadeddata', function () { markMediaState(mediaBox, 'ready'); }, { once: true });
      element.addEventListener('loadedmetadata', function () {
        if (element.duration > 0.2) element.currentTime = Math.min(0.2, element.duration / 4);
      }, { once: true });
    } else {
      element = document.createElement('img');
      element.src = media.url;
      element.alt = '';
      element.decoding = 'async';
      element.loading = priority ? 'eager' : 'lazy';
      if (priority) element.fetchPriority = 'high';
      element.addEventListener('load', function () { markMediaState(mediaBox, 'ready'); }, { once: true });
    }

    element.addEventListener('error', function () { markMediaState(mediaBox, 'error'); }, { once: true });
    placeholder?.replaceWith(element);
    if ((element.tagName === 'IMG' && element.complete && element.naturalWidth) || (element.tagName === 'VIDEO' && element.readyState >= 2)) {
      markMediaState(mediaBox, 'ready');
    }
  }

  function showImageSet(card, urls, priority) {
    const mediaBox = card.querySelector('.catalog-result__media');
    const placeholder = mediaBox.querySelector('[data-catalog-placeholder]');
    const mosaic = document.createElement('span');
    mosaic.className = 'catalog-icon-mosaic';
    mosaic.setAttribute('aria-hidden', 'true');
    let settled = 0;
    let failed = false;
    const settle = function (didFail) {
      settled += 1;
      failed = failed || didFail;
      if (settled === urls.length) markMediaState(mediaBox, failed ? 'error' : 'ready');
    };
    urls.forEach(function (url) {
      const image = document.createElement('img');
      let imageSettled = false;
      const finishImage = function (didFail) {
        if (imageSettled) return;
        imageSettled = true;
        settle(didFail);
      };
      image.src = url;
      image.alt = '';
      image.decoding = 'async';
      image.loading = priority ? 'eager' : 'lazy';
      image.addEventListener('load', function () { finishImage(false); }, { once: true });
      image.addEventListener('error', function () { finishImage(true); }, { once: true });
      mosaic.appendChild(image);
      if (image.complete) finishImage(!image.naturalWidth);
    });
    placeholder?.replaceWith(mosaic);
  }

  function hydrateImage(card, priority) {
    if (card.dataset.imageHydrated === 'true') return;
    card.dataset.imageHydrated = 'true';
    const item = items.find(function (item) { return item.url === card.dataset.source; });
    if (item?.imageSet?.length) {
      showImageSet(card, item.imageSet.map(function (image) { return resolveMedia('/' + image, item.url); }), priority);
    } else if (item?.image) {
      showMedia(card, { type: 'image', url: resolveMedia('/' + item.image, item.url) }, priority);
    }
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    if (input?.value) url.searchParams.set('q', input.value);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
    const locale = document.querySelector('.locale');
    if (locale) {
      if (isEnglish) url.searchParams.delete('lang');
      else url.searchParams.set('lang', 'en');
      locale.href = url.href;
    }
  }

  function render() {
    syncUrl();
    const query = normalize(input?.value);
    let visible = items.filter(function (item) {
      const sectionMatches = section === 'all' || item.categories.includes(section);
      const queryMatches = !query || normalize(item.title + ' ' + item.description + ' ' + item.keywords + ' ' + toolText(item.toolLogos)).includes(query);
      return sectionMatches && queryMatches;
    });
    if (sort?.value === 'title') visible.sort(function (a, b) { return a.title.localeCompare(b.title, language); });
    list.innerHTML = visible.map(cardMarkup).join('');
    list.setAttribute('aria-busy', 'false');
    count.textContent = isEnglish ? (visible.length === 1 ? '1 result' : visible.length + ' results') : (visible.length === 1 ? '1 resultado' : visible.length + ' resultados');
    empty.hidden = visible.length !== 0;
    Array.from(list.querySelectorAll('.catalog-result')).forEach(function (card, index) {
      card.dataset.reveal = '';
      card.style.setProperty('--reveal-delay', Math.min(index % 4, 3) * 55 + 'ms');
      requestAnimationFrame(function () { card.classList.add('is-visible'); });
      // Assign every source immediately and let native lazy loading schedule
      // decoding. A second IntersectionObserver layer could miss cards when a
      // user scrubbed quickly through a long catalog, leaving blank media.
      hydrateImage(card, index < 4);
    });
  }

  function syncSection() {
    const meta = sectionMeta[section] || sectionMeta.all;
    title.textContent = meta[0];
    description.textContent = meta[1];
    crumb.textContent = meta[0];
    document.querySelectorAll('[data-section-link]').forEach(function (link) { link.removeAttribute('aria-current'); });
    document.querySelector('[data-section-link="' + section + '"]')?.setAttribute('aria-current', 'page');
    if (scope) scope.value = section;
  }

  if (!sectionMeta[section]) section = 'all';
  syncSection();
  if (params.get('q') && input) input.value = params.get('q');

  fetch('/prototype-amazon/catalog-data.json?v=20260903b').then(function (response) {
    if (!response.ok) throw new Error('No se pudo abrir el índice');
    return response.json();
  }).then(function (data) {
    items = data.filter(function (item) { return item.lang === language; }).map(function (item) {
      const category = item.categories[0];
      return Object.assign({}, item, { category: category, categoryLabel: sectionMeta[category][0] });
    });
    render();
  }).catch(function () {
    list.setAttribute('aria-busy', 'false');
    list.innerHTML = isEnglish ? '<div class="system-message"><strong>The catalog could not be loaded.</strong><p>Reload the page or return home to keep exploring.</p></div>' : '<div class="system-message"><strong>No se pudo cargar el catálogo.</strong><p>Recargá la página o volvé al inicio para seguir explorando.</p></div>';
    count.textContent = isEnglish ? 'Catalog unavailable' : 'Catálogo no disponible';
  });

  form?.addEventListener('submit', function (event) { event.preventDefault(); render(); });
  input?.addEventListener('input', function () {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(render, 120);
  });
  scope?.addEventListener('change', function () {
    section = scope.value;
    syncSection();
    window.history.replaceState(null, '', '?section=' + encodeURIComponent(section) + (input?.value ? '&q=' + encodeURIComponent(input.value) : '') + (isEnglish ? '&lang=en' : ''));
    render();
  });
  sort?.addEventListener('change', render);
})();
