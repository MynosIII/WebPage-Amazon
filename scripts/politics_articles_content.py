"""Bilingual content for the November 2026 political research articles (OSINT social listening,
multidimensional survey map, and data-to-strategy essay).

Rendered by ``scripts/add_politics_articles.py`` with the same block types as
``scripts/claude_articles_content.py``. Disclosure rule: describe methods and aggregate results
only. No OSINT dashboard or repository links, no client names, no raw posts.
The public survey map (ProjectMilei2) may be linked (owner decision, 2026-11-11).
"""

PUBLISHED = '2026-11-11'

ARTICLES = [
    {
        'slug': 'escucha-social-politica-osint',
        'cover': 'assets/catalog-previews/escucha-social-politica-osint.png',
        'categories': ['articles', 'research'],
        'tools': ['python', 'pandas', 'numpy', 'scikit-learn', 'pysentimiento', 'hugging-face', 'pytorch', 'networkx', 'plotly',
                  'github', 'youtube', 'google-news', 'google-trends', 'gdelt', 'wikipedia', 'bluesky', 'mastodon', 'reddit'],
        'es': {
            'title': 'Escucha social política con fuentes abiertas (OSINT)',
            'kicker': 'Política · OSINT · Análisis de datos',
            'deck': 'Cómo construí un sistema diario de escucha social para la política de Argentina y Brasil: qué fuentes abiertas recolecta, cómo clasifica tono y narrativas con Python y modelos de lenguaje, y qué cuidados de privacidad aplica.',
            'keywords': ['OSINT', 'fuentes abiertas', 'escucha social', 'social listening', 'opinión pública', 'política argentina', 'política brasileña',
                         'análisis de sentimiento', 'análisis de discurso', 'NLP', 'procesamiento de lenguaje natural', 'modelado de tópicos', 'NMF', 'TF-IDF',
                         'detección de coordinación', 'reputación política', 'Python', 'pandas', 'NumPy', 'scikit-learn', 'pysentimiento', 'RoBERTuito',
                         'Hugging Face', 'PyTorch', 'NetworkX', 'Plotly', 'GitHub Actions', 'YouTube Data API', 'Google News', 'Google Trends', 'GDELT',
                         'Wikipedia', 'Bluesky', 'Mastodon', 'Reddit', 'Milei', 'Lula'],
            'sections': [
                ('Contexto', 'Ordenar la conversación pública antes de interpretarla.', [
                    ('p', 'La información política abunda, pero está dispersa: notas de cientos de medios, comentarios en video, búsquedas, chequeos de datos y redes con lógicas distintas. Construí un sistema que todos los días recolecta esas fuentes abiertas, las normaliza y las convierte en indicadores agregados sobre unos cuarenta dirigentes de Argentina y Brasil: volumen de menciones, tono, narrativas dominantes, picos de atención y exposición a términos de riesgo reputacional.'),
                    ('p', 'El tablero es una herramienta de trabajo y no se publica en este sitio. Lo que sigue explica cómo funciona y qué tipo de lectura permite.'),
                    ('facts', [('4.216', 'notas analizadas en dos semanas (28/10 al 10/11/2026)'), ('792', 'medios distintos detectados en ese período'), ('39', 'dirigentes con perfil y fuentes propias'), ('174', 'chequeos de datos de verificadores incluidos en el mismo período')]),
                ]),
                ('Fuentes', 'Solo fuentes abiertas y gratuitas.', [
                    ('p', 'Cada fuente tiene su propio recolector en Python, con reintentos, límites de velocidad y un registro del estado de cada corrida. Si una fuente falla, el resto sigue y el tablero lo informa.'),
                    ('cards', [
                        ('Medios', 'Google News y RSS', 'Búsquedas por dirigente y por verificadores de datos, más feeds RSS de medios de todo el espectro, cada uno rotulado con su línea editorial.'),
                        ('Video', 'YouTube Data API', 'Comentarios públicos de videos políticos recientes, por búsqueda temática y por canal.'),
                        ('Redes abiertas', 'Bluesky, Mastodon y Reddit', 'Publicaciones de APIs públicas que no exigen acceso privilegiado.'),
                        ('Atención', 'Google Trends, GDELT y Wikipedia', 'Interés de búsqueda, cobertura internacional y visitas a las páginas de cada dirigente como señales de atención.'),
                    ]),
                    ('callout', 'Límite explícito:', 'la conversación en redes y medios muestra qué circula y cómo se dice, pero no representa a toda la población. Por eso el sistema no reemplaza a una encuesta con diseño muestral.'),
                ]),
                ('Método', 'De miles de textos a señales que se pueden explicar.', [
                    ('flow', [
                        ('Recolectar', 'GitHub Actions corre el proceso todos los días y guarda los textos en una caché privada, fuera del repositorio público.'),
                        ('Clasificar', 'pysentimiento (modelos RoBERTuito y BERTweet sobre PyTorch) asigna tono, emoción y agresividad en español y portugués. Si el modelo no está disponible, hay diccionarios de respaldo que se pueden auditar.'),
                        ('Agrupar', 'TF-IDF y factorización NMF con scikit-learn detectan narrativas: grupos de términos que aparecen juntos y cómo cambia su participación día a día.'),
                        ('Alertar', 'Picos de volumen por puntaje z, términos de riesgo por dirigente y un índice simple de presión reputacional de 0 a 100.'),
                    ]),
                    ('p', 'El índice de presión combina cuatro componentes con pesos visibles: tono negativo, agresividad, términos de riesgo y aceleración del volumen. Prefiero una fórmula simple que cualquiera pueda reconstruir a un puntaje opaco que no se puede discutir.'),
                ]),
                ('Coordinación', 'Detectar mensajes casi idénticos sin acusar a nadie por error.', [
                    ('p', 'Para identificar posible actividad coordinada, el sistema compara publicaciones con n-gramas de caracteres y similitud coseno. Dos cuentas distintas que publican textos casi iguales (90% de similitud o más) en menos de una hora forman un vínculo en un grafo de NetworkX.'),
                    ('p', 'Una coincidencia aislada no alcanza, porque dos personas pueden copiar el mismo titular. Se exige que el mismo par de cuentas coincida en al menos dos mensajes distintos. En el período analizado no apareció ningún grupo que cumpliera ese criterio, y el tablero lo informa así en lugar de forzar un hallazgo.'),
                ]),
                ('Resultados', 'Qué se puede leer con este enfoque.', [
                    ('table', 'Narrativas con más notas entre el 28/10 y el 10/11/2026', ['Narrativa detectada', 'Notas'], [
                        ('Milei y Bullrich', '734'),
                        ('Lula y Alckmin', '659'),
                        ('El papa León XIV y Villarruel', '608'),
                        ('La familia Bolsonaro', '579'),
                        ('Kicillof, Máximo Kirchner y la provincia de Buenos Aires', '406'),
                    ]),
                    ('list', [
                        ('Tono general:', '22,5% negativo, 69,4% neutro y 8,1% positivo, clasificado con el modelo en las 4.216 notas.'),
                        ('Picos:', 'el 4 de noviembre el volumen superó en 3,2 desvíos estándar al promedio del período.'),
                        ('Lectura cualitativa:', 'el modelo separa temas, pero una misma frase puede ser apoyo, ironía o rechazo. Los hallazgos se revisan leyendo ejemplos antes de sacar conclusiones.'),
                    ]),
                ]),
                ('Privacidad', 'Publicar agregados, nunca personas.', [
                    ('list', [
                        ('Textos fuera del repositorio:', 'las publicaciones y comentarios viven en una caché temporal del flujo de trabajo; al repositorio solo llegan porcentajes y conteos.'),
                        ('Autores seudonimizados:', 'las cuentas se reemplazan por identificadores con hash antes del análisis.'),
                        ('Fuentes legítimas:', 'solo APIs públicas y datos abiertos, sin acceso a información privada.'),
                        ('Trazabilidad:', 'cada indicador conserva el enlace a la fuente pública que lo originó para poder verificarlo.'),
                    ]),
                    ('callout', 'Para qué sirve:', 'detectar antes los temas que crecen, comparar cómo se habla de distintos dirigentes y dar contexto verificable a un equipo que tiene que tomar decisiones de comunicación.'),
                ]),
                ('Relacionados', 'Seguir leyendo.', [
                    ('sources', [('mapa-politico-multidimensional-es.html', 'Un mapa político multidimensional', 'Leer'), ('datos-a-estrategia-politica-es.html', 'De los datos a la estrategia política', 'Leer'), ('consultora-es.html', 'Pulso de la opinión pública', 'Leer')]),
                ]),
            ],
        },
        'en': {
            'title': 'Political social listening with open sources (OSINT)',
            'kicker': 'Politics · OSINT · Data analysis',
            'deck': 'How I built a daily social listening system for Argentine and Brazilian politics: which open sources it collects, how it classifies tone and narratives with Python and language models, and which privacy safeguards it applies.',
            'keywords': ['OSINT', 'open source intelligence', 'social listening', 'public opinion', 'Argentine politics', 'Brazilian politics',
                         'sentiment analysis', 'discourse analysis', 'NLP', 'natural language processing', 'topic modeling', 'NMF', 'TF-IDF',
                         'coordinated behavior detection', 'political reputation', 'Python', 'pandas', 'NumPy', 'scikit-learn', 'pysentimiento', 'RoBERTuito',
                         'Hugging Face', 'PyTorch', 'NetworkX', 'Plotly', 'GitHub Actions', 'YouTube Data API', 'Google News', 'Google Trends', 'GDELT',
                         'Wikipedia', 'Bluesky', 'Mastodon', 'Reddit', 'Milei', 'Lula'],
            'sections': [
                ('Context', 'Organize the public conversation before interpreting it.', [
                    ('p', 'Political information is abundant but scattered: articles from hundreds of outlets, video comments, search interest, fact-checks and social networks with very different dynamics. I built a system that collects those open sources every day, normalizes them and turns them into aggregate indicators for about forty politicians in Argentina and Brazil: mention volume, tone, dominant narratives, attention spikes and exposure to reputational risk terms.'),
                    ('p', 'The dashboard is a working tool and is not published on this site. What follows explains how it works and what kind of reading it supports.'),
                    ('facts', [('4,216', 'news items analyzed over two weeks (Oct 28 to Nov 10, 2026)'), ('792', 'distinct outlets detected in that period'), ('39', 'politicians with their own profile and sources'), ('174', 'fact-checks from verification outlets in the same period')]),
                ]),
                ('Sources', 'Only open, free sources.', [
                    ('p', 'Each source has its own Python collector, with retries, rate limits and a status log for every run. If one source fails, the rest keep going and the dashboard reports it.'),
                    ('cards', [
                        ('News', 'Google News and RSS', 'Searches per politician and per fact-checker, plus RSS feeds from outlets across the spectrum, each labeled with its editorial line.'),
                        ('Video', 'YouTube Data API', 'Public comments on recent political videos, by topic search and by channel.'),
                        ('Open networks', 'Bluesky, Mastodon and Reddit', 'Posts from public APIs that do not require privileged access.'),
                        ('Attention', 'Google Trends, GDELT and Wikipedia', 'Search interest, international coverage and page views for each politician as attention signals.'),
                    ]),
                    ('callout', 'Explicit limit:', 'social and news conversation shows what circulates and how it is framed, but it does not represent the whole population. That is why the system does not replace a survey with a proper sample design.'),
                ]),
                ('Method', 'From thousands of texts to signals you can explain.', [
                    ('flow', [
                        ('Collect', 'GitHub Actions runs the pipeline daily and stores texts in a private cache, outside the public repository.'),
                        ('Classify', 'pysentimiento (RoBERTuito and BERTweet models on PyTorch) labels tone, emotion and aggression in Spanish and Portuguese. If the model is unavailable, auditable fallback lexicons take over.'),
                        ('Group', 'TF-IDF and NMF factorization in scikit-learn detect narratives: clusters of terms that appear together and how their share changes day by day.'),
                        ('Alert', 'Volume spikes by z-score, risk terms per politician and a simple 0 to 100 reputational pressure index.'),
                    ]),
                    ('p', 'The pressure index combines four components with visible weights: negative tone, aggression, risk terms and volume acceleration. I prefer a simple formula anyone can rebuild over an opaque score nobody can challenge.'),
                ]),
                ('Coordination', 'Spot near-identical messages without accusing anyone by mistake.', [
                    ('p', 'To flag possible coordinated activity, the system compares posts using character n-grams and cosine similarity. Two different accounts posting nearly identical texts (90% similarity or more) within an hour form an edge in a NetworkX graph.'),
                    ('p', 'A single match is not enough, because two people can copy the same headline. The same pair of accounts has to match on at least two different messages. In the period analyzed no group met that bar, and the dashboard says so instead of forcing a finding.'),
                ]),
                ('Results', 'What this approach makes readable.', [
                    ('table', 'Narratives with the most news items, Oct 28 to Nov 10, 2026', ['Detected narrative', 'Items'], [
                        ('Milei and Bullrich', '734'),
                        ('Lula and Alckmin', '659'),
                        ('Pope Leo XIV and Villarruel', '608'),
                        ('The Bolsonaro family', '579'),
                        ('Kicillof, Máximo Kirchner and Buenos Aires province', '406'),
                    ]),
                    ('list', [
                        ('Overall tone:', '22.5% negative, 69.4% neutral and 8.1% positive, classified by the model across all 4,216 items.'),
                        ('Spikes:', 'on November 4 volume was 3.2 standard deviations above the period average.'),
                        ('Qualitative reading:', 'the model separates topics, but the same phrase can be support, irony or rejection. Findings are checked by reading examples before drawing conclusions.'),
                    ]),
                ]),
                ('Privacy', 'Publish aggregates, never people.', [
                    ('list', [
                        ('Texts stay out of the repository:', 'posts and comments live in a temporary workflow cache; only percentages and counts reach the repository.'),
                        ('Pseudonymized authors:', 'accounts are replaced with hashed identifiers before analysis.'),
                        ('Legitimate sources:', 'only public APIs and open data, with no access to private information.'),
                        ('Traceability:', 'every indicator keeps the link to the public source behind it so it can be verified.'),
                    ]),
                    ('callout', 'What it is for:', 'spotting growing topics earlier, comparing how different politicians are discussed and giving a communications team verifiable context for its decisions.'),
                ]),
                ('Related', 'Keep reading.', [
                    ('sources', [('mapa-politico-multidimensional-en.html', 'A multidimensional political map', 'Read'), ('datos-a-estrategia-politica-en.html', 'From data to political strategy', 'Read'), ('consultora-en.html', 'Public opinion pulse', 'Read')]),
                ]),
            ],
        },
    },
    {
        'slug': 'mapa-politico-multidimensional',
        'cover': 'assets/catalog-previews/mapa-politico-multidimensional.png',
        'categories': ['articles', 'research'],
        'tools': ['python', 'pandas', 'numpy', 'scipy', 'scikit-learn', 'plotly', 'google-sheets', 'github', 'javascript'],
        'es': {
            'title': 'Un mapa político multidimensional con 977 respuestas',
            'kicker': 'Política · Encuestas · Estadística',
            'deck': 'Una prueba de concepto que ubica a cada persona en tres ejes (economía, sociedad e instituciones) y compara cómo se definen, qué responden y con qué dirigentes se identifican.',
            'keywords': ['mapa político', 'brújula política', 'encuesta', 'opinión pública', 'identidad política', 'política argentina', 'peronismo', 'liberalismo',
                         'libertarismo', 'análisis multivariado', 'PCA', 'análisis de componentes principales', 'V de Cramér', 'dispersión intragrupo',
                         'estadística', 'visualización de datos', 'Python', 'pandas', 'NumPy', 'SciPy', 'scikit-learn', 'Plotly', 'Google Sheets',
                         'GitHub Actions', 'JavaScript'],
            'sections': [
                ('Pregunta', 'Cómo se define una persona no siempre coincide con lo que responde.', [
                    ('p', 'Las etiquetas políticas resumen mucho, pero esconden diferencias. Armé una prueba de concepto para estudiar tres cosas que no necesariamente coinciden: la identidad que cada persona declara, las posiciones que expresa frente a preguntas concretas y los dirigentes con los que se identifica.'),
                    ('facts', [('977', 'respuestas analizadas'), ('757', 'combinaciones de respuestas distintas'), ('32', 'visualizaciones interactivas'), ('13', 'identidades políticas comparadas')]),
                ]),
                ('Método', 'De un formulario a un espacio de tres ejes.', [
                    ('flow', [
                        ('Recolectar', 'Las respuestas llegan a Google Sheets; un flujo de GitHub Actions las descarga cada hora como CSV.'),
                        ('Puntuar', 'Una clave auditada traduce cada opción en una posición en economía, sociedad y política institucional.'),
                        ('Analizar', 'Python con pandas, SciPy y scikit-learn calcula asociaciones, componentes principales y dispersión por grupo, en un entorno aislado sin conexión a internet.'),
                        ('Publicar', 'Plotly y JavaScript dibujan las figuras; solo se publican agregados y coordenadas sin identificadores personales.'),
                    ]),
                ]),
                ('Hallazgos', 'La forma de cada grupo dice tanto como su centro.', [
                    ('p', 'Además de dónde se ubica cada identidad en promedio, mido cuánto se dispersan sus integrantes. Una nube compacta indica coincidencia en las dimensiones medidas; una nube amplia reúne posiciones diversas bajo la misma etiqueta. Eso describe la distribución y no implica mayor apertura o rigidez.'),
                    ('table', 'Dispersión de posiciones dentro de cada identidad declarada (distancia media al centro del grupo)', ['Identidad', 'Personas', 'Dispersión'], [
                        ('Socialdemocracia', '57', '11,0'),
                        ('Centro', '42', '13,7'),
                        ('Peronismo', '159', '17,1'),
                        ('Liberalismo', '154', '22,2'),
                        ('Libertarismo', '103', '25,1'),
                        ('Izquierda / socialismo', '83', '25,1'),
                        ('Derecha / centroderecha', '129', '31,0'),
                        ('Sin declaración', '53', '47,0'),
                    ]),
                    ('list', [
                        ('Quienes no declaran identidad', 'son el grupo más disperso: no forman un bloque, y la falta de etiqueta reúne fenómenos distintos que conviene no mezclar.'),
                        ('La derecha declarada', 'es más heterogénea que el peronismo o la socialdemocracia en las dimensiones medidas.'),
                        ('Las preguntas que más separan', 'identidades son las de modos de producción, mercado y bancos (V de Cramér corregida entre 0,62 y 0,74).'),
                        ('El medio por el que se informa cada persona', 'se asocia fuertemente con el problema que considera principal (V = 0,52).'),
                    ]),
                ]),
                ('Límites', 'Qué no dice este análisis.', [
                    ('list', [
                        ('No es representativo:', 'es una muestra de conveniencia sin ponderación poblacional; describe esta base, no al país.'),
                        ('Asociación no es causa:', 'las relaciones se informan con su tamaño de efecto y con corrección por comparaciones múltiples.'),
                        ('Celdas chicas:', 'algunas tablas cruzadas tienen frecuencias esperadas bajas, por lo que esos valores se leen con cautela.'),
                        ('Privacidad:', 'no se publica ninguna tabla que vincule datos sociodemográficos con respuestas políticas individuales.'),
                    ]),
                ]),
                ('Relacionados', 'Seguir leyendo.', [
                    ('sources', [('https://mynosiii.github.io/ProjectMilei2/', 'Mapa político interactivo', 'Abrir las 32 visualizaciones ↗'), ('escucha-social-politica-osint-es.html', 'Escucha social política con fuentes abiertas', 'Leer'), ('datos-a-estrategia-politica-es.html', 'De los datos a la estrategia política', 'Leer'), ('consultora-es.html', 'Pulso de la opinión pública', 'Leer')]),
                ]),
            ],
        },
        'en': {
            'title': 'A multidimensional political map from 977 survey answers',
            'kicker': 'Politics · Surveys · Statistics',
            'deck': 'A proof of concept that places each respondent on three axes (economy, society and institutions) and compares how people label themselves, what they answer and which leaders they identify with.',
            'keywords': ['political map', 'political compass', 'survey', 'public opinion', 'political identity', 'Argentine politics', 'Peronism', 'liberalism',
                         'libertarianism', 'multivariate analysis', 'PCA', 'principal component analysis', "Cramér's V", 'within-group dispersion',
                         'statistics', 'data visualization', 'Python', 'pandas', 'NumPy', 'SciPy', 'scikit-learn', 'Plotly', 'Google Sheets',
                         'GitHub Actions', 'JavaScript'],
            'sections': [
                ('Question', 'How people label themselves does not always match what they answer.', [
                    ('p', 'Political labels summarize a lot but hide differences. I built a proof of concept to study three things that do not necessarily line up: the identity each person declares, the positions they take on concrete questions and the leaders they identify with.'),
                    ('facts', [('977', 'responses analyzed'), ('757', 'distinct answer patterns'), ('32', 'interactive charts'), ('13', 'political identities compared')]),
                ]),
                ('Method', 'From a form to a three-axis space.', [
                    ('flow', [
                        ('Collect', 'Responses land in Google Sheets; a GitHub Actions workflow downloads them hourly as CSV.'),
                        ('Score', 'An audited key maps each option to a position on economy, society and institutional politics.'),
                        ('Analyze', 'Python with pandas, SciPy and scikit-learn computes associations, principal components and per-group dispersion in an isolated environment with no network access.'),
                        ('Publish', 'Plotly and JavaScript draw the charts; only aggregates and coordinates without personal identifiers are published.'),
                    ]),
                ]),
                ('Findings', "A group's shape says as much as its center.", [
                    ('p', 'Besides where each identity sits on average, I measure how spread out its members are. A compact cloud shows agreement on the measured dimensions; a wide cloud gathers diverse positions under the same label. That describes the distribution and does not imply more openness or rigidity.'),
                    ('table', 'Spread of positions within each declared identity (mean distance to the group center)', ['Identity', 'People', 'Spread'], [
                        ('Social democracy', '57', '11.0'),
                        ('Center', '42', '13.7'),
                        ('Peronism', '159', '17.1'),
                        ('Liberalism', '154', '22.2'),
                        ('Libertarianism', '103', '25.1'),
                        ('Left / socialism', '83', '25.1'),
                        ('Right / center-right', '129', '31.0'),
                        ('No declared identity', '53', '47.0'),
                    ]),
                    ('list', [
                        ('People with no declared identity', 'are the most spread-out group: they do not form a bloc, and the missing label groups different phenomena that should not be merged.'),
                        ('The self-declared right', 'is more heterogeneous than Peronism or social democracy on the measured dimensions.'),
                        ('The questions that best separate', 'identities are about modes of production, markets and banks (bias-corrected Cramér’s V between 0.62 and 0.74).'),
                        ('The outlet people get their news from', 'is strongly associated with the problem they rank first (V = 0.52).'),
                    ]),
                ]),
                ('Limits', 'What this analysis does not say.', [
                    ('list', [
                        ('Not representative:', 'it is a convenience sample without population weighting; it describes this dataset, not the country.'),
                        ('Association is not causation:', 'relationships are reported with effect sizes and a correction for multiple comparisons.'),
                        ('Small cells:', 'some cross-tabs have low expected frequencies, so those values are read with caution.'),
                        ('Privacy:', 'no table linking demographics to individual political answers is published.'),
                    ]),
                ]),
                ('Related', 'Keep reading.', [
                    ('sources', [('https://mynosiii.github.io/ProjectMilei2/', 'Interactive political map', 'Open the 32 charts ↗'), ('escucha-social-politica-osint-en.html', 'Political social listening with open sources', 'Read'), ('datos-a-estrategia-politica-en.html', 'From data to political strategy', 'Read'), ('consultora-en.html', 'Public opinion pulse', 'Read')]),
                ]),
            ],
        },
    },
    {
        'slug': 'datos-a-estrategia-politica',
        'cover': 'assets/catalog-previews/datos-a-estrategia-politica.png',
        'categories': ['articles', 'research'],
        'tools': ['python', 'scikit-learn', 'networkx', 'pysentimiento', 'plotly', 'google-sheets', 'google-trends'],
        'es': {
            'title': 'De los datos a la estrategia política',
            'kicker': 'Política · Opinión · Inteligencia de datos',
            'deck': 'Por qué un tablero no alcanza: cómo combinar estadística, análisis del discurso y OSINT para convertir información pública en diagnósticos y decisiones.',
            'keywords': ['estrategia política', 'inteligencia política', 'OSINT', 'opinión pública', 'análisis del discurso', 'social listening', 'escucha social',
                         'machine learning', 'análisis de redes', 'clustering', 'análisis factorial', 'correlación de Spearman', 'encuestas', 'consultoría política',
                         'comunicación política', 'Python', 'scikit-learn', 'NetworkX', 'pysentimiento', 'Plotly', 'Google Sheets', 'Google Trends'],
            'sections': [
                ('Tesis', 'El cuello de botella ya no es acceder a los datos.', [
                    ('p', 'Recopilar, ordenar y conectar información que está dispersa es una ventaja. Pero entregar una base de datos o un tablero sin interpretación puede trasladarle un problema nuevo al cliente: ahora tiene más información y también necesita tiempo, herramientas y criterio para procesarla. El valor aparece cuando se puede jerarquizar y distinguir las señales relevantes dentro del ruido.'),
                    ('callout', 'La cadena completa:', 'formular buenas preguntas, reunir evidencia, encontrar relaciones, explicar sus límites y traducir los hallazgos en prioridades y cursos de acción.'),
                ]),
                ('Método', 'Cuantitativo y cualitativo, juntos.', [
                    ('p', 'Un algoritmo puede detectar una regularidad; una lectura cualitativa permite entender qué significa y en qué contexto se produce. Correlaciones de Spearman, análisis factorial o clustering ayudan a encontrar estructuras, pero contar menciones o clasificar comentarios automáticamente no alcanza para comprender una conversación: una misma expresión puede ser adhesión, ironía o rechazo.'),
                    ('cards', [
                        ('Mapas', 'Espacios políticos multidimensionales', 'Comparar identidad declarada, posiciones concretas y referentes elegidos, y estudiar la dispersión, las fronteras y las superposiciones entre grupos.'),
                        ('Redes', 'Qué respuestas y temas aparecen juntos', 'El análisis de redes muestra cómo se articulan las comunidades de conversación y qué temas conectan posiciones.'),
                        ('OSINT', 'Fuentes abiertas como método transversal', 'Conectar noticias, registros públicos, documentos y publicaciones con fuentes verificables, contexto y trazabilidad.'),
                        ('Exposición', 'Qué puede encontrar un tercero', 'Antecedentes y declaraciones que siguen circulando, suplantaciones e información desactualizada sobre una figura pública.'),
                    ]),
                ]),
                ('Predicción', 'Patrones no aparentes, con disciplina.', [
                    ('p', 'Me interesa especialmente buscar relaciones que no habríamos considerado y que emergen al analizar muchas variables juntas. Pero encontrar una asociación es el comienzo de la investigación, no el final.'),
                    ('list', [
                        ('Sesgos y confusión:', 'evaluar sesgos de selección y variables que explican ambas cosas a la vez.'),
                        ('Comparaciones múltiples:', 'con muchas pruebas, algunas relaciones aparecen por azar.'),
                        ('Validación fuera de muestra:', 'una explicación convincente formulada después de ver un patrón sigue siendo una hipótesis.'),
                        ('Escenarios, no profecías:', 'la predicción sirve para estimar probabilidades que después se puedan contrastar.'),
                    ]),
                ]),
                ('Producto', 'Medición continua de opinión pública.', [
                    ('p', 'Veo espacio en Argentina para un producto estable de medición que combine encuestas, conversación digital, fuentes abiertas y análisis cualitativo, con metodología transparente. Medir bien exige distinguir qué aporta cada fuente: las redes muestran discursos y circulación de temas; las encuestas necesitan diseño muestral y ponderación.'),
                    ('p', 'Una misma infraestructura de investigación puede sostener informes periódicos para organismos públicos, universidades, organizaciones sociales y empresas, y sumar estudios específicos o acompañamiento estratégico según cada caso.'),
                    ('callout', 'Ética:', 'trabajar con fuentes abiertas y datos obtenidos legítimamente. Que una información sea pública no elimina las obligaciones sobre su tratamiento.'),
                ]),
                ('Relacionados', 'Seguir leyendo.', [
                    ('sources', [('escucha-social-politica-osint-es.html', 'Escucha social política con fuentes abiertas', 'Leer'), ('mapa-politico-multidimensional-es.html', 'Un mapa político multidimensional', 'Leer'), ('consultora-es.html', 'Pulso de la opinión pública', 'Leer')]),
                ]),
            ],
        },
        'en': {
            'title': 'From data to political strategy',
            'kicker': 'Politics · Opinion · Data intelligence',
            'deck': 'Why a dashboard is not enough: how to combine statistics, discourse analysis and OSINT to turn public information into diagnoses and decisions.',
            'keywords': ['political strategy', 'political intelligence', 'OSINT', 'public opinion', 'discourse analysis', 'social listening',
                         'machine learning', 'network analysis', 'clustering', 'factor analysis', 'Spearman correlation', 'polling', 'political consulting',
                         'political communication', 'Python', 'scikit-learn', 'NetworkX', 'pysentimiento', 'Plotly', 'Google Sheets', 'Google Trends'],
            'sections': [
                ('Thesis', 'The bottleneck is no longer access to data.', [
                    ('p', 'Collecting, organizing and connecting scattered information is an advantage. But handing over a database or a dashboard without interpretation can give the client a new problem: more information, plus the time, tools and judgment needed to process it. The value appears when you can rank what matters and separate relevant signals from noise.'),
                    ('callout', 'The full chain:', 'ask good questions, gather evidence, find relationships, explain their limits and translate findings into priorities and courses of action.'),
                ]),
                ('Method', 'Quantitative and qualitative, together.', [
                    ('p', 'An algorithm can detect a regularity; a qualitative reading explains what it means and in what context it happens. Spearman correlations, factor analysis or clustering help find structure, but counting mentions or auto-classifying comments is not enough to understand a conversation: the same expression can be support, irony or rejection.'),
                    ('cards', [
                        ('Maps', 'Multidimensional political spaces', 'Compare declared identity, concrete positions and chosen leaders, and study the spread, borders and overlaps between groups.'),
                        ('Networks', 'Which answers and topics appear together', 'Network analysis shows how conversation communities are structured and which topics connect positions.'),
                        ('OSINT', 'Open sources as a cross-cutting method', 'Connect news, public records, documents and posts with verifiable sources, context and traceability.'),
                        ('Exposure', 'What a third party can find', 'Records and statements still circulating, impersonations and outdated information about a public figure.'),
                    ]),
                ]),
                ('Prediction', 'Non-obvious patterns, with discipline.', [
                    ('p', 'I am especially interested in relationships we would not have thought of, which emerge when many variables are analyzed together. But finding an association is where the research starts, not where it ends.'),
                    ('list', [
                        ('Bias and confounding:', 'check selection bias and variables that drive both sides at once.'),
                        ('Multiple comparisons:', 'with many tests, some relationships appear by chance.'),
                        ('Out-of-sample validation:', 'a convincing explanation written after seeing a pattern is still a hypothesis.'),
                        ('Scenarios, not prophecies:', 'prediction is useful for estimating probabilities that can be checked later.'),
                    ]),
                ]),
                ('Product', 'Continuous public opinion measurement.', [
                    ('p', 'I see room in Argentina for a stable measurement product that combines polls, digital conversation, open sources and qualitative analysis, with a transparent methodology. Measuring well means knowing what each source adds: social networks show discourse and topic circulation; polls need sample design and weighting.'),
                    ('p', 'One research infrastructure can support recurring reports for public agencies, universities, civil society and companies, and add specific studies or strategic support case by case.'),
                    ('callout', 'Ethics:', 'work with open sources and legitimately obtained data. Information being public does not remove the obligations around how it is handled.'),
                ]),
                ('Related', 'Keep reading.', [
                    ('sources', [('escucha-social-politica-osint-en.html', 'Political social listening with open sources', 'Read'), ('mapa-politico-multidimensional-en.html', 'A multidimensional political map', 'Read'), ('consultora-en.html', 'Public opinion pulse', 'Read')]),
                ]),
            ],
        },
    },
]
