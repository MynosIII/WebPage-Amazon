"""Bilingual content for the November 2026 articles about work built with Claude.

Each article is a list of blocks rendered by ``scripts/add_claude_articles.py``.
Block types: ("p", text), ("facts", [(value, label)]), ("cards", [(eyebrow, title, text)]),
("flow", [(title, text)]), ("list", [(lead, text)]), ("callout", lead, text),
("table", caption, headers, rows), ("sources", [(href, title, note)]).
"""

PUBLISHED = '2026-11-11'

ARTICLES = [
    {
        'slug': 'trabajo-con-claude',
        'cover': 'assets/catalog-previews/trabajo-con-claude.png',
        'categories': ['articles', 'other'],
        'tools': ['claude', 'github', 'vercel', 'nextjs', 'typescript', 'javascript', 'python', 'google-drive', 'canva', 'davinci-resolve', 'audacity'],
        'es': {
            'title': 'Trabajar con un agente de IA: Claude como parte del equipo',
            'kicker': 'IA aplicada · Flujo de trabajo · Desarrollo',
            'deck': 'Cómo uso Claude Code conectado a GitHub, Vercel, Google Drive y aplicaciones de escritorio para construir, auditar y publicar proyectos reales, y qué reglas mantengo para que el resultado sea confiable.',
            'keywords': ['Claude', 'Claude Code', 'Anthropic', 'agente de IA', 'IA aplicada', 'MCP', 'Model Context Protocol', 'GitHub', 'pull requests', 'Vercel', 'Next.js', 'TypeScript', 'Python', 'Google Drive', 'Canva', 'Playwright', 'auditoría web', 'SEO técnico', 'automatización', 'flujo de trabajo', 'productividad'],
            'sections': [
                ('Contexto', 'Un colaborador que trabaja con mis herramientas, no al lado de ellas.', [
                    ('p', 'Durante los últimos meses dejé de usar la IA solo para pedir respuestas y empecé a delegarle trabajo completo. Claude Code trabaja dentro de mis repositorios, abre ramas y pull requests, consulta despliegues en Vercel, lee archivos de Google Drive y, mediante servidores MCP, maneja aplicaciones de escritorio como DaVinci Resolve o Audacity. Yo defino el objetivo y el criterio de calidad; el agente ejecuta, verifica y me reporta qué hizo y qué no pudo comprobar.'),
                    ('facts', [('63 / 113', 'commits del portal Telemetry One firmados en sesiones con Claude Code'), ('57', 'pull requests en ese repositorio entre octubre y noviembre de 2026'), ('5 → 36', 'páginas en el sitemap del catálogo después de una auditoría de este portfolio'), ('69 → 12', 'problemas detectados por el validador del sitio después de esa misma ronda')]),
                ]),
                ('Conexiones', 'Primero, decidir a qué puede acceder.', [
                    ('p', 'El valor de un agente depende de lo que puede tocar. Lo configuré por capas y con un motivo concreto para cada acceso:'),
                    ('cards', [
                        ('Código', 'GitHub', 'Repositorios, ramas, pull requests y revisión de checks. Cada cambio queda en una rama propia y pasa por un PR que puedo leer antes de fusionar.'),
                        ('Publicación', 'Vercel', 'Estado de despliegues, logs de compilación y errores en producción. Sirve para confirmar que lo que se fusionó es lo que efectivamente está publicado.'),
                        ('Archivos', 'Google Drive y Canva', 'Lectura de documentos y piezas de diseño que funcionan como fuente para artículos, guías o creatividades.'),
                        ('Escritorio', 'MCP locales', 'Servidores Model Context Protocol que conectan a Claude con DaVinci Resolve y Audacity en mi computadora, sin subir el material a terceros.'),
                    ]),
                    ('callout', 'Regla de diseño:', 'el acceso se agrega cuando una tarea lo necesita. Antes de instalar un servidor MCP de la comunidad, el agente revisa el código del instalador y del puente, y me explica qué puertos abre y qué permisos usa.'),
                ]),
                ('Caso 1', 'Un portal de Fórmula 1 construido con pull requests.', [
                    ('p', 'Telemetry One es mi portal de Fórmula 1 en Next.js y TypeScript. En octubre y noviembre de 2026 la mayor parte de su desarrollo pasó por sesiones de Claude Code: un replay de carreras con datos de OpenF1, un mapa 3D con los autos sobre el circuito real, informes automáticos después de cada Gran Premio, preparación para el dominio telemetry-one.com y pre-renderizado en español e inglés.'),
                    ('p', 'El método fue siempre el mismo. Yo describo el resultado esperado; el agente trabaja en una rama, corre la compilación y los chequeos de TypeScript, abre un PR con una descripción legible y Vercel genera una vista previa. Recién después de revisar esa vista previa se fusiona a producción.'),
                    ('flow', [('Pedir', 'Describir el resultado en lenguaje de producto, con el criterio de aceptación.'), ('Construir', 'Rama propia, cambios acotados y build local con chequeos de tipos.'), ('Revisar', 'Pull request con explicación y vista previa de Vercel.'), ('Publicar', 'Merge a main, despliegue automático y verificación en producción.')]),
                ]),
                ('Caso 2', 'Auditar este portfolio como lo haría un equipo senior.', [
                    ('p', 'Este sitio también pasó por varias rondas con Claude. En una de ellas el agente detectó que el catálogo y el carrusel de herramientas se renderizaban solo con JavaScript: un buscador o un bot de vista previa que no ejecuta scripts veía una lista vacía. La corrección fue generar una versión estática del catálogo en la compilación, ampliar el sitemap de 5 a 36 páginas y sumar ese chequeo a la integración continua.'),
                    ('p', 'En otra ronda, una imagen para redes todavía mostraba el dominio anterior del sitio; el agente generó una nueva tarjeta de Open Graph. Y cuando los logos de software aparecieron gigantes en la portada, encontró la causa en un selector CSS demasiado estricto, publicó una corrección de una línea y verificó el resultado en producción.'),
                    ('p', 'La auditoría de lanzamiento más reciente cubrió funcionalidad, UX, contenido, accesibilidad, rendimiento y SEO técnico. El entregable fue una tabla priorizada en P0, P1 y P2, con evidencia, impacto, solución propuesta y esfuerzo estimado para cada hallazgo.'),
                ]),
                ('Caso 3', 'Más allá del código.', [
                    ('list', [
                        ('Video:', 'animación de logo, reels verticales y una guía de edición de 16 páginas, trabajando directamente sobre DaVinci Resolve.'),
                        ('Audio:', 'limpieza de una entrevista con Audacity y DeepFilterNet, verificada muestra por muestra.'),
                        ('Contenido:', 'artículos bilingües como este, con metadatos, etiquetas de software e índice de búsqueda actualizados en el mismo cambio.'),
                    ]),
                ]),
                ('Criterio', 'Lo que no delego.', [
                    ('list', [
                        ('El objetivo y la evidencia:', 'qué vale la pena construir y qué afirmación puede sostener cada página.'),
                        ('Los pasos irreversibles:', 'cambios en producción, borrados o mensajes externos esperan mi confirmación.'),
                        ('La revisión final:', 'leo los PR, miro las vistas previas y escucho o veo lo que el agente no puede percibir.'),
                        ('La honestidad del reporte:', 'pido que cada entrega diga qué se comprobó y qué quedó sin verificar.'),
                    ]),
                    ('callout', 'Resultado:', 'proyectos personales con escala de producto, auditorías más rápidas y un portfolio que se mantiene al día. También uso ChatGPT y Codex en otros proyectos; la diferencia no está en la marca de la herramienta, sino en definir bien el trabajo y revisar el resultado.'),
                ]),
                ('Fuentes', 'Proyectos mencionados.', [
                    ('sources', [('https://github.com/MynosIII/telemetry-1', 'Repositorio de Telemetry One', 'Historial de PRs y commits ↗'), ('https://telemetry-one.com', 'Telemetry One en producción', 'Abrir ↗'), ('telemetry-one-ecosistema-es.html', 'Artículo sobre Telemetry One', 'Leer'), ('construccion-portfolio-es.html', 'Cómo construí este portfolio', 'Leer')]),
                ]),
            ],
        },
        'en': {
            'title': 'Working with an AI agent: Claude as part of the team',
            'kicker': 'Applied AI · Workflow · Development',
            'deck': 'How I use Claude Code connected to GitHub, Vercel, Google Drive and desktop apps to build, audit and ship real projects, and the rules I keep so the output can be trusted.',
            'keywords': ['Claude', 'Claude Code', 'Anthropic', 'AI agent', 'applied AI', 'MCP', 'Model Context Protocol', 'GitHub', 'pull requests', 'Vercel', 'Next.js', 'TypeScript', 'Python', 'Google Drive', 'Canva', 'Playwright', 'website audit', 'technical SEO', 'automation', 'workflow', 'productivity'],
            'sections': [
                ('Context', 'A collaborator that works inside my tools, not next to them.', [
                    ('p', 'Over the last few months I stopped using AI only to ask for answers and started delegating complete pieces of work. Claude Code works inside my repositories, opens branches and pull requests, checks deployments on Vercel, reads Google Drive files and, through MCP servers, operates desktop applications such as DaVinci Resolve and Audacity. I set the goal and the quality bar; the agent executes, verifies and reports what it did and what it could not check.'),
                    ('facts', [('63 / 113', 'Telemetry One commits co-authored in Claude Code sessions'), ('57', 'pull requests in that repository between October and November 2026'), ('5 → 36', 'pages in the catalog sitemap after an audit of this portfolio'), ('69 → 12', 'issues reported by the site validator after that same round')]),
                ]),
                ('Connections', 'First, decide what it can reach.', [
                    ('p', 'An agent is only as useful as what it can touch. I set it up in layers, with a concrete reason for each connection:'),
                    ('cards', [
                        ('Code', 'GitHub', 'Repositories, branches, pull requests and check results. Every change lives on its own branch and goes through a PR I can read before merging.'),
                        ('Shipping', 'Vercel', 'Deployment status, build logs and production errors, to confirm that what was merged is what is actually live.'),
                        ('Files', 'Google Drive and Canva', 'Documents and design files that serve as the source for articles, guides and creatives.'),
                        ('Desktop', 'Local MCP servers', 'Model Context Protocol servers that connect Claude to DaVinci Resolve and Audacity on my computer, without uploading the material to third parties.'),
                    ]),
                    ('callout', 'Design rule:', 'access is added when a task needs it. Before installing a community MCP server, the agent reviews the installer and bridge code and explains which ports it opens and which permissions it uses.'),
                ]),
                ('Case 1', 'A Formula 1 portal built through pull requests.', [
                    ('p', 'Telemetry One is my Formula 1 portal, built with Next.js and TypeScript. In October and November 2026 most of its development ran through Claude Code sessions: a race replay powered by OpenF1 data, a 3D map with cars on the real circuit, automatic post-race reports, preparation for the telemetry-one.com domain and prerendering in Spanish and English.'),
                    ('p', 'The method was always the same. I describe the expected outcome; the agent works on a branch, runs the build and TypeScript checks, opens a PR with a readable description, and Vercel produces a preview. Only after reviewing that preview does the change merge to production.'),
                    ('flow', [('Ask', 'Describe the outcome in product terms, with acceptance criteria.'), ('Build', 'A dedicated branch, scoped changes and a local build with type checks.'), ('Review', 'A pull request with an explanation and a Vercel preview.'), ('Ship', 'Merge to main, automatic deployment and a check in production.')]),
                ]),
                ('Case 2', 'Auditing this portfolio the way a senior team would.', [
                    ('p', 'This site has also been through several rounds with Claude. In one of them the agent found that the catalog and the software carousel were rendered only by JavaScript: a search engine or link-preview bot that does not run scripts saw an empty list. The fix was to generate a static snapshot of the catalog at build time, grow the sitemap from 5 to 36 pages and add that check to continuous integration.'),
                    ('p', 'In another round, a social sharing image still showed the site’s old domain, so the agent generated a new Open Graph card. When software logos suddenly rendered oversized on the home page, it traced the cause to an overly narrow CSS selector, shipped a one-line fix and verified it in production.'),
                    ('p', 'The latest launch audit covered functionality, UX, content, accessibility, performance and technical SEO. The deliverable was a table prioritized into P0, P1 and P2, with evidence, impact, a proposed fix and an effort estimate for every finding.'),
                ]),
                ('Case 3', 'Beyond code.', [
                    ('list', [
                        ('Video:', 'a logo animation, vertical reels and a 16-page editing guide, working directly in DaVinci Resolve.'),
                        ('Audio:', 'cleaning up an interview with Audacity and DeepFilterNet, verified sample by sample.'),
                        ('Content:', 'bilingual articles like this one, with metadata, software tags and the search index updated in the same change.'),
                    ]),
                ]),
                ('Judgment', 'What I do not delegate.', [
                    ('list', [
                        ('The goal and the evidence:', 'what is worth building and which claims each page can support.'),
                        ('Irreversible steps:', 'production changes, deletions and outside messages wait for my confirmation.'),
                        ('The final review:', 'I read the PRs, check the previews and listen to or watch what the agent cannot perceive.'),
                        ('An honest report:', 'every handoff has to state what was verified and what was left unchecked.'),
                    ]),
                    ('callout', 'Outcome:', 'personal projects at product scale, faster audits and a portfolio that stays current. I also use ChatGPT and Codex on other projects; what matters is not the brand of the tool but defining the work well and reviewing the result.'),
                ]),
                ('Sources', 'Projects mentioned.', [
                    ('sources', [('https://github.com/MynosIII/telemetry-1', 'Telemetry One repository', 'PR and commit history ↗'), ('https://telemetry-one.com', 'Telemetry One in production', 'Open ↗'), ('telemetry-one-ecosistema-en.html', 'Article about Telemetry One', 'Read'), ('construccion-portfolio-en.html', 'How I built this portfolio', 'Read')]),
                ]),
            ],
        },
    },
    {
        'slug': 'postproduccion-video-davinci-resolve-ia',
        'cover': 'assets/catalog-previews/postproduccion-video-davinci-resolve-ia.png',
        'categories': ['articles', 'creative'],
        'tools': ['davinci-resolve', 'claude', 'python', 'ffmpeg', 'obs-studio'],
        'es': {
            'title': 'Postproducción de video con IA: DaVinci Resolve conectado a Claude',
            'kicker': 'Video · Motion graphics · IA aplicada',
            'deck': 'Cómo conecté DaVinci Resolve a Claude mediante MCP para animar el logo de Oxi, armar reels verticales, empatar color, generar efectos de sonido por código y documentar todo en una guía de edición para el equipo.',
            'keywords': ['DaVinci Resolve', 'Claude', 'Claude Code', 'MCP', 'Model Context Protocol', 'Python', 'FFmpeg', 'OBS Studio', 'postproducción', 'edición de video', 'motion graphics', 'animación de logo', 'reels', 'Instagram Reels', 'video vertical', 'corrección de color', 'efectos de sonido', 'diseño sonoro', 'subtítulos', 'Oxi', 'IA aplicada'],
            'sections': [
                ('El problema', 'Producir video corto con un equipo chico.', [
                    ('p', 'Oxi, la agencia de contenido y análisis que estoy construyendo, publica reels con explicaciones de marketing. Cada pieza necesita identidad de marca, subtítulos, animaciones sobre la persona que habla, efectos de sonido y un formato vertical prolijo. El cuello de botella no era la idea, sino las horas de edición repetitiva.'),
                    ('facts', [('1080 × 1920', 'formato vertical de los reels'), ('11', 'animaciones agregadas a un episodio con sus sonidos'), ('16', 'páginas de la guía de edición para el equipo'), ('0', 'licencias de sonido: los efectos se generan por código')]),
                ]),
                ('Conexión', 'Un puente local entre Claude y DaVinci Resolve.', [
                    ('p', 'Usé un servidor MCP de código abierto que expone la API de scripting de DaVinci Resolve. Antes de instalarlo revisamos el instalador y el puente: escucha solo en mi propia computadora y pide un token aleatorio. Quedó en un entorno de Python separado, con actualizaciones en modo aviso y un respaldo de la configuración.'),
                    ('p', 'Para trabajar, abro Resolve con el proyecto y ejecuto el script del puente desde el menú Workspace. A partir de ahí Claude puede crear timelines, importar material, ubicar clips en pistas, poner marcadores y leer cuadros renderizados para revisar el resultado.'),
                    ('callout', 'Lección práctica:', 'en estas integraciones la versión importa. Fijar la versión de Resolve y del puente evita que una actualización deje sin scripting al flujo de trabajo.'),
                ]),
                ('Identidad', 'Un logo que se escribe solo.', [
                    ('p', 'La animación del logo simula un cursor naranja que escribe la O, la X y la i, salta al punto y lo convierte en el acento de la marca. Las capas se generan con Python a la resolución final y se arman en Resolve, en lugar de recortar un video horizontal, para que los bordes queden nítidos.'),
                    ('cards', [
                        ('Versión A', 'Guiño naranja', 'Teclas, encastre del cursor y un guiño final, cada sonido en su propia pista para poder ajustarlo.'),
                        ('Versión B', 'De blanco a naranja', 'El acento destella como un tubo de neón hasta quedar fijo; un acorde ascendente cierra la animación.'),
                        ('Marca de agua', 'Loop sobre croma', 'Cinco segundos que empiezan y terminan igual, con un parpadeo de encendido y apagado sin semitransparencias para que el keying quede limpio.'),
                        ('Reel', '9:16 para Instagram', 'El logo ocupa cerca del 75 % del ancho y queda lejos de los botones laterales y del texto inferior de la app.'),
                    ]),
                ]),
                ('Sonido', 'Efectos de sonido generados por código.', [
                    ('p', 'Los clics de teclado, el golpe de encastre, el zumbido de neón y los blips se sintetizan con Python. Toman los tiempos del mismo script que genera las capas, así que si la animación cambia, el sonido la sigue. Como el agente no puede escuchar, la verificación es visual: se grafican las ondas contra los cuadros para confirmar que cada sonido cae en su frame y que la mezcla no pasa de −1 dBFS. La escucha final queda de mi lado.'),
                    ('p', 'El mismo enfoque produjo otros recursos para la biblioteca del equipo: un contador mecánico de 18 ticks, un barrido estéreo y un tecleo con ritmo irregular, preparados con fundidos cortos y picos normalizados.'),
                ]),
                ('Edición', 'Animaciones sobre el discurso.', [
                    ('p', 'En un episodio sobre demanda de búsqueda, Claude agregó 11 animaciones en una pista nueva: una barra de búsqueda que se escribe sola, resultados que aparecen y una tarjeta que dice que tu negocio no figura, palabras que se tachan, un botón de guardar y un cierre con el botón de seguir. Las frases destacadas reemplazan a sus subtítulos para no duplicar texto, y cada recurso tiene su sonido: clics, pops o caja registradora.'),
                ]),
                ('Guía', 'Convertir lo aprendido en un estándar.', [
                    ('p', 'El último paso fue documentar el proceso para que cualquier editor del equipo pueda repetirlo. La guía se genera con Python como PDF y tiene diez pasos en el orden real del trabajo:'),
                    ('table', 'Resumen de la guía de edición', ['Paso', 'Qué define'], [
                        ('Proyecto', '1080 × 1920 y la cadencia de la cámara, con la estructura de carpetas.'),
                        ('Vertical', 'Rotación y zoom para pasar tomas 1440 × 1080 a vertical, con la fórmula para otras cámaras.'),
                        ('Audio', 'Sincronía por forma de onda y una cadena de limpieza hasta −14 LUFS.'),
                        ('Color', 'Waveform, Vectorscope y empate de tomas con un still en pantalla partida.'),
                        ('Corte', 'De 2 a 4 cuadros de aire, muletillas, errores y zooms de 10 a 15 % para disimular saltos.'),
                        ('Subtítulos', 'Open Sans 30, máximo dos líneas y unos 34 caracteres por línea.'),
                        ('Recursos', 'Qué animación usar según lo que dice el guion y cuántas son demasiadas.'),
                        ('Sonido', '14 situaciones, cada una con su efecto, su cuadro y su nivel.'),
                        ('Exportar', 'Ajustes de Deliver, corrección de audio desfasado con FFmpeg y checklist final.'),
                    ]),
                ]),
                ('Aprendizajes', 'Qué cambió en el proceso.', [
                    ('list', [
                        ('La repetición se automatiza:', 'armar timelines, ubicar capas y sincronizar sonidos deja de ocupar la mayor parte del tiempo.'),
                        ('El criterio se documenta:', 'la guía convierte decisiones sueltas en reglas que el equipo puede aplicar.'),
                        ('La revisión sigue siendo humana:', 'mirar y escuchar el resultado final es lo que define si una pieza se publica.'),
                    ]),
                ]),
                ('Relacionado', 'Seguir leyendo.', [
                    ('sources', [('oxi-contenido-y-analisis-es.html', 'Oxi: contenido y análisis', 'Leer'), ('limpieza-audio-entrevista-ia-es.html', 'Limpiar el audio de una entrevista con IA', 'Leer'), ('trabajo-con-claude-es.html', 'Trabajar con un agente de IA', 'Leer')]),
                ]),
            ],
        },
        'en': {
            'title': 'AI-assisted video post-production: DaVinci Resolve connected to Claude',
            'kicker': 'Video · Motion graphics · Applied AI',
            'deck': 'How I connected DaVinci Resolve to Claude through MCP to animate the Oxi logo, build vertical reels, match color, generate sound effects with code and document it all in an editing guide for the team.',
            'keywords': ['DaVinci Resolve', 'Claude', 'Claude Code', 'MCP', 'Model Context Protocol', 'Python', 'FFmpeg', 'OBS Studio', 'post-production', 'video editing', 'motion graphics', 'logo animation', 'reels', 'Instagram Reels', 'vertical video', 'color correction', 'sound effects', 'sound design', 'subtitles', 'Oxi', 'applied AI'],
            'sections': [
                ('The problem', 'Producing short-form video with a small team.', [
                    ('p', 'Oxi, the content and analytics agency I am building, publishes reels that explain marketing concepts. Each piece needs brand identity, captions, animations over the presenter, sound effects and a clean vertical format. The bottleneck was not ideas; it was hours of repetitive editing.'),
                    ('facts', [('1080 × 1920', 'vertical format for the reels'), ('11', 'animations added to one episode, each with its sound'), ('16', 'pages in the team’s editing guide'), ('0', 'sound licenses: effects are generated with code')]),
                ]),
                ('Connection', 'A local bridge between Claude and DaVinci Resolve.', [
                    ('p', 'I used an open-source MCP server that exposes DaVinci Resolve’s scripting API. Before installing it, we reviewed the installer and the bridge: it only listens on my own computer and requires a random token. It runs in a separate Python environment, with updates set to notify only and a backup of the configuration.'),
                    ('p', 'To work, I open Resolve with the project and launch the bridge script from the Workspace menu. From there Claude can create timelines, import media, place clips on tracks, add markers and read rendered frames to review the result.'),
                    ('callout', 'Practical lesson:', 'versions matter in these integrations. Pinning the Resolve and bridge versions keeps an update from breaking scripting for the whole workflow.'),
                ]),
                ('Identity', 'A logo that types itself.', [
                    ('p', 'The logo animation simulates an orange cursor that types the O, the X and the i, jumps to the dot and turns it into the brand’s accent. Layers are generated with Python at the final resolution and assembled in Resolve, instead of cropping a horizontal video, so edges stay sharp.'),
                    ('cards', [
                        ('Version A', 'Orange wink', 'Key clicks, the cursor snapping into place and a final wink, each sound on its own track so it can be adjusted.'),
                        ('Version B', 'White to orange', 'The accent flickers like a neon tube until it settles; a rising chord closes the animation.'),
                        ('Watermark', 'Chroma loop', 'Five seconds that start and end on the same frame, with on/off flicker and no semi-transparent frames so the key stays clean.'),
                        ('Reel', '9:16 for Instagram', 'The logo fills about 75% of the width and stays clear of the app’s side buttons and bottom caption.'),
                    ]),
                ]),
                ('Sound', 'Sound effects generated with code.', [
                    ('p', 'The key clicks, snap, neon hum and blips are synthesized with Python. They read their timing from the same script that renders the layers, so if the animation changes, the sound follows. Because the agent cannot listen, verification is visual: waveforms are plotted against frames to confirm that every sound lands on its frame and that the mix stays under −1 dBFS. The final listen is mine.'),
                    ('p', 'The same approach produced more assets for the team library: a mechanical counter with 18 ticks, a stereo swipe and irregular typing, prepared with short fades and normalized peaks.'),
                ]),
                ('Editing', 'Animations that follow the script.', [
                    ('p', 'For an episode about search demand, Claude added 11 animations on a new track: a search bar that types itself, results that appear and a card saying your business is missing, words that get struck through, a save button and a closing follow button. Highlighted phrases replace their captions to avoid duplicate text, and every element has its sound: clicks, pops or a cash register.'),
                ]),
                ('Guide', 'Turning what we learned into a standard.', [
                    ('p', 'The last step was documenting the process so any editor on the team can repeat it. The guide is generated as a PDF with Python and has ten steps in the real order of work:'),
                    ('table', 'Summary of the editing guide', ['Step', 'What it defines'], [
                        ('Project', '1080 × 1920 at the camera’s frame rate, with a folder structure.'),
                        ('Vertical', 'Rotation and zoom to turn 1440 × 1080 footage vertical, with the formula for other cameras.'),
                        ('Audio', 'Waveform sync and a cleanup chain targeting −14 LUFS.'),
                        ('Color', 'Waveform, Vectorscope and matching shots against a still in split screen.'),
                        ('Cutting', '2 to 4 frames of air, filler words, mid-sentence mistakes and 10–15% zooms to hide jump cuts.'),
                        ('Captions', 'Open Sans 30, at most two lines and about 34 characters per line.'),
                        ('Graphics', 'Which animation to use for what the script says, and how many is too many.'),
                        ('Sound', '14 situations, each with its effect, frame and level.'),
                        ('Export', 'Deliver settings, fixing out-of-sync audio with FFmpeg and a final checklist.'),
                    ]),
                ]),
                ('Takeaways', 'What changed in the process.', [
                    ('list', [
                        ('Repetition gets automated:', 'building timelines, placing layers and syncing sounds no longer takes most of the time.'),
                        ('Judgment gets documented:', 'the guide turns scattered decisions into rules the team can apply.'),
                        ('Review stays human:', 'watching and listening to the final cut is what decides whether a piece ships.'),
                    ]),
                ]),
                ('Related', 'Keep reading.', [
                    ('sources', [('oxi-contenido-y-analisis-en.html', 'Oxi: content and analysis', 'Read'), ('limpieza-audio-entrevista-ia-en.html', 'Cleaning interview audio with AI', 'Read'), ('trabajo-con-claude-en.html', 'Working with an AI agent', 'Read')]),
                ]),
            ],
        },
    },
    {
        'slug': 'limpieza-audio-entrevista-ia',
        'cover': 'assets/catalog-previews/limpieza-audio-entrevista-ia.png',
        'categories': ['articles', 'creative'],
        'tools': ['audacity', 'claude', 'python', 'ffmpeg'],
        'es': {
            'title': 'Limpiar el audio de una entrevista con IA: Audacity y DeepFilterNet',
            'kicker': 'Audio · IA aplicada · Control de calidad',
            'deck': 'Cómo conecté Audacity a Claude para mejorar una entrevista de casi 22 minutos, por qué la primera versión empeoró el sonido y cómo una segunda pasada con DeepFilterNet bajó 21 dB el ruido sin mover una sola muestra.',
            'keywords': ['Audacity', 'DeepFilterNet', 'Claude', 'Claude Code', 'MCP', 'mod-script-pipe', 'Python', 'NumPy', 'FFmpeg', 'reducción de ruido', 'limpieza de audio', 'IA para audio', 'entrevista', 'podcast', 'LUFS', 'normalización', 'compresor', 'procesamiento de audio', 'control de calidad', 'IA aplicada'],
            'sections': [
                ('El encargo', 'Una entrevista útil con un audio difícil.', [
                    ('p', 'Tenía una entrevista de 21:46 grabada a 48 kHz, con ruido de fondo y una compresión fuerte del archivo original. Los primeros 7:58 debían quedar en silencio, igual que en la edición previa. El objetivo era una voz clara y estable sin cortar, mover ni reemplazar nada del proyecto existente.'),
                    ('facts', [('21:46', 'duración de la entrevista, idéntica antes y después'), ('−21 dB', 'ruido de fondo en las pausas frente a la primera versión'), ('≤ 0,06 ms', 'desfase máximo con el original: de 0 a 3 muestras'), ('−0,97 dBFS', 'pico final, sin saturación')]),
                ]),
                ('Conexión', 'Audacity controlado desde Claude.', [
                    ('p', 'Audacity incluye un canal de scripting, mod-script-pipe, que permite importar archivos, aplicar efectos y guardar proyectos mediante comandos. Lo conecté a Claude Code a través de MCP. Para el análisis, Claude usó Python con NumPy y FFmpeg para decodificar y comparar los archivos fuera de Audacity.'),
                    ('callout', 'Primera regla:', 'trabajar sobre el archivo m4a original y no sobre el mp3 ya editado, porque tenía una capa de compresión menos. Antes de tocar nada se comprobó que ambos coincidían muestra a muestra y en qué instante exacto terminaba el silencio.'),
                ]),
                ('Primera pasada', 'Una cadena clásica que reveló el problema.', [
                    ('p', 'La primera versión usó efectos tradicionales: filtro pasa-altos en 80 Hz, reducción de ruido de 10 dB, menos cuerpo entre 200 y 800 Hz, más claridad entre 2 y 6 kHz, compresor suave, normalización a −16 LUFS y limitador en −1 dB. En los números funcionó: la diferencia entre partes fuertes y suaves bajó de casi 13 dB a 7 dB.'),
                    ('p', 'Al escucharla aparecieron cortes y agudos metálicos. El diagnóstico fue concreto: la compuerta de ruido abría y cerraba entre palabras, y la ganancia general subió también el siseo y los artefactos de compresión del archivo de 96 kbps.'),
                ]),
                ('Segunda pasada', 'IA local en lugar de más efectos.', [
                    ('p', 'La solución fue DeepFilterNet, un modelo de código abierto especializado en separar la voz del ruido. Corre sin conexión, así que el audio nunca salió de la computadora, y trabaja de forma nativa a 48 kHz. La alternativa era un servicio web que exige subir la grabación a servidores de terceros.'),
                    ('flow', [('Limpiar', 'DeepFilterNet sobre el original, con un límite de atenuación para que la voz no suene artificial.'), ('Ajustar', 'La misma cadena, sin compuerta, con menos realce de agudos y compresión más liviana.'), ('Reemplazar', 'Nueva pista en el proyecto con el mismo silencio inicial y la versión anterior silenciada como referencia.'), ('Verificar', 'Duración, alineación, ruido en pausas, picos y nivel de voz, medidos por código.')]),
                ]),
                ('Verificación', 'Medir antes de declarar terminado.', [
                    ('table', 'Comprobaciones de la versión final', ['Control', 'Resultado'], [
                        ('Duración', 'Igual al original: 21:46.389 y el mismo silencio inicial.'),
                        ('Alineación', 'Correlación cruzada en cinco puntos: de 0 a 3 muestras de diferencia, inaudible.'),
                        ('Ruido en pausas', '21 dB menos que la primera versión.'),
                        ('Saturación', 'Pico en −0,97 dBFS.'),
                        ('Voz', 'Nivel parecido al de la versión anterior, algo más bajo.'),
                    ]),
                    ('p', 'El proyecto nuevo se guardó con otro nombre y el anterior quedó intacto. Esa regla vino de mi lado durante el trabajo y es la que ahora aplico a cualquier proceso automático: nunca sobrescribir el material de partida.'),
                ]),
                ('Aprendizajes', 'Qué me llevo.', [
                    ('list', [
                        ('Más procesamiento no es mejor sonido:', 'subir el nivel también sube los defectos que ya estaban.'),
                        ('La IA local protege el material:', 'una entrevista puede contener información sensible y no tiene por qué subirse a la nube.'),
                        ('Los números no reemplazan la escucha:', 'las métricas confirman que nada se rompió; el oído decide si suena natural.'),
                    ]),
                ]),
                ('Relacionado', 'Seguir leyendo.', [
                    ('sources', [('https://github.com/Rikorose/DeepFilterNet', 'DeepFilterNet', 'Proyecto de código abierto ↗'), ('postproduccion-video-davinci-resolve-ia-es.html', 'Postproducción de video con IA', 'Leer'), ('trabajo-con-claude-es.html', 'Trabajar con un agente de IA', 'Leer')]),
                ]),
            ],
        },
        'en': {
            'title': 'Cleaning interview audio with AI: Audacity and DeepFilterNet',
            'kicker': 'Audio · Applied AI · Quality control',
            'deck': 'How I connected Audacity to Claude to improve a nearly 22-minute interview, why the first version made it sound worse, and how a second pass with DeepFilterNet cut background noise by 21 dB without moving a single sample.',
            'keywords': ['Audacity', 'DeepFilterNet', 'Claude', 'Claude Code', 'MCP', 'mod-script-pipe', 'Python', 'NumPy', 'FFmpeg', 'noise reduction', 'audio cleanup', 'AI audio', 'interview', 'podcast', 'LUFS', 'loudness normalization', 'compressor', 'audio processing', 'quality control', 'applied AI'],
            'sections': [
                ('The brief', 'A valuable interview with difficult audio.', [
                    ('p', 'I had a 21:46 interview recorded at 48 kHz, with background noise and heavy compression in the source file. The first 7:58 had to stay silent, as in the previous edit. The goal was a clear, steady voice without cutting, shifting or replacing anything in the existing project.'),
                    ('facts', [('21:46', 'interview length, identical before and after'), ('−21 dB', 'background noise in pauses compared with the first version'), ('≤ 0.06 ms', 'maximum offset from the original: 0 to 3 samples'), ('−0.97 dBFS', 'final peak, with no clipping')]),
                ]),
                ('Connection', 'Audacity driven by Claude.', [
                    ('p', 'Audacity includes a scripting channel, mod-script-pipe, that can import files, apply effects and save projects through commands. I connected it to Claude Code through MCP. For analysis, Claude used Python with NumPy and FFmpeg to decode and compare files outside Audacity.'),
                    ('callout', 'First rule:', 'work from the original m4a rather than the already-edited mp3, because it carried one less layer of compression. Before touching anything, we confirmed that both matched sample by sample and found the exact moment the silence ended.'),
                ]),
                ('First pass', 'A classic chain that exposed the problem.', [
                    ('p', 'The first version used traditional effects: an 80 Hz high-pass filter, 10 dB of noise reduction, less body between 200 and 800 Hz, more clarity between 2 and 6 kHz, gentle compression, normalization to −16 LUFS and a limiter at −1 dB. On paper it worked: the gap between loud and quiet passages dropped from almost 13 dB to 7 dB.'),
                    ('p', 'Listening revealed dropouts and metallic highs. The diagnosis was specific: the noise gate opened and closed between words, and the overall gain also raised the hiss and compression artifacts of the 96 kbps file.'),
                ]),
                ('Second pass', 'Local AI instead of more effects.', [
                    ('p', 'The fix was DeepFilterNet, an open-source model built to separate speech from noise. It runs offline, so the audio never left the computer, and it works natively at 48 kHz. The alternative was a web service that requires uploading the recording to third-party servers.'),
                    ('flow', [('Clean', 'DeepFilterNet on the original, with an attenuation limit so the voice does not sound artificial.'), ('Adjust', 'The same chain without the gate, with less treble boost and lighter compression.'), ('Replace', 'A new track in the project with the same leading silence and the previous version muted as a reference.'), ('Verify', 'Length, alignment, noise in pauses, peaks and voice level, measured with code.')]),
                ]),
                ('Verification', 'Measure before calling it done.', [
                    ('table', 'Checks on the final version', ['Check', 'Result'], [
                        ('Length', 'Same as the original: 21:46.389 with the same leading silence.'),
                        ('Alignment', 'Cross-correlation at five points: 0 to 3 samples of difference, inaudible.'),
                        ('Noise in pauses', '21 dB lower than the first version.'),
                        ('Clipping', 'Peak at −0.97 dBFS.'),
                        ('Voice', 'Similar level to the previous version, slightly lower.'),
                    ]),
                    ('p', 'The new project was saved under a different name and the previous one stayed untouched. I set that rule during the work, and it is now how I approach any automated process: never overwrite the source material.'),
                ]),
                ('Takeaways', 'What I learned.', [
                    ('list', [
                        ('More processing is not better sound:', 'raising the level also raises the flaws that were already there.'),
                        ('Local AI protects the material:', 'an interview can contain sensitive information and does not need to be uploaded to the cloud.'),
                        ('Numbers do not replace listening:', 'metrics confirm nothing broke; ears decide whether it sounds natural.'),
                    ]),
                ]),
                ('Related', 'Keep reading.', [
                    ('sources', [('https://github.com/Rikorose/DeepFilterNet', 'DeepFilterNet', 'Open-source project ↗'), ('postproduccion-video-davinci-resolve-ia-en.html', 'AI-assisted video post-production', 'Read'), ('trabajo-con-claude-en.html', 'Working with an AI agent', 'Read')]),
                ]),
            ],
        },
    },
]
