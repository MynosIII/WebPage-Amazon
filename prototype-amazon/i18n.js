(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const source = params.get('source') || '';
  const isEnglish = params.get('lang') === 'en' || /\/index-en\.html$/i.test(window.location.pathname) || /(?:^|\/)(?:index|[^/]+)-en\.html$/i.test(source);
  const language = isEnglish ? 'en' : 'es';
  document.documentElement.lang = language;
  window.portfolioLanguage = language;

  const english = {
    'Todo': 'All',
    'Saltar al contenido': 'Skip to main content',
    'Abrir navegación': 'Open navigation',
    'Sobre mí': 'About',
    'Contacto': 'Contact',
    'Buscar en el portfolio': 'Search portfolio',
    'Buscar en el catálogo': 'Search the catalog',
    'Filtrar por área': 'Filter by area',
    'Todo el portfolio': 'All work',
    'Explorar todo': 'Explore all',
    'Explorar el portfolio': 'Explore portfolio',
    'Automatización & código': 'Automation & code',
    'Creatividad': 'Creative',
    'Creatividad y medios': 'Creative and media',
    'Sistemas y artículos': 'Systems and articles',
    'Investigación': 'Research',
    'Investigación y análisis': 'Research and analysis',
    'Otros proyectos': 'Other projects',
    '← Inicio': '← Home',
    '← Catálogo': '← Catalog',
    '← Todos los casos': '← All cases',
    'Portfolio independiente. No afiliado a Amazon.': 'Independent portfolio. Not affiliated with Amazon.',
    'Volver arriba ↑': 'Back to top ↑',
    'Ecommerce & Amazon Growth Strategist': 'Ecommerce & Amazon Growth Strategist',
    'Conecto señales comerciales con decisiones que se pueden ejecutar.': 'Data, media and content focused on profitability.',
    'Combino Business Intelligence, PPC y contenido visual para ayudar a marcas de ecommerce a mejorar su conversión y rentabilidad. Analizo el rendimiento, detecto oportunidades y convierto los datos en decisiones comerciales concretas.': 'I combine Business Intelligence, PPC and visual content to help ecommerce brands improve conversion and profitability. I analyze performance, identify opportunities and turn data into executable commercial decisions.',
    'Explorar mi trabajo': 'Explore my work',
    'Hablemos': 'Contact me',
    'Foco': 'Focus',
    'Método': 'Method',
    'Diagnosticar · priorizar · implementar · medir': 'Diagnose · prioritize · implement · measure',
    'Explorar trabajo': 'Explore work',
    'Por problema': 'By problem',
    'Conversión': 'Conversion',
    'Rentabilidad': 'Profitability',
    'Calidad de tráfico': 'Traffic quality',
    'Contenido de producto': 'Product content',
    'Trabajo repetitivo': 'Repetitive work',
    'Por herramienta': 'By tool',
    'Limpiar búsqueda': 'Clear search',
    'Resultados seleccionados': 'Selected results',
    'Casos donde la evidencia cambió la acción': 'Cases where evidence changed the action',
    '3 casos destacados': '3 featured cases',
    'Caso 01 · Amazon Growth & PPC': 'Case 01 · Amazon Growth & PPC',
    'Reestructurar pauta y listing para recuperar crecimiento': 'Restructuring media and listings to recover growth',
    'La cuenta necesitaba conectar campañas, contenido y conversión para evitar optimizaciones aisladas.': 'The account needed to connect campaigns, content and conversion instead of optimizing each in isolation.',
    'Problema:': 'Problem:',
    'Audité la arquitectura de campañas y listings, reorganicé la segmentación y coordiné cambios de contenido y pauta.': 'I audited campaign and listing architecture, reorganized targeting, and coordinated content and media changes.',
    'Intervención:': 'Intervention:',
    'Ventas retail': 'Retail sales',
    'ROAS observado': 'Observed ROAS',
    'Caso 02 · Business Intelligence': 'Case 02 · Business Intelligence',
    'Convertir ventas, pauta y margen en prioridades de portafolio': 'Turning sales, media and margin into portfolio priorities',
    'El crecimiento mensual no explicaba qué productos aportaban rentabilidad ni dónde la inversión ocultaba el problema.': 'Monthly growth did not explain which products created profit or where spend was masking the problem.',
    'Construí una lectura mensual del portafolio y prioricé acciones según el cuello de botella de cada producto.': "I built a monthly portfolio view and prioritized actions by each product's bottleneck.",
    'Ventas': 'Sales',
    'Beneficio estimado': 'Estimated net profit',
    'Período': 'Period',
    'Julio–27 octubre 2025': 'July–October 27, 2025',
    'Caso 03 · Data-to-Creative': 'Case 03 · Data-to-Creative',
    'Transformar datos técnicos en una galería que ayuda a decidir': 'Turning technical data into a gallery that supports decisions',
    'La galería anterior mostraba el producto, pero no jerarquizaba compatibilidad, especificaciones ni beneficios.': 'The previous gallery showed the product but did not prioritize compatibility, specifications or benefits.',
    'Definí la secuencia de mensajes y convertí la información técnica en seis piezas visuales modulares.': 'I defined the message sequence and translated technical information into six modular visual assets.',
    'Antes': 'Before',
    '6 imágenes de producto': '6 product images',
    'Después': 'After',
    '6 imágenes rediseñadas': '6 redesigned images',
    'Atribución': 'Attribution',
    'Sin claim causal': 'No causal claim',
    'No encontré casos con esa combinación.': 'No cases match that combination.',
    'Probá con “Amazon Ads”, “conversión”, “contenido” o limpiá la búsqueda.': 'Try “Amazon Ads”, “conversion” or “content”, or clear the search.',
    'Mostrar todos los casos': 'Show all cases',
    'Resultados documentados': 'Documented outcomes',
    'ventas retail · Amazon · 17 ago–11 oct': 'retail sales · Amazon · Aug 17–Oct 11',
    'conversión · Amazon · 10 ago–4 oct': 'conversion · Amazon · Aug 10–Oct 4',
    'ventas · portafolio · jul–27 oct': 'sales · portfolio · Jul–Oct 27',
    'ingresos semanales · Amazon · 14–27 jun': 'weekly revenue · Amazon · Jun 14–27',
    'Perfil del operador': 'Operator profile',
    'Marketing para formular el problema. Datos para decidir. Tecnología para ejecutar.': 'Marketing to frame the problem. Data to decide. Technology to execute.',
    'Mi formación en Comunicación me enseñó cómo las personas interpretan mensajes. Ecommerce agregó tráfico, conversión, margen y búsqueda. La programación me permite transformar análisis repetitivos en herramientas y sistemas de trabajo.': 'My Communication background taught me how people interpret messages. Ecommerce added traffic, conversion, margin and search. Programming lets me turn repetitive analysis into tools and working systems.',
    'Historia profesional': 'Professional story',
    'CV interactivo': 'Interactive resume',
    'Siguiente acción': 'Next step',
    '¿Dónde se está perdiendo conversión, presupuesto o margen?': 'Where is conversion, budget or margin being lost?',
    'Puedo ayudarte a ordenar el diagnóstico antes de elegir una táctica.': 'I can help structure the diagnosis before choosing a tactic.',
    'Abrir centro de contacto': 'Open contact center',
    'Tu cuenta profesional': 'Your professional account',
    'Perfil / Cuenta profesional': 'Profile / Professional account',
    'Comunicación para entender. Datos para decidir.': 'Communication to understand. Data to decide.',
    'Soy Matías Gaglio, Ecommerce & Amazon Growth Strategist. Conecto comportamiento del cliente, datos comerciales y ejecución para resolver problemas de conversión y rentabilidad.': 'I am Matías Gaglio, an Ecommerce & Amazon Growth Strategist. I connect customer behavior, commercial data and execution to solve conversion and profitability problems.',
    'Enfoque de trabajo': 'Working approach',
    'El problema rara vez pertenece a una sola disciplina.': 'The problem rarely belongs to one discipline.',
    'Una caída de conversión puede empezar en el tráfico, la oferta, la compatibilidad, el inventario o la jerarquía visual. Mi trabajo consiste en localizar la restricción real antes de recomendar una solución.': 'A conversion drop may begin in traffic, offer, compatibility, inventory or visual hierarchy. My job is to locate the real constraint before recommending a solution.',
    'Amazon Growth · Business Intelligence · Data-to-Creative': 'Amazon Growth · Business Intelligence · Data-to-Creative',
    'Tu cuenta': 'Your account',
    'Información profesional': 'Professional information',
    'Rol y foco actual': 'Current role and focus',
    'Ecommerce, Amazon PPC, BI y contenido.': 'Ecommerce, Amazon PPC, BI and content.',
    'Historial profesional': 'Professional history',
    'De Comunicación a ecommerce, análisis y sistemas.': 'From Communication to ecommerce, analysis and systems.',
    'Ver recorrido ›': 'View path ›',
    'Servicios e integraciones': 'Services and integrations',
    'Herramientas comerciales, técnicas y creativas.': 'Commercial, technical and creative tools.',
    'Ver capacidades ›': 'View capabilities ›',
    'Experiencia y educación': 'Experience and education',
    'Ciencias de la Comunicación, UBA · Agente de Propaganda Médica, Universidad Favaloro.': 'Communication Sciences, UBA · Pharmaceutical Sales Representative, Favaloro University.',
    'Abrir CV ›': 'Open resume ›',
    'Centro de contacto': 'Contact center',
    'Contame el problema antes de elegir una táctica.': 'Tell me the problem before choosing a tactic.',
    'Escribir a Matías ›': 'Write to Matías ›',
    'Actividad de la cuenta': 'Account activity',
    'Cómo se construyó este enfoque': 'How this approach was built',
    'Comunicación': 'Communication',
    'Origen': 'Origin',
    'Mi formación en Ciencias de la Comunicación en la UBA me enseñó a entender cómo las personas interpretan mensajes, construyen confianza y toman decisiones. Esa base todavía guía mi manera de investigar una audiencia y ordenar información compleja.': 'My Communication Sciences background at the University of Buenos Aires taught me how people interpret messages, build trust and make decisions. That foundation still guides how I research an audience and structure complex information.',
    'Ecommerce': 'Ecommerce',
    'Evolución': 'Evolution',
    'El trabajo en ecommerce agregó una segunda capa: medir ese comportamiento mediante tráfico, búsquedas, CTR, conversión, inversión y margen. Pasé de estudiar mensajes a operar sistemas donde cada decisión puede contrastarse con datos comerciales.': 'Ecommerce added a second layer: measuring that behavior through traffic, search, CTR, conversion, investment and margin. I moved from studying messages to operating systems where each decision can be tested against commercial data.',
    'Datos y ejecución': 'Data and execution',
    'Ventaja actual': 'Current advantage',
    'Hoy combino ambas perspectivas. Puedo detectar un problema en los números, traducirlo en una decisión de campañas, catálogo o contenido, y explicarlo de forma que un equipo pueda ejecutarlo y medirlo.': 'Today I combine both perspectives. I can detect a problem in the numbers, translate it into a campaign, catalog or content decision, and explain it so a team can execute and measure it.',
    'Origen · Comunicación': 'Origin · Communication',
    'Aprender a leer cómo las personas construyen sentido.': 'Learning how people construct meaning.',
    'Mi formación en Ciencias de la Comunicación en la UBA me dio una base para investigar, formular problemas y entender cómo audiencias distintas interpretan mensajes.': 'My Communication Sciences background at the University of Buenos Aires gave me a foundation for research, framing problems and understanding how different audiences interpret messages.',
    'Evolución · Ecommerce': 'Evolution · Ecommerce',
    'Agregar comportamiento observable y economía a la lectura.': 'Adding observable behavior and economics to the analysis.',
    'Ecommerce sumó tráfico, búsquedas, CTR, conversión, inversión y margen. El mensaje dejó de ser solamente una pieza: pasó a formar parte de un sistema comercial medible.': 'Ecommerce added traffic, search, CTR, conversion, investment and margin. The message stopped being an isolated asset and became part of a measurable commercial system.',
    'Ventaja actual · Tecnología': 'Current advantage · Technology',
    'Conectar detección, decisión e implementación.': 'Connecting detection, decision and implementation.',
    'Hoy combino la detección de una señal con decisiones sobre campañas, catálogo y contenido; después uso datos, automatización y comunicación visual para implementar y explicar el cambio.': 'Today I connect the detection of a signal with decisions about campaigns, catalog and content; then I use data, automation and visual communication to implement and explain the change.',
    '“El problema rara vez pertenece a una sola disciplina.”': '“The problem rarely belongs to one discipline.”',
    'Herramientas dentro del sistema': 'Tools within the system',
    'Análisis': 'Analysis',
    'Power BI · tableros operativos': 'Power BI · operational dashboards',
    'Adquisición': 'Acquisition',
    'Producción': 'Production',
    'Diseño visual · 3D · automatización': 'Visual design · 3D · automation',
    '¿Hay una señal comercial que todavía no se convierte en una decisión?': 'Is there a commercial signal that has not yet become a decision?',
    'Podemos ordenar el diagnóstico, la evidencia y la ejecución.': 'We can structure the diagnosis, evidence and execution.',
    'Perfil profesional': 'Professional profile',
    'Próximo paso': 'Next step',
    '¿Buscás mejorar la rentabilidad de un portafolio ecommerce?': "Looking to improve an ecommerce portfolio's profitability?",
    'Puedo ayudarte a detectar dónde se pierde conversión, presupuesto o margen. Hablemos sobre tu proyecto.': "I can help identify where conversion, budget or margin is being lost. Let's discuss your project.",
    'Áreas de trabajo': 'Areas of work',
    'Elegí el tema de tu mensaje': 'Choose the subject of your message',
    'Diagnóstico de catálogo y campañas, asignación presupuestaria y optimización orientada a margen.': 'Catalog and campaign diagnosis, budget allocation and margin-oriented optimization.',
    'Lecturas de ventas, pauta y rentabilidad que muestran qué escalar, defender o corregir.': 'Sales, media and profitability views that show what to scale, defend or correct.',
    'VOC y rendimiento convertidos en galerías, listings y sistemas visuales que reducen la incertidumbre de compra.': 'VOC and performance translated into galleries, listings and visual systems that reduce purchase uncertainty.',
    'Hablemos ›': 'Contact me ›',
    'Hablemos sobre tu proyecto.': "Let's discuss your project.",
    'Puedo ayudarte a detectar dónde se pierde conversión, presupuesto o margen.': 'I can help identify where conversion, budget or margin is being lost.',
    'Catálogo': 'Catalog',
    'Todo el catálogo': 'All work',
    'Marketplace / Inventario de trabajo': 'Marketplace / Work inventory',
    'Casos, sistemas de trabajo, investigación y piezas creativas dentro de una sola arquitectura.': 'Cases, working systems, research and creative work within one architecture.',
    'Ordenar por': 'Sort by',
    'Relevancia': 'Relevance',
    'Título A–Z': 'Title A–Z',
    'Refinar resultados': 'Refine results',
    'Tipo de trabajo': 'Type of work',
    'Ecommerce y casos': 'Ecommerce and cases',
    'Principio': 'Principle',
    'El contenido visible proviene del catálogo existente. No se inventan proyectos ni evidencia.': 'Visible content comes from the existing catalog. No projects or evidence are invented.',
    'Resultados': 'Results',
    'Cargando catálogo…': 'Loading catalog…',
    'No encontré resultados.': 'No results found.',
    'Probá otra búsqueda o volvé a todo el catálogo.': 'Try another search or return to all work.',
    'Mostrar todo': 'Show all',
    'Proyecto': 'Project',
    'Cargando el contenido seleccionado…': 'Loading selected content…',
    'Caso': 'Case',
    'Cargando el contenido original completo…': 'Loading the complete original content…'
    ,'Ruta no disponible': 'Route unavailable'
    ,'No encontramos esta página.': 'We could not find this page.'
    ,'El enlace puede haber cambiado. Volvé al inicio o buscá el proyecto dentro del catálogo.': 'The link may have changed. Return home or find the project in the catalog.'
    ,'Volver al inicio': 'Return home'
    ,'Explorar el catálogo': 'Explore the catalog'
    ,'Rutas disponibles': 'Available routes'
    ,'Seguí explorando': 'Keep exploring'
    ,'Abrir ›': 'Open ›'
  };

  const attributeEnglish = {
    'Perfiles profesionales': 'Professional profiles',
    'Matías Gaglio, inicio del portfolio': 'Matías Gaglio, portfolio home',
    'Utilidades': 'Utilities',
    'Migas de pan': 'Breadcrumb',
    'Categorías del catálogo': 'Catalog categories',
    'Buscar': 'Search',
    'Buscar casos, problemas, herramientas o disciplinas': 'Search cases, problems, tools or disciplines',
    'Buscar casos, capacidades o herramientas': 'Search cases, capabilities or tools',
    'Buscar un caso, herramienta o capacidad': 'Search a case, tool or capability',
    'Buscar casos, proyectos, herramientas o problemas': 'Search cases, projects, tools or problems',
    'Buscar otro caso, herramienta o disciplina': 'Search another case, tool or discipline'
  };

  function translateText(root) {
    root.querySelectorAll('*').forEach(function (element) {
      Array.from(element.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) return;
        const trimmed = node.nodeValue.replace(/\s+/g, ' ').trim();
        if (!trimmed || !english[trimmed]) return;
        node.nodeValue = node.nodeValue.replace(trimmed, english[trimmed]);
      });
      ['aria-label', 'placeholder', 'title'].forEach(function (attribute) {
        const value = element.getAttribute(attribute);
        if (value && attributeEnglish[value]) element.setAttribute(attribute, attributeEnglish[value]);
      });
      if (element.hasAttribute('data-query')) {
        const query = element.getAttribute('data-query');
        const queryMap = { 'conversión': 'conversion', 'rentabilidad': 'profitability', 'tráfico': 'traffic', 'contenido': 'content', 'automatización': 'automation' };
        if (queryMap[query]) element.setAttribute('data-query', queryMap[query]);
      }
    });
  }

  function withLanguage(href, targetLanguage) {
    if (!href || /^(?:#|mailto:|tel:|https?:\/\/)/i.test(href)) return href;
    const url = new URL(href, window.location.href);
    const sourceValue = url.searchParams.get('source');
    if (sourceValue) {
      url.searchParams.set('source', sourceValue.replace(/-(?:es|en)(\.html)$/i, '-' + targetLanguage + '$1'));
    }
    if (targetLanguage === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    return (href.startsWith('/') ? url.pathname : url.pathname.split('/').pop()) + url.search + url.hash;
  }

  function syncLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      if (link.classList.contains('locale')) return;
      const href = link.getAttribute('href');
      link.setAttribute('href', withLanguage(href, language));
    });
    document.querySelectorAll('form[action]').forEach(function (form) {
      if (language !== 'en') return;
      if (!form.querySelector('input[name="lang"]')) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'lang';
        hidden.value = 'en';
        form.appendChild(hidden);
      }
    });
  }

  function syncLocaleLink() {
    const locale = document.querySelector('.locale');
    if (!locale) return;
    const current = window.location.pathname.split('/').pop() || 'index.html';
    const targetLanguage = language === 'en' ? 'es' : 'en';
    let href = current + window.location.search + window.location.hash;
    href = withLanguage(href, targetLanguage);
    locale.textContent = targetLanguage.toUpperCase();
    locale.lang = targetLanguage;
    locale.hreflang = targetLanguage;
    locale.href = href;
    locale.setAttribute('aria-label', targetLanguage === 'en' ? 'View in English' : 'Ver en español');
  }

  if (language === 'en') {
    translateText(document.body);
    const titles = {
      'account-page': 'Your professional account — Matías Gaglio',
      'help-page': 'Contact center — Matías Gaglio',
      'catalog-page': 'Work catalog — Matías Gaglio',
      'source-page': 'Project — Matías Gaglio',
      'not-found-page': 'Page not found — Matías Gaglio'
    };
    document.title = titles[document.body.className] || 'Matías Gaglio — Ecommerce & Amazon Growth Strategist';
  }
  syncLinks();
  syncLocaleLink();
})();
