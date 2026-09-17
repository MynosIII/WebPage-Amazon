(function () {
  'use strict';

  const shell = document.querySelector('[data-source-shell]');
  const status = document.querySelector('[data-source-status]');
  const crumb = document.querySelector('[data-source-crumb]');
  if (!shell || !status) return;

  const params = new URLSearchParams(window.location.search);
  const language = document.documentElement.lang === 'en' ? 'en' : 'es';
  const isEnglish = language === 'en';
  let rawSource = params.get('source') || shell.dataset.sourceDefault;
  if (rawSource && isEnglish) rawSource = rawSource.replace(/-es(\.html)$/i, '-en$1');

  function showError(message) {
    status.innerHTML = '<strong>' + (isEnglish ? 'This project could not be opened.' : 'No se pudo abrir este proyecto.') + '</strong><span>' + message + '</span><a href="catalog.html?section=all' + (isEnglish ? '&lang=en' : '') + '">' + (isEnglish ? 'Return to the catalog' : 'Volver al catálogo') + '</a>';
    status.classList.add('is-error');
  }

  if (!rawSource) { showError(isEnglish ? 'The source page is missing.' : 'Falta la página de origen.'); return; }

  let sourceUrl;
  try {
    sourceUrl = new URL(rawSource, window.location.href);
    if (sourceUrl.origin !== window.location.origin || !sourceUrl.pathname.endsWith('.html') || sourceUrl.pathname.includes('/prototype-amazon/')) throw new Error('Origen inválido');
  } catch (error) {
    showError(isEnglish ? 'The requested path does not belong to this site.' : 'La ruta solicitada no pertenece al sitio.');
    return;
  }

  function prototypeLink(url) {
    const filename = url.pathname.split('/').pop();
    const targetIsEnglish = /-en\.html$/i.test(filename) || (!/-es\.html$/i.test(filename) && isEnglish);
    const languageQuery = targetIsEnglish ? '?lang=en' : '';
    const category = { articles: 'articles', ecommerce: 'ecommerce', creatives: 'creative', otros: 'other' }[filename.replace(/-(?:en|es)(?=\.html$)/i, '').replace(/\.html$/i, '').toLowerCase()];
    if (category) return 'catalog.html?section=' + category + (targetIsEnglish ? '&lang=en' : '');
    if (/^caso-1-(?:es|en)\.html$/i.test(filename)) return 'case-amazon-growth.html' + languageQuery + url.hash;
    if (/^sobre-mi-(?:es|en)\.html$/i.test(filename)) return 'about.html' + languageQuery + url.hash;
    if (filename === 'index.html' || /^index-(?:es|en)\.html$/i.test(filename)) return 'index.html' + languageQuery + url.hash;
    const relativePath = url.pathname.replace(/^\/+/, '');
    return 'page.html?source=' + encodeURIComponent('../' + relativePath) + (targetIsEnglish ? '&lang=en' : '') + url.hash;
  }

  function rewriteUrls(root, rewriteLinks) {
    if (rewriteLinks === undefined) rewriteLinks = true;
    function assetHref(value) {
      // Vercel treats a literal "+" in a static-file request as a space. Keep
      // filenames from the original portfolio intact by URL-encoding it.
      return new URL(value, sourceUrl).href.replace(/\+/g, '%2B');
    }

    root.querySelectorAll('[src], [poster]').forEach(function (element) {
      ['src', 'poster'].forEach(function (attribute) {
        const value = element.getAttribute(attribute);
        if (!value || value.startsWith('data:') || value.startsWith('blob:')) return;
        const resolved = new URL(assetHref(value));
        if (/^\/creatives\/ecommerce-video\/rollator-conversion-\d+\.mp4$/i.test(resolved.pathname)) {
          element.setAttribute(attribute, 'https://matiasgaglio.onrender.com' + resolved.pathname);
        } else {
          element.setAttribute(attribute, resolved.href);
        }
      });
    });
    root.querySelectorAll('[srcset]').forEach(function (element) {
      const rewritten = element.getAttribute('srcset').split(',').map(function (candidate) {
        const parts = candidate.trim().split(/\s+/);
        parts[0] = assetHref(parts[0]);
        return parts.join(' ');
      }).join(', ');
      element.setAttribute('srcset', rewritten);
    });
    root.querySelectorAll('object[data]').forEach(function (element) {
      element.setAttribute('data', assetHref(element.getAttribute('data')));
    });
    if (rewriteLinks) {
      root.querySelectorAll('a[href]').forEach(function (anchor) {
        const value = anchor.getAttribute('href');
        if (!value || /^(?:#|mailto:|tel:)/i.test(value)) return;
        const resolved = new URL(value, sourceUrl);
        anchor.href = resolved.origin === window.location.origin && resolved.pathname.endsWith('.html')
          ? new URL(prototypeLink(resolved), window.location.href).href : resolved.href;
      });
    }
    root.querySelectorAll('video').forEach(function (video) {
      const mediaSource = video.getAttribute('src') || video.querySelector('source[src]')?.getAttribute('src') || '';
      const posterName = mediaSource.match(/\/(rollator-conversion-\d+|social-edit-\d+)\.mp4(?:$|[?#])/i)?.[1];
      if (posterName && !video.hasAttribute('poster')) video.poster = new URL('../assets/' + posterName + '-poster.jpg', window.location.href).href;
      if (/rollator-conversion-\d+/.test(mediaSource)) {
        video.autoplay = false;
        video.removeAttribute('autoplay');
        video.dataset.heavyMedia = 'true';
        video.preload = 'none';
        video.pause();
      }
    });
  }

  const bootstrapFrame = document.createElement('iframe');
  bootstrapFrame.className = 'source-bootstrap-frame';
  bootstrapFrame.title = 'Preparando el contenido original';
  bootstrapFrame.src = sourceUrl.href;
  bootstrapFrame.setAttribute('aria-hidden', 'true');
  bootstrapFrame.tabIndex = -1;
  shell.appendChild(bootstrapFrame);
  shell.hidden = false;

  let sourcePrepared = false;
  let earlySourceCheck;
  let observedSourceDocument;
  let sourceDomReady = false;
  const sourceStartedAt = performance.now();
  const isCreativeIndex = /\/creatives-(?:es|en)\.html$/i.test(sourceUrl.pathname);
  function prepareSource() {
    if (sourcePrepared) return;
    const sourceDocument = bootstrapFrame.contentDocument;
    const sourceWindow = bootstrapFrame.contentWindow;
    if (!sourceDocument || !sourceWindow) { showError(isEnglish ? 'The source page could not be read.' : 'No se pudo leer la página de origen.'); return; }
    // Live documents keep their own DOM and scripts, so expose them as soon as
    // <main> exists. Async software badges can continue mounting in place.
    sourcePrepared = true;
    window.clearInterval(earlySourceCheck);

    window.setTimeout(function () {
      const sourceMain = sourceDocument.querySelector('main');
      if (!sourceMain) { showError(isEnglish ? 'The source page has no main content.' : 'La página de origen no contiene un bloque principal.'); return; }

      const sourceTitle = sourceDocument.querySelector('h1')?.textContent.trim() || sourceDocument.title.split('|')[0].trim() || 'Proyecto';
      document.title = sourceTitle + ' — Matías Gaglio';
      if (crumb) crumb.textContent = sourceTitle;

      // Keep canvas renderers and the interactive CV in their original document:
      // cloning HTML would discard canvas pixels and JavaScript event handlers.
      if (sourceMain.querySelector('canvas') || /\/(?:creatives|cv)-(?:es|en)\.html$/i.test(sourceUrl.pathname)) {
        const adapter = sourceDocument.createElement('link');
        adapter.rel = 'stylesheet';
        adapter.href = '/prototype-amazon/source-theme.css?v=20260903b';
        const frameStyle = sourceDocument.createElement('style');
        frameStyle.textContent = 'html,body{height:auto!important;min-height:0!important;margin:0!important;overflow-x:hidden!important}body>header,body>footer,body>.skip-link,.portfolio-rail{display:none!important}main{margin:0!important;min-width:0;overflow-wrap:anywhere}main [class*="hero"]{min-height:0!important;height:auto!important}main .container{max-width:100%;box-sizing:border-box}[data-aos]{opacity:1!important;transform:none!important;visibility:visible!important}.modeling-lab-stage{height:480px!important;min-height:0!important}.source-table-scroll{max-width:100%;overflow-x:auto}main h1{font-size:clamp(1.8rem,4vw,2.75rem)!important}@media(max-width:620px){.modeling-lab-stage{height:320px!important}}';
        sourceDocument.head.append(adapter, frameStyle);
        const syncTheme = function () { sourceDocument.documentElement.dataset.marketTheme = document.documentElement.dataset.theme || 'light'; };
        syncTheme();
        new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        const hasAsyncSoftwareStack = Boolean(sourceDocument.querySelector('script[src*="software-stack.js"]'));
        const softwareStackReady = sourceWindow.__softwareStackReady === true;
        // Keep original case links intact until the source script has used
        // them to mount its real badges. Media can still be normalized now.
        rewriteUrls(sourceMain, !hasAsyncSoftwareStack || softwareStackReady);
        sourceMain.querySelectorAll('table').forEach(function (table) {
          const scroller = sourceDocument.createElement('div');
          scroller.className = 'source-table-scroll';
          scroller.tabIndex = 0;
          scroller.setAttribute('role', 'region');
          scroller.setAttribute('aria-label', isEnglish ? 'Scrollable data table' : 'Tabla de datos desplazable');
          table.replaceWith(scroller);
          scroller.append(table);
        });
        sourceMain.querySelectorAll('a[href]').forEach(function (anchor) {
          if (!anchor.getAttribute('href').startsWith('#') && !anchor.target) anchor.target = '_top';
        });
        bootstrapFrame.className = 'source-live-frame';
        bootstrapFrame.title = sourceTitle;
        bootstrapFrame.removeAttribute('aria-hidden');
        bootstrapFrame.removeAttribute('tabindex');
        bootstrapFrame.dataset.sourceLive = '';
        function resizeFrame() {
          const height = Math.ceil(sourceMain.getBoundingClientRect().bottom + sourceWindow.scrollY) + 2;
          if (height > 0 && Math.abs(bootstrapFrame.offsetHeight - height) > 3) bootstrapFrame.style.height = height + 'px';
        }
        new ResizeObserver(resizeFrame).observe(sourceMain);
        let resizeQueued = false;
        new MutationObserver(function () {
          if (resizeQueued) return;
          resizeQueued = true;
          sourceWindow.requestAnimationFrame(function () {
            resizeQueued = false;
            resizeFrame();
            window.setTimeout(resizeFrame, 180);
          });
        }).observe(sourceMain, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
        adapter.addEventListener('load', resizeFrame);
        if (sourceDocument.readyState === 'loading') {
          sourceDocument.addEventListener('DOMContentLoaded', function () {
            rewriteUrls(sourceMain, !hasAsyncSoftwareStack || sourceWindow.__softwareStackReady === true);
            resizeFrame();
          }, { once: true });
        }
        if (hasAsyncSoftwareStack && !softwareStackReady) {
          const syncSoftwareStack = function () {
            rewriteUrls(sourceMain, true);
            resizeFrame();
          };
          sourceWindow.addEventListener('software-stack-ready', syncSoftwareStack, { once: true });
          if (sourceWindow.__softwareStackReady === true) {
            sourceWindow.removeEventListener('software-stack-ready', syncSoftwareStack);
            syncSoftwareStack();
          }
        }
        resizeFrame();
        status.remove();
        return;
      }

      const host = document.createElement('div');
      host.className = 'source-embed';
      host.setAttribute('data-source-embed', '');
      const shadow = host.attachShadow({ mode: 'open' });

      const baseStyle = document.createElement('style');
      baseStyle.textContent = ':host{display:block;min-width:0}html,body{min-height:0!important;margin:0!important;overflow:visible!important}body>header,body>footer,body>.skip-link,[data-global-nav],.portfolio-rail{display:none!important}main{margin-top:0!important}img,video{max-width:100%;transition:opacity .32s ease,transform .42s ease}[data-media-state="pending"]{opacity:.38;transform:scale(.994)}[data-media-state="ready"]{opacity:1;transform:none}[data-media-state="error"]{opacity:.22;outline:2px solid #b12704}[data-aos]{opacity:1!important;visibility:visible!important;transform:none!important}@media(prefers-reduced-motion:reduce){img,video{transition:none!important}}';
      shadow.appendChild(baseStyle);

      sourceDocument.head.querySelectorAll('link[rel="stylesheet"], style').forEach(function (sourceStyle) {
        if (sourceStyle.tagName === 'LINK') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = sourceStyle.href;
          shadow.appendChild(link);
        } else {
          shadow.appendChild(sourceStyle.cloneNode(true));
        }
      });

      const responsiveStyle = document.createElement('style');
      responsiveStyle.textContent = 'main{min-width:0;overflow-wrap:anywhere}main .container{width:100%;min-width:0;box-sizing:border-box}main section,main article,main div{min-width:0}.source-table-scroll{width:100%;max-width:100%;overflow-x:auto;overscroll-behavior-inline:contain}.source-table-scroll:focus-visible{outline:3px solid #f29d38;outline-offset:3px}pre{max-width:100%;overflow-x:auto}@media(max-width:620px){main .container{padding-inline:1rem!important}main h1{font-size:clamp(2.2rem,11vw,3.4rem)!important;line-height:1.03!important}}';
      shadow.appendChild(responsiveStyle);

      const themeStyle = document.createElement('link');
      themeStyle.rel = 'stylesheet';
      themeStyle.href = '/prototype-amazon/source-theme.css?v=20260903b';
      shadow.appendChild(themeStyle);

      const htmlRoot = document.createElement('html');
      htmlRoot.className = sourceDocument.documentElement.className;
      htmlRoot.lang = sourceDocument.documentElement.lang;
      const syncSourceTheme = function () { htmlRoot.dataset.marketTheme = document.documentElement.dataset.theme || 'light'; };
      syncSourceTheme();
      new MutationObserver(syncSourceTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      const bodyRoot = document.createElement('body');
      bodyRoot.className = sourceDocument.body.className;
      bodyRoot.id = sourceDocument.body.id;

      [sourceDocument.documentElement, sourceDocument.body].forEach(function (sourceElement, index) {
        const target = index === 0 ? htmlRoot : bodyRoot;
        const computed = sourceWindow.getComputedStyle(sourceElement);
        for (let propertyIndex = 0; propertyIndex < computed.length; propertyIndex += 1) {
          const property = computed[propertyIndex];
          if (property.startsWith('--')) target.style.setProperty(property, computed.getPropertyValue(property));
        }
      });

      const copiedMain = sourceMain.cloneNode(true);
      rewriteUrls(copiedMain);
      copiedMain.querySelectorAll('table').forEach(function (table) {
        const scroller = document.createElement('div');
        scroller.className = 'source-table-scroll';
        scroller.tabIndex = 0;
        scroller.setAttribute('role', 'region');
        scroller.setAttribute('aria-label', table.querySelector('caption')?.textContent.trim() || (isEnglish ? 'Scrollable data table' : 'Tabla de datos desplazable'));
        table.replaceWith(scroller);
        scroller.appendChild(table);
      });
      const sourceMedia = Array.from(copiedMain.querySelectorAll('img, video'));
      let priorityImageAssigned = false;
      sourceMedia.forEach(function (media) {
        media.dataset.mediaState = 'pending';
        if (media.tagName === 'IMG') {
          media.decoding = 'async';
          if (!priorityImageAssigned) {
            media.loading = 'eager';
            media.fetchPriority = 'high';
            priorityImageAssigned = true;
          } else {
            media.loading = 'lazy';
          }
          const ready = function () { media.dataset.mediaState = 'ready'; };
          const failed = function () { media.dataset.mediaState = 'error'; };
          media.addEventListener('load', ready, { once: true });
          media.addEventListener('error', failed, { once: true });
          if (media.complete) {
            if (media.naturalWidth) ready();
            else failed();
          }
        } else {
          media.preload = media.dataset.heavyMedia === 'true' ? 'none' : 'metadata';
          media.playsInline = true;
          media.addEventListener('loadeddata', function () { media.dataset.mediaState = 'ready'; }, { once: true });
          media.addEventListener('error', function () { media.dataset.mediaState = 'error'; }, { once: true });
          if (media.readyState >= 2 || media.hasAttribute('poster')) media.dataset.mediaState = 'ready';
        }
      });
      bodyRoot.appendChild(copiedMain);
      htmlRoot.appendChild(bodyRoot);
      shadow.appendChild(htmlRoot);

      shadow.addEventListener('click', function (event) {
        const anchor = event.target.closest('a[href]');
        if (!anchor || anchor.target === '_blank') return;
        const value = anchor.getAttribute('href');
        if (value?.startsWith('#')) {
          const target = shadow.getElementById(decodeURIComponent(value.slice(1)));
          if (!target) return;
          event.preventDefault();
          target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        }
      });

      bootstrapFrame.replaceWith(host);
      status.remove();
    }, 120);
  }
  bootstrapFrame.addEventListener('load', prepareSource);
  // Interactive documents must not wait for every video/model to finish loading
  // before exposing their text and controls. Their own scripts stay alive.
  earlySourceCheck = window.setInterval(function () {
    const doc = bootstrapFrame.contentDocument;
    const sourceWindow = bootstrapFrame.contentWindow;
    if (doc && doc !== observedSourceDocument) {
      observedSourceDocument = doc;
      doc.addEventListener('DOMContentLoaded', function () {
        sourceDomReady = true;
        prepareSource();
      }, { once: true });
    }
    const navigation = sourceWindow?.performance?.getEntriesByType('navigation')?.[0];
    if (doc?.readyState === 'complete' || navigation?.domContentLoadedEventEnd > 0) sourceDomReady = true;
    const main = doc?.querySelector('main');
    const hasSoftwareStack = Boolean(doc?.querySelector('script[src*="software-stack.js"]'));
    const keepsLiveDocument = Boolean(main?.querySelector('canvas')) || /\/(?:creatives|cv)-(?:es|en)\.html$/i.test(sourceUrl.pathname);
    const softwareReady = keepsLiveDocument || !hasSoftwareStack || sourceWindow?.__softwareStackReady === true || performance.now() - sourceStartedAt > 5000;
    const documentReady = sourceDomReady || (isCreativeIndex && sourceWindow?.__softwareStackReady === true && main?.querySelector('h1'));
    if (main && documentReady && softwareReady) prepareSource();
  }, 100);

  bootstrapFrame.addEventListener('error', function () { showError(isEnglish ? 'The file is unavailable in this copy.' : 'El archivo no está disponible en esta copia.'); });
})();
