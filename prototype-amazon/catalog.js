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
  const language = document.documentElement.lang === 'en' || params.get('lang') === 'en' ? 'en' : 'es';
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

  // Each department has its own layout and card label (see the
  // "Section identities" block in styles.css).
  const sectionStyle = {
    all: { layout: 'list' },
    ecommerce: { layout: 'grid', label: isEnglish ? 'Case' : 'Caso' },
    bi: { layout: 'grid', label: 'Panel' },
    creative: { layout: 'grid', label: '' },
    articles: { layout: 'grid', label: 'Nº' },
    research: { layout: 'list', label: '' },
    other: { layout: 'grid', label: '' }
  };

  function thumbFor(image, width) {
    return '/assets/catalog-thumbs/' + image.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + width + '.webp';
  }

  function sectionArtMarkup(name) {
    if (name === 'ecommerce') {
      return '<svg viewBox="0 0 360 190" focusable="false"><path class="art-grid" d="M0 150H360M0 100H360M0 50H360"/><path class="art-area" d="M10 160 L70 138 L120 146 L170 104 L220 112 L270 66 L340 40 L340 190 L10 190Z"/><path class="art-line" d="M10 160 L70 138 L120 146 L170 104 L220 112 L270 66 L340 40"/></svg>' +
        '<span class="art-chip"><small>CVR</small>13,69%</span><span class="art-chip"><small>ROAS</small>6,26</span><span class="art-chip"><small>' + (isEnglish ? 'Sales' : 'Ventas') + '</small>×1,8</span>';
    }
    if (name === 'bi') {
      return [38, 54, 46, 70, 92, 64, 80].map(function (height, index) { return '<i style="--h:' + height + '%;--n:' + index + '"></i>'; }).join('');
    }
    if (name === 'creative') {
      const covers = items.filter(function (item) { return item.categories.includes('creative') && item.image && !/\.svg$/i.test(item.image); }).slice(0, 3);
      return covers.map(function (item, index) {
        const n = index - 1;
        return '<span style="--n:' + n + ';--i:' + index + ';--z:' + (index === 1 ? 30 : 0) + '"><img src="' + thumbFor(item.image, 480) + '" alt="" width="240" height="300" decoding="async"></span>';
      }).join('');
    }
    if (name === 'articles') return [0, 1, 2].map(function (n) { return '<span style="--n:' + n + '"></span>'; }).join('');
    if (name === 'research') return [1, 2, 3, 4].map(function (n) { return '<i style="--n:' + n + '"></i>'; }).join('') + '<b>“</b>';
    if (name === 'other') {
      const lines = isEnglish ? ['python report.py --weekly', 'node automate.js --sync', 'deploy --prod ✓'] : ['python reporte.py --semanal', 'node automatizar.js --sync', 'deploy --prod ✓'];
      return '<header><i></i><i></i><i></i></header>' + lines.map(function (line, index) { return '<p style="--n:' + index + '">' + line + '</p>'; }).join('');
    }
    return '';
  }

  function syncSectionArt() {
    const toolbar = document.querySelector('.catalog-toolbar');
    if (!toolbar) return;
    let art = toolbar.querySelector('.section-art');
    if (art && art.dataset.art === section && (section !== 'creative' || art.childElementCount)) return;
    art?.remove();
    const markup = sectionArtMarkup(section);
    if (!markup) return;
    art = document.createElement('div');
    art.className = 'section-art section-art--' + section;
    art.dataset.art = section;
    art.setAttribute('aria-hidden', 'true');
    art.innerHTML = markup;
    toolbar.insertBefore(art, toolbar.querySelector('.catalog-sort'));
  }

  // The creative section also hosts the interactive 3D model lab, the only
  // 3D-interactive element of the site. Its module (and three.js, later) loads
  // only when this section is shown.
  function syncModelLab() {
    let lab = document.querySelector('[data-model-lab]');
    if (section !== 'creative') {
      if (lab) lab.hidden = true;
      return;
    }
    if (!lab) {
      lab = document.createElement('section');
      lab.className = 'model-lab';
      lab.id = 'modelado-3d';
      lab.setAttribute('aria-labelledby', 'model-lab-title');
      lab.dataset.modelLab = '';
      document.querySelector('.catalog-layout')?.before(lab);
      import('/prototype-amazon/model-lab.js').then(function (module) { module.mountModelLab(lab, language); }).catch(function () { lab.hidden = true; });
    }
    lab.hidden = false;
  }

  function normalize(value) {
    return String(value || '').toLocaleLowerCase(language).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function prototypeUrl(item) {
    return '/' + item.url.split('/').map(encodeURIComponent).join('/');
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
    return '<div class="case-logo-row" role="list" aria-label="' + escape(names) + '">' + toolLogos.map(function (tool) {
      return '<span role="listitem" title="' + escape(tool.name) + '"><img src="../assets/software-logos/' + escape(tool.asset) + '" alt="" width="28" height="28" loading="lazy" decoding="async"></span>';
    }).join('') + '</div>';
  }

  function cardMarkup(item, index) {
    const style = sectionStyle[section] || sectionStyle.all;
    const number = String(index + 1).padStart(2, '0');
    let extra = '';
    if (section === 'other') {
      extra = '<div class="catalog-result__chrome" aria-hidden="true"><i></i><i></i><i></i><span>~/' + (isEnglish ? 'projects' : 'proyectos') + '/' + escape(item.url.replace(/-(?:es|en)\.html$/i, '').split('/').pop()) + '</span></div>';
    } else if (style.label !== undefined) {
      extra = '<span class="catalog-result__index" aria-hidden="true">' + (style.label ? style.label + ' ' : '') + number + '</span>';
    }
    return '<article class="catalog-result" data-source="' + item.url + '">' + extra +
      '<a class="catalog-result__media is-media-pending" data-media-fit="' + (item.mediaFit || 'cover') + '"' + (item.imageSet?.length ? ' data-media-kind="icon-mosaic"' : '') + ' href="' + prototypeUrl(item) + '" tabindex="-1" aria-hidden="true"><span class="catalog-media-skeleton" data-catalog-placeholder></span></a>' +
      '<div class="catalog-result__body"><p class="result-kicker">' + item.categoryLabel + '</p><h3><a href="' + prototypeUrl(item) + '">' + escape(item.title) + '</a></h3><p>' + escape(item.description) + '</p>' + toolLogoMarkup(item.toolLogos) + '</div></article>';
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
      if (media.thumbs) {
        // Small WebP thumbnails from scripts/build_catalog_thumbs.py; fall back to the original.
        element.srcset = media.thumbs[0] + ' 480w, ' + media.thumbs[1] + ' 800w';
        element.sizes = media.sizes || '(max-width: 700px) 92vw, 340px';
        element.addEventListener('error', function () { element.removeAttribute('srcset'); element.src = media.url; }, { once: true });
        element.src = media.thumbs[0];
      } else {
        element.src = media.url;
      }
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
      const thumbs = /\.svg$/i.test(item.image) ? null : [480, 800].map(function (width) { return thumbFor(item.image, width); });
      showMedia(card, { type: 'image', url: resolveMedia('/' + item.image, item.url), thumbs: thumbs, sizes: card.dataset.sizes }, priority);
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
      url.searchParams.delete('lang');
      url.pathname = url.pathname.replace(/catalog(?:-en)?\.html$/, isEnglish ? 'catalog.html' : 'catalog-en.html');
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
    const style = sectionStyle[section] || sectionStyle.all;
    list.className = 'catalog-list' + (section === 'all' ? '' : ' catalog-list--' + section + (style.layout === 'grid' ? ' catalog-list--grid' : ''));
    list.innerHTML = visible.map(cardMarkup).join('');
    syncSectionArt();
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
      if (style.layout === 'grid') card.dataset.sizes = section === 'creative' && index === 0 ? '(max-width: 620px) 92vw, 640px' : '(max-width: 620px) 92vw, (max-width: 1024px) 45vw, 460px';
      hydrateImage(card, index < 4);
    });
  }

  function syncSection() {
    const meta = sectionMeta[section] || sectionMeta.all;
    document.body.dataset.section = section;
    syncModelLab();
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
    window.history.replaceState(null, '', '?section=' + encodeURIComponent(section) + (input?.value ? '&q=' + encodeURIComponent(input.value) : '') + (isEnglish && !/-en\.html$/.test(window.location.pathname) ? '&lang=en' : ''));
    render();
  });
  sort?.addEventListener('change', render);
})();
