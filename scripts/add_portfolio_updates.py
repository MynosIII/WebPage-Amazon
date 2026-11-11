"""Build the November 2026 bilingual editorial updates and merge discovery entries."""
import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
ARTICLES = [
    ('construccion-portfolio', 'assets/catalog-previews/construccion-portfolio.png', ['articles', 'other'], {
        'es': ('Construir este portfolio: del archivo de trabajos a un producto', 'Desarrollo web / Diseño / IA', 'Cómo organicé mi trabajo en un sitio bilingüe que conecta casos, herramientas y evidencia.', [
            ('El problema era encontrar un hilo', 'Mi trabajo reúne publicidad, análisis, contenido y desarrollo. Al construir esta página, el desafío fue darles una estructura que permita entender qué hice, por qué y con qué evidencia. El CV resume una trayectoria; acá puedo mostrar el proceso y dejar que cada persona explore lo que le interesa.'),
            ('Un catálogo como puerta de entrada', 'El sitio incorpora una interfaz inspirada en un marketplace: categorías, búsqueda y páginas de detalle. Esa decisión convierte cada proyecto en una entrada que se puede descubrir por su tema. Alguien interesado en Amazon puede recorrer casos comerciales; alguien interesado en desarrollo puede llegar a Predestinato o Telemetry One desde el mismo catálogo.'),
            ('Contenido separado de la presentación', 'Las páginas principales parten de archivos de contenido y plantillas compartidas. Python genera versiones estáticas; HTML, CSS y JavaScript resuelven la presentación y las interacciones. El catálogo se alimenta de un índice de búsqueda. Esta estructura permite actualizar información sin rehacer cada pantalla y conservar una versión navegable en español y otra en inglés.'),
            ('Trabajar con IA también exige revisar', 'Uso ChatGPT, Codex y Claude Code como parte del desarrollo: para explorar soluciones, escribir código, auditar el sitio y revisar cambios. Mi trabajo sigue siendo definir el problema, elegir qué vale la pena mostrar y evaluar el resultado. Una página puede compilar y aun así explicar mal un proyecto. Por eso reviso tanto el contenido como la navegación.'),
            ('Auditorías que terminan en cambios', 'Las auditorías con Claude Code encontraron problemas que no se veían a simple vista. El catálogo y el carrusel de herramientas dependían de JavaScript, así que un buscador o un bot de vista previa veía una lista vacía; ahora la compilación genera una versión estática y el sitemap pasó de 5 a 36 páginas. También se reemplazó una imagen para redes que mostraba el dominio anterior y se corrigió un selector CSS que agrandaba los logos de software. Cada cambio se publicó en Vercel y se verificó en producción.'),
            ('La calidad necesita comprobaciones concretas', 'El repositorio incluye validaciones de enlaces, traducciones, metadatos y etiquetas de software, además de pruebas de interfaz con Playwright y controles de accesibilidad. Son herramientas para detectar errores repetibles. Las capturas, la lectura en móvil y la revisión editorial completan ese trabajo: ayudan a comprobar si el sitio se entiende y si las pruebas de cada caso están a mano.'),
            ('Una página que cambia con mi trabajo', 'Predestinato, Telemetry One, Oxi y los proyectos de Revolution amplían lo que este portfolio puede contar. Mantenerlo implica volver sobre la selección, actualizar artículos y conectar trabajos que antes parecían separados. La construcción de esta página es, también, una muestra de cómo organizo información y convierto una idea en una experiencia utilizable.')]),
        'en': ('Building this portfolio: from a work archive to a product', 'Web development / Design / AI', 'How I organized my work into a bilingual website connecting projects, tools and evidence.', [
            ('Finding a common thread', 'My work spans advertising, analytics, content and development. Building this website meant finding a structure that explains what I did, why I did it and what supports each claim. A résumé summarizes a career; here I can show the process and let visitors explore their interests.'),
            ('A catalog as the entry point', 'The site uses a marketplace-inspired interface with categories, search and detail pages. Each project becomes something visitors can discover by topic. Amazon work, Predestinato and Telemetry One share a catalog while retaining their own context.'),
            ('Separating content from presentation', 'Core pages use shared templates and structured content files. Python generates static pages; HTML, CSS and JavaScript handle presentation and interaction. A search index feeds the catalog. This structure makes updates manageable and supports Spanish and English versions.'),
            ('Working with AI requires judgment', 'I use ChatGPT, Codex and Claude Code to explore solutions, write code, audit the site and review changes. I still define the problem, choose the evidence and assess the result. A page can build successfully while explaining a project poorly, so I review the writing as well as the navigation.'),
            ('Audits that end in changes', 'Audits with Claude Code surfaced problems that were not visible at a glance. The catalog and the software carousel depended on JavaScript, so a search engine or link-preview bot saw an empty list; the build now generates a static version and the sitemap grew from 5 to 36 pages. A social sharing image that still showed the old domain was replaced, and a CSS selector that blew up the software logos was fixed. Every change shipped on Vercel and was verified in production.'),
            ('Checking quality in concrete ways', 'The repository includes link, localization, metadata and software-tag validation, Playwright interface tests and accessibility checks. These help detect repeatable problems. Screenshots, mobile review and editorial reading help assess whether the experience makes sense and whether evidence is easy to find.'),
            ('A website that evolves with my work', 'Predestinato, Telemetry One, Oxi and Revolution projects keep expanding the story. Maintaining this portfolio means revisiting the selection, updating articles and connecting work across disciplines. Building the site is itself an example of how I organize information and turn an idea into a usable experience.')])}),
    ('oxi-contenido-y-analisis', 'assets/catalog-previews/oxi-contenido-y-analisis.png', ['articles', 'creative'], {
        'es': ('Oxi: construir una agencia entre contenido y análisis', 'Comunicación / Producción / Marketing', 'La construcción de Oxi: ideas, guiones, producción audiovisual y análisis de marketing dentro de un mismo proceso.', [
            ('Una idea compartida', 'Oxi es el proyecto de agencia de marketing y contenido que estoy construyendo con un equipo. Reúne producción audiovisual, comunicación y análisis para ayudar a empresas a explicar mejor lo que hacen. Mi aporte se concentra en marketing cuantitativo y PPC, conectado con el trabajo de guion y producción.'),
            ('Elegir qué queremos explicar', 'El contenido combina temas de medición, publicidad y realización audiovisual. Podemos partir del retorno marginal de una inversión, de las palabras clave negativas o de una decisión de iluminación. Cada tema necesita una pregunta concreta, un ejemplo y una conclusión que pueda usarse después de ver el video.'),
            ('De un concepto a un guion grabable', 'Explicar un modelo en un reel obliga a decidir qué conservar y qué dejar para una pieza más extensa. En el contenido sobre Meridian, por ejemplo, el foco está en distinguir el rendimiento promedio de lo que puede aportar la próxima inversión. El objetivo editorial es hacer comprensible esa decisión sin convertir una simplificación en una promesa de resultados.'),
            ('Organizar la producción', 'La grilla conecta temas, formatos y publicaciones con un plan de rodaje. Guion, vocería, cámara y asistencia tienen tareas distintas que deben llegar preparadas a la grabación. Los carruseles derivados permiten desarrollar fórmulas, ejemplos y gráficos que necesitan más tiempo de lectura que un reel.'),
            ('Una identidad que sostiene las piezas', 'Trabajamos con blanco y negro, acentos naranja y elementos pixelados. La identidad debe permitir reconocer a Oxi mientras cambia el tema o la persona que habla. El nombre se vincula con oxýs y con dos ideas que nos interesan: agudeza para encontrar una buena idea y velocidad para llevarla a la práctica.'),
            ('Herramientas de producción', 'Para sostener el ritmo de publicación conecté DaVinci Resolve a Claude mediante MCP. Con ese flujo armamos la animación del logo, reels verticales de 1080 × 1920, animaciones sobre el discurso con efectos de sonido generados por código y una guía de edición de 16 páginas que documenta color, cortes, subtítulos, sonido y exportación para todo el equipo.'),
            ('Qué estoy aprendiendo', 'Construir Oxi me obliga a conectar criterio analítico con decisiones de producción: qué explicar, cómo mostrarlo y cuánto trabajo requiere sostenerlo. Es un proyecto en desarrollo. Este artículo documenta el proceso y la propuesta editorial; todavía no presenta un caso de crecimiento o un resultado comercial atribuido a la agencia.')]),
        'en': ('Oxi: building an agency around content and analysis', 'Communication / Production / Marketing', 'Building Oxi through ideas, scripts, audiovisual production and marketing analysis.', [
            ('A shared idea', 'Oxi is the marketing and content agency I am building with a team. It brings together audiovisual production, communication and analysis to help businesses explain their work. My contribution focuses on quantitative marketing and PPC, connected to scripting and production.'),
            ('Choosing what to explain', 'Our topics span measurement, advertising and filmmaking: marginal returns, negative keywords or lighting decisions. Each piece needs a specific question, an example and a conclusion the audience can use afterward.'),
            ('Turning a concept into a script', 'Explaining a model in a reel means choosing what to keep and what needs a longer format. Our Meridian content focuses on the difference between average performance and the potential return from the next investment. The editorial goal is to explain that decision without turning a simplification into a performance promise.'),
            ('Organizing production', 'The content grid connects topics, formats and publication plans to a shooting schedule. Scripting, presenting, camera work and production assistance require different preparation. Companion carousels provide space for formulas, examples and charts that need more reading time.'),
            ('An identity across formats', 'We work with black and white, orange accents and pixel elements. The identity should remain recognizable as topics and presenters change. The name connects to oxýs and to two ideas: sharp thinking and the speed to put an idea into practice.'),
            ('Production tooling', 'To keep up the publishing pace, I connected DaVinci Resolve to Claude through MCP. With that workflow we built the logo animation, 1080 × 1920 vertical reels, animations over the presenter with code-generated sound effects and a 16-page editing guide that documents color, cutting, captions, sound and export for the whole team.'),
            ('What I am learning', 'Building Oxi connects analytical judgment to production decisions: what to explain, how to show it and how much work consistent production takes. The project is still developing. This article documents the process and editorial direction; it does not claim agency growth or attributed commercial results.')])}),
    ('revolution-operacion-amazon', 'assets/fitment-compatibility-photo.jpg', ['articles', 'ecommerce'], {
        'es': ('Revolution: conectar catálogo, publicidad y contenido en Amazon', 'Amazon / Operaciones / Estrategia', 'Cómo se relacionan PPC, compatibilidad automotriz, contenido A+ y coordinación del canal en mi trabajo en Revolution Supply.', [
            ('Mirar el canal completo', 'Desde junio de 2025 trabajo en Revolution Supply, en el canal Amazon de una empresa de productos automotrices. Mi trabajo conecta catálogo, publicidad, contenido y análisis comercial. Una decisión sobre inversión necesita contexto: qué producto se anuncia, si el cliente entiende su compatibilidad y si la oferta puede sostener la demanda.'),
            ('La compatibilidad organiza la información', 'En tuercas, bulones y separadores de rueda, una descripción atractiva necesita precisión técnica. Patrón de pernos, rosca, diámetro de centro, espesor y vehículos compatibles afectan la compra. Trabajo sobre títulos, bullets y estructura del catálogo para que esa información sea consistente, y sobre la validación de compatibilidad en Amazon.'),
            ('PPC con una pregunta de negocio', 'La estructura de campañas distingue búsquedas, tipos de concordancia y segmentación por producto. Al analizar rendimiento, relaciono ROAS y ACoS con ventas totales, TACoS, conversión y rentabilidad. Esas lecturas ayudan a priorizar productos y revisar presupuestos; un cambio aislado de una métrica necesita contexto antes de convertirse en una conclusión.'),
            ('Contenido que responde dudas de compra', 'En los proyectos de A+ y galerías, busco asignar una función a cada pieza: explicar especificaciones, mostrar construcción, resolver compatibilidad o presentar una comparación. El trabajo reciente incluye comunicar la construcción de una pieza y dar más presencia a la prueba de niebla salina de 72 horas. Una prueba debe presentarse con su alcance, sin convertirla en una garantía ilimitada.'),
            ('Coordinar también es parte del resultado', 'Catálogo, operaciones y publicidad tienen dependencias. La revisión de listings, los cambios de títulos y el desarrollo creativo necesitan prioridades y seguimiento compartidos. Mi trabajo incluye organizar al equipo, definir objetivos y revisar avances para que el diagnóstico termine en acciones concretas.'),
            ('Del trabajo cotidiano a los casos', 'Este artículo reúne el enfoque general de mi trabajo. Los casos específicos del portfolio desarrollan por separado publicidad, contenido y análisis con su propia evidencia. Mantener ese contexto permite explicar mi aporte sin mezclar períodos, atribuir toda una variación a una sola acción o divulgar cifras operativas internas.')]),
        'en': ('Revolution: connecting Amazon catalog, advertising and content', 'Amazon / Operations / Strategy', 'How PPC, automotive fitment, A+ content and channel coordination connect in my work at Revolution Supply.', [
            ('Looking at the whole channel', 'Since June 2025, I have worked on Revolution Supply’s Amazon channel in automotive products. My work connects catalog management, advertising, content and commercial analysis. Investment decisions need context: the advertised product, whether buyers understand fitment and whether the offer can support demand.'),
            ('Fitment shapes the information', 'Lug nuts, bolts and wheel spacers require precise technical descriptions. Bolt pattern, thread, center bore, thickness and vehicle compatibility affect the purchase. I work on titles, bullets and catalog structure to make that information consistent, alongside Amazon fitment validation.'),
            ('PPC starts with a business question', 'Campaign structure distinguishes queries, match types and product targeting. I read ROAS and ACoS alongside total sales, TACoS, conversion and profitability. These views support product prioritization and budget reviews; a single metric change needs context before it becomes a conclusion.'),
            ('Content answers purchase questions', 'For A+ and galleries, I assign each asset a purpose: specifications, construction, fitment or comparison. Recent work includes explaining one-piece construction and giving the 72-hour salt spray test more visibility. Test evidence needs its scope preserved rather than being presented as an unlimited guarantee.'),
            ('Coordination is part of the work', 'Catalog, operations and advertising depend on one another. Listing reviews, title changes and creative development need shared priorities and follow-up. My responsibilities include organizing the team, setting objectives and reviewing progress so that analysis leads to concrete action.'),
            ('Connecting daily work to case studies', 'This article describes my overall approach. Individual portfolio cases cover advertising, content and analytics with their own evidence. Preserving that context helps explain my contribution without combining reporting periods, attributing every change to one action or disclosing internal operating figures.')])})
]

KEYWORDS = {
    'construccion-portfolio': {
        'es': ['portfolio', 'desarrollo web', 'sitio bilingüe', 'HTML', 'CSS', 'JavaScript', 'Python', 'Vercel', 'GitHub', 'Playwright', 'Claude', 'Claude Code', 'ChatGPT', 'Codex', 'IA aplicada', 'SEO técnico', 'accesibilidad', 'catálogo', 'diseño UX'],
        'en': ['portfolio', 'web development', 'bilingual website', 'HTML', 'CSS', 'JavaScript', 'Python', 'Vercel', 'GitHub', 'Playwright', 'Claude', 'Claude Code', 'ChatGPT', 'Codex', 'applied AI', 'technical SEO', 'accessibility', 'catalog', 'UX design'],
    },
    'oxi-contenido-y-analisis': {
        'es': ['Oxi', 'agencia de marketing', 'contenido', 'producción audiovisual', 'reels', 'guion', 'marketing cuantitativo', 'PPC', 'Meridian', 'marketing mix modeling', 'DaVinci Resolve', 'Claude', 'MCP', 'identidad de marca', 'edición de video'],
        'en': ['Oxi', 'marketing agency', 'content', 'video production', 'reels', 'scriptwriting', 'quantitative marketing', 'PPC', 'Meridian', 'marketing mix modeling', 'DaVinci Resolve', 'Claude', 'MCP', 'brand identity', 'video editing'],
    },
}

RELATED = {
    'construccion-portfolio': [('trabajo-con-claude', {'es': 'Trabajar con un agente de IA', 'en': 'Working with an AI agent'}), ('telemetry-one-ecosistema', 'Telemetry One'), ('predestinato-simulador-carrera', 'Predestinato')],
    'oxi-contenido-y-analisis': [('postproduccion-video-davinci-resolve-ia', {'es': 'Postproducción de video con IA', 'en': 'AI-assisted video post-production'}), ('limpieza-audio-entrevista-ia', {'es': 'Limpiar audio con IA', 'en': 'Cleaning audio with AI'}), ('amazon-content-architecture', 'Amazon Content Architecture')],
}
DEFAULT_RELATED = [('predestinato-simulador-carrera', 'Predestinato'), ('telemetry-one-ecosistema', 'Telemetry One'), ('amazon-content-architecture', 'Amazon Content Architecture')]


def main():
    catalog_path = ROOT / 'prototype-amazon/catalog-data.json'
    catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    tool_catalog = json.loads((ROOT / 'content/case-tools.json').read_text(encoding='utf-8'))
    for slug, cover, categories, translations in ARTICLES:
        for lang, (title, label, description, sections) in translations.items():
            other = 'en' if lang == 'es' else 'es'
            source = (ROOT / f'predestinato-simulador-carrera-{lang}.html').read_text(encoding='utf-8')
            head = source.split('<body')[0]
            head = re.sub(r'<title>.*?</title>', f'<title>{escape(title)} | Matías Gaglio</title>', head)
            keywords = KEYWORDS.get(slug, {}).get(lang)
            for key, value in [('description', description), ('keywords', ', '.join(keywords) if keywords else label), ('og:title', title), ('og:description', description), ('og:image', 'https://matiasgaglio.vercel.app/' + cover)]:
                head = re.sub(r'(<meta (?:name|property)="' + re.escape(key) + r'" content=")[^"]*', lambda m: m[1] + escape(value, quote=True), head)
            head = head.replace('predestinato-simulador-carrera-', slug + '-')
            stack = tool_catalog['cases'].get(slug + '.html', [])
            tool_names = [tool_catalog['tools'][tool]['name'] for tool in stack]
            if keywords:
                from add_claude_articles import json_ld
                head = head.replace('</head>', '  ' + json_ld(lang, f'{slug}-{lang}.html', {'title': title, 'deck': description, 'keywords': keywords}, cover, tool_names).replace('"datePublished": "2026-11-11"', '"datePublished": "2026-11-08"') + '\n</head>')
            nav = source[source.index('<header class="global-nav"'):source.index('<main')].replace('predestinato-simulador-carrera-', slug + '-')
            body = f'<main class="project-article"><article><header class="pa-hero"><div class="container"><span class="pa-kicker">{escape(label)}</span><h1>{escape(title)}</h1><p class="pa-deck">{escape(description)}</p><p>Matías Gaglio · <time datetime="2026-11-08">08/11/2026</time></p><a href="{slug}-{other}.html" hreflang="{other}">{"Read in English" if lang == "es" else "Leer en español"}</a></div></header>'
            for heading, paragraph in sections:
                body += f'<section class="pa-section"><div class="container"><h2>{escape(heading)}</h2><p>{escape(paragraph)}</p></div></section>'
            body += f'<section class="pa-section"><div class="container"><h2>{"Seguir explorando" if lang == "es" else "Keep exploring"}</h2><ul class="pa-source-list">'
            links = RELATED.get(slug, DEFAULT_RELATED) + [('Articles', 'Artículos' if lang == 'es' else 'Articles')]
            for target, text in links:
                text = text[lang] if isinstance(text, dict) else text
                body += f'<li><a href="{target}-{lang}.html">{text}</a></li>'
            body += '</ul></div></section>'
            if keywords:
                from add_claude_articles import tags_section
                body += tags_section(lang, tool_names, keywords)
            body += '</article></main>'
            footer = source[source.index('<footer'):]
            if not stack:
                footer = re.sub(r'<script src="software-stack\.js[^" ]*" defer></script>', '', footer)
            url = f'{slug}-{lang}.html'
            (ROOT / url).write_text(head + '<body class="project-article-page">' + nav + body + footer, encoding='utf-8')
            catalog = [entry for entry in catalog if entry['url'] != url]
            tool_logos = [dict(key=tool, **tool_catalog['tools'][tool]) for tool in stack]
            catalog.append(dict(title=title, description=description, keywords=', '.join(keywords) if keywords else label, lang=lang, url=url, staticArticle=True, categories=categories, image=cover, mediaFit='cover', toolLogos=tool_logos))
            for listing in [f'Articles-{lang}.html'] + (['Articles.html'] if lang == 'en' else []):
                path = ROOT / listing
                text = path.read_text(encoding='utf-8')
                if f'href="{url}"' not in text:
                    card = f'<a class="article-card" href="{url}"><div class="article-card-body"><span class="article-meta">{escape(label)}</span><h3>{escape(title)}</h3><p>{escape(description)}</p></div></a>'
                    text = text.replace('<div class="articles-grid">', '<div class="articles-grid">\n' + card, 1)
                    path.write_text(text, encoding='utf-8')
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

if __name__ == '__main__':
    main()
