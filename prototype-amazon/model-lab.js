// Interactive 3D modeling lab for the creative section, ported from the
// legacy creatives page (creatives-3d.js). The markup renders right away;
// three.js and the models load only when the lab scrolls into view, and the
// render loop runs only while the lab is on screen.
const VENDOR = '/vendor/three/';
const MODELS = '/creatives/3d/';

const copy = {
  es: {
    kicker: 'Experimento interactivo · 3D',
    title: 'Laboratorio de modelado 3D',
    intro: 'Deslizá la colección, tocá la caja animada para revelar cada objeto y arrastrá para inspeccionarlo desde todos los ángulos.',
    loading: 'Preparando',
    loadingLab: 'Cargando laboratorio 3D…',
    failed: 'No se pudo cargar el modelo.',
    noWebgl: 'Tu navegador no tiene WebGL disponible, así que el laboratorio 3D no puede mostrarse.',
    open: 'Hacé clic para abrir',
    openHint: 'y luego arrastrá para explorar',
    drag: 'Arrastrá para rotar · pellizcá o usá la rueda para ampliar',
    prev: 'Modelo anterior',
    next: 'Modelo siguiente',
    choose: 'Elegir un modelo 3D',
    show: 'Mostrar',
    notes: 'Notas del laboratorio',
    stage: 'Modelo 3D interactivo',
    keys: 'Usá las flechas para cambiar de modelo y Enter para abrir la caja.',
    statement: 'Trabajo con <strong>Blender</strong> y flujos guiados por código para producir objetos 3D a escala, desde conversión de formatos y modelado procedural hasta animaciones listas para el navegador.'
  },
  en: {
    kicker: 'Interactive experiment · 3D',
    title: '3D modeling lab',
    intro: 'Swipe through the collection, tap the animated box to reveal each object and drag to inspect it from every angle.',
    loading: 'Preparing',
    loadingLab: 'Loading 3D lab…',
    failed: 'This model could not be loaded.',
    noWebgl: 'WebGL is not available in this browser, so the 3D lab cannot be shown.',
    open: 'Click to open',
    openHint: 'then drag to explore',
    drag: 'Drag to rotate · pinch or scroll to zoom',
    prev: 'Previous model',
    next: 'Next model',
    choose: 'Choose a 3D model',
    show: 'Show',
    notes: 'Lab notes',
    stage: 'Interactive 3D model',
    keys: 'Use the arrow keys to change model and Enter to open the box.',
    statement: 'I work with <strong>Blender</strong> and code-driven workflows to produce 3D objects at scale, from format conversion and procedural modeling to browser-ready animations.'
  }
};

const items = [
  {
    file: 'Variety_of_Pills.glb',
    es: { title: 'Variedad de comprimidos', category: 'Estudio de material y composición', description: 'Una colección farmacéutica compacta preparada para una presentación fluida en tiempo real.', notes: 'Preparado en Blender como estudio de composición: organicé la jerarquía de objetos, ajusté los materiales de color y la rugosidad de superficie, y empaqueté la escena en un GLB eficiente para el navegador.', tech: ['Materiales en Blender', 'Composición', 'USDZ → GLB'] },
    en: { title: 'Variety of Pills', category: 'Material & composition study', description: 'A compact pharmaceutical collection prepared for fluid real-time presentation.', notes: 'Prepared in Blender as a composition study: I organized the object hierarchy, tuned the colored materials and surface roughness, then packed the scene into an efficient browser-ready GLB.', tech: ['Blender materials', 'Composition', 'USDZ → GLB'] }
  },
  {
    file: 'tablet-pill.glb',
    es: { title: 'Comprimido', category: 'Estudio de superficie dura', description: 'Un estudio limpio de un solo objeto con acabado de estudio suave y geometría inspeccionable.', notes: 'Este flujo en Blender se enfoca en una presentación limpia de superficie dura: normales corregidas, suavizado controlado, un material farmacéutico sutil y un origen normalizado para una animación predecible.', tech: ['Superficie dura', 'Normales', 'Pase de material'] },
    en: { title: 'Tablet Pill', category: 'Hard-surface study', description: 'A clean single-object study with a soft studio finish and inspectable geometry.', notes: 'This Blender workflow focuses on clean hard-surface presentation: corrected normals, controlled smoothing, a subtle pharmaceutical material and a normalized origin for predictable animation.', tech: ['Hard surface', 'Normals', 'Material pass'] }
  },
  {
    file: 'three-pill-boxes.glb',
    es: { title: 'Tres cajas de comprimidos', category: 'Visualización de packaging', description: 'Un set de packaging retail con arte integrado y presentación lista para producto.', notes: 'Construido como escena de packaging en Blender con mallas separadas, arte de etiqueta alineado por UV, texturas empaquetadas y una jerarquía limpia: lo que uso para convertir piezas planas de marca en visuales de producto con volumen.', tech: ['Mapeo UV', 'Empaquetado de texturas', 'Jerarquía de escena'] },
    en: { title: 'Three Pill Boxes', category: 'Packaging visualization', description: 'A retail packaging set with embedded artwork and a product-ready presentation.', notes: 'Built as a Blender packaging scene with separate box meshes, UV-aligned label artwork, packed textures and a clean hierarchy—skills I use to turn flat brand assets into dimensional product visuals.', tech: ['UV mapping', 'Texture packing', 'Scene hierarchy'] }
  },
  {
    file: 'wheelchair.glb',
    es: { title: 'Silla de ruedas', category: 'Preparación de un asset mecánico', description: 'Una forma mecánica compleja aligerada para poder inspeccionarla de forma interactiva.', notes: 'En Blender limpié y organicé un modelo mecánico de varias partes, conservé sus grupos de materiales, revisé las transformaciones y optimicé la estructura de la escena para una inspección fluida en tiempo real en la web.', tech: ['Limpieza de malla', 'Transformaciones', 'Optimización'] },
    en: { title: 'Wheelchair', category: 'Mechanical asset preparation', description: 'A complex mechanical form made lightweight enough for interactive inspection.', notes: 'In Blender I cleaned and organized a multi-part mechanical model, preserved its material groups, checked transforms and optimized the scene structure for smooth real-time inspection on the web.', tech: ['Mesh cleanup', 'Transforms', 'Optimization'] }
  },
  {
    file: 'spike_lug_nut_M14x1_5.glb',
    es: { title: 'Tuerca de rueda con púas', category: 'Modelado procedural', description: 'Un componente automotriz con medidas reales, modelado a partir de imágenes de referencia y restricciones de ingeniería.', notes: 'Modelada proceduralmente en Blender a 119 × 23 mm: seis splines terminadas, un asiento cónico de 60°, un collar escalonado y una rosca interna M14×1,5, generadas con un flujo reutilizable en Python.', tech: ['Blender Python', 'M14×1,5', 'Malla procedural'] },
    en: { title: 'Spike Lug Nut', category: 'Procedural modeling', description: 'A dimensioned automotive component modeled from reference imagery and engineering constraints.', notes: 'Modeled procedurally in Blender at 119 × 23 mm: six terminated splines, a 60° conical seat, stepped collar detail and an M14×1.5 internal thread, generated through a reusable Python workflow.', tech: ['Blender Python', 'M14×1.5', 'Procedural mesh'] }
  }
];

function escape(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function markup(t, first) {
  return `
  <div class="model-lab__heading">
    <div><p class="path-label">${t.kicker}</p><h2 id="model-lab-title">${t.title}</h2></div>
    <p>${t.intro}</p>
  </div>
  <div class="model-lab__shell">
    <div class="model-lab__stage" tabindex="0" role="group" aria-roledescription="${escape(t.stage)}" aria-label="${escape(first.title)}" aria-describedby="model-lab-keys" data-lab-stage>
      <canvas data-lab-canvas aria-hidden="true"></canvas>
      <div class="model-lab__status" role="status" aria-live="polite" data-lab-status><i></i><span>${t.loadingLab}</span></div>
      <button class="model-lab__open is-hidden" type="button" data-lab-open><span>${t.open}</span><small>${t.openHint}</small></button>
      <span class="model-lab__hint" data-lab-hint>${t.drag}</span>
      <span class="sr-only" id="model-lab-keys">${t.keys}</span>
    </div>
    <div class="model-lab__panel">
      <p class="model-lab__count"><span data-lab-index>01</span> / ${String(items.length).padStart(2, '0')}</p>
      <div class="model-lab__copy" aria-live="polite"><span data-lab-category>${escape(first.category)}</span><h3 data-lab-title>${escape(first.title)}</h3><p data-lab-description>${escape(first.description)}</p></div>
      <div class="model-lab__controls" role="group"><button type="button" aria-label="${t.prev}" data-lab-prev>←</button><div class="model-lab__progress"><i data-lab-progress></i></div><button type="button" aria-label="${t.next}" data-lab-next>→</button></div>
      <div class="model-lab__list" role="tablist" aria-label="${t.choose}" data-lab-list></div>
    </div>
  </div>
  <aside class="model-lab__notes" aria-live="polite">
    <div><span>${t.notes}</span><small data-lab-note-number>01 — ${String(items.length).padStart(2, '0')}</small></div>
    <p data-lab-notes>${escape(first.notes)}</p>
    <div class="model-lab__tech" data-lab-tech>${first.tech.map(tag => `<span>${escape(tag)}</span>`).join('')}</div>
  </aside>
  <p class="model-lab__statement">${t.statement}</p>`;
}

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch (error) {
    return false;
  }
}

export function mountModelLab(section, lang) {
  if (!section || section.dataset.labReady) return;
  section.dataset.labReady = 'true';
  const t = copy[lang] || copy.es;
  const text = item => item[lang] || item.es;
  section.innerHTML = markup(t, text(items[0]));

  const q = name => section.querySelector(`[data-lab-${name}]`);
  const stage = q('stage'), canvas = q('canvas'), status = q('status'), openButton = q('open'), hint = q('hint');
  const list = q('list');
  let index = 0;
  let select = () => {};

  function updateText() {
    const item = text(items[index]);
    const number = String(index + 1).padStart(2, '0');
    q('index').textContent = number;
    q('category').textContent = item.category;
    q('title').textContent = item.title;
    q('description').textContent = item.description;
    q('note-number').textContent = `${number} — ${String(items.length).padStart(2, '0')}`;
    q('notes').textContent = item.notes;
    q('tech').innerHTML = item.tech.map(tag => `<span>${escape(tag)}</span>`).join('');
    q('progress').style.transform = `scaleX(${index + 1})`;
    stage.setAttribute('aria-label', item.title);
    list.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-selected', i === index ? 'true' : 'false'));
  }

  items.forEach((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.title = text(item).title;
    button.setAttribute('aria-label', `${t.show} ${text(item).title}`);
    button.addEventListener('click', () => select(i));
    list.appendChild(button);
  });
  q('prev').addEventListener('click', () => select(index - 1));
  q('next').addEventListener('click', () => select(index + 1));
  updateText();

  if (!webglAvailable()) {
    status.lastElementChild.textContent = t.noWebgl;
    status.querySelector('i').hidden = true;
    return;
  }

  let started = false;
  let onScreen = false;
  let wake = () => {};
  const visibility = new IntersectionObserver(entries => {
    onScreen = entries.some(entry => entry.isIntersecting);
    if (onScreen && !started) {
      started = true;
      start().catch(() => { status.classList.remove('is-hidden'); status.lastElementChild.textContent = t.failed; });
    }
    if (onScreen) wake();
  }, { rootMargin: '200px 0px' });
  visibility.observe(section);

  async function start() {
    const [THREE, { GLTFLoader }, { OrbitControls }] = await Promise.all([
      import(VENDOR + 'three.module.min.js'),
      import(VENDOR + 'addons/loaders/GLTFLoader.js'),
      import(VENDOR + 'addons/controls/OrbitControls.js')
    ]);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    camera.position.set(4.4, 3, 5.4);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enabled = false;
    controls.minDistance = 3.4;
    controls.maxDistance = 8;
    controls.target.set(0, 0.65, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9dee3, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.4);
    key.position.set(4, 6, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd2a1, 1.6);
    rim.position.set(-5, 3, -4);
    scene.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshStandardMaterial({ color: 0xd5dbe0, roughness: 0.95, transparent: true, opacity: 0.55 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.78;
    scene.add(floor);

    const loader = new GLTFLoader();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const boxMaterials = [];
    let boxScene, mixer, action, mount, currentProduct, state = 'loading', queuedIndex = null, pointerStart = null;
    const setBoxOpacity = value => boxMaterials.forEach(material => { material.transparent = true; material.opacity = value; material.depthWrite = value > 0.35; });

    function normalize(root) {
      const bounds = new THREE.Box3().setFromObject(root);
      const size = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      const scale = 1.15 / Math.max(size.x, size.y, size.z);
      root.position.sub(center).multiplyScalar(scale);
      root.scale.setScalar(scale);
    }

    function loadProduct() {
      state = 'loading';
      canvas.style.cursor = 'wait';
      status.classList.remove('is-hidden');
      status.lastElementChild.textContent = `${t.loading} ${text(items[index]).title}…`;
      openButton.classList.add('is-hidden');
      hint.classList.remove('is-visible');
      controls.enabled = false;
      if (currentProduct) { mount.remove(currentProduct); currentProduct = null; }
      loader.load(MODELS + items[index].file, gltf => {
        currentProduct = gltf.scene;
        normalize(currentProduct);
        mount.add(currentProduct);
        action.stop(); action.reset(); action.paused = true;
        setBoxOpacity(1);
        boxScene.visible = true;
        state = 'boxed';
        canvas.style.cursor = 'pointer';
        status.classList.add('is-hidden');
        openButton.classList.remove('is-hidden');
        wake();
      }, undefined, () => { status.lastElementChild.textContent = t.failed; });
      updateText();
    }

    function openBox() {
      if (state !== 'boxed') return;
      state = 'opening';
      canvas.style.cursor = 'default';
      openButton.classList.add('is-hidden');
      action.reset();
      action.setLoop(THREE.LoopOnce, 1);
      action.clampWhenFinished = true;
      action.timeScale = 1;
      action.paused = false;
      action.play();
      wake();
    }

    select = next => {
      if (next === index || state === 'loading' || state === 'reboxing') return;
      queuedIndex = (next + items.length) % items.length;
      openButton.classList.add('is-hidden');
      hint.classList.remove('is-visible');
      controls.enabled = false;
      if (state === 'boxed') { index = queuedIndex; queuedIndex = null; loadProduct(); return; }
      state = 'reboxing';
      boxScene.visible = true;
      setBoxOpacity(1);
      action.paused = false;
      action.timeScale = -1;
      if (action.time <= 0.01) action.time = action.getClip().duration;
      action.play();
      wake();
    };

    function resize() {
      const bounds = stage.getBoundingClientRect();
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
      wake();
    }
    new ResizeObserver(resize).observe(stage);
    resize();

    openButton.addEventListener('click', openBox);
    stage.addEventListener('pointerdown', event => { pointerStart = { x: event.clientX, y: event.clientY }; });
    stage.addEventListener('pointerup', event => {
      if (!pointerStart) return;
      const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
      const moved = Math.hypot(dx, dy);
      pointerStart = null;
      if (state !== 'revealed' && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25) { select(index + (dx < 0 ? 1 : -1)); return; }
      if (state === 'boxed' && moved < 8 && boxScene) {
        const bounds = canvas.getBoundingClientRect();
        pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        if (raycaster.intersectObject(boxScene, true).some(hit => hit.object.visible)) openBox();
      }
    });
    stage.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); select(index + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1); }
      if ((event.key === 'Enter' || event.key === ' ') && state === 'boxed') { event.preventDefault(); openBox(); }
    });
    controls.addEventListener('change', () => wake());

    loader.load(MODELS + 'amazon_box_product_reveal.glb', gltf => {
      boxScene = gltf.scene;
      scene.add(boxScene);
      boxScene.rotation.y = -0.22;
      mount = boxScene.getObjectByName('PRODUCT_ROOT');
      const demoNode = boxScene.getObjectByName('PRODUCT_NORMALIZE');
      const demoProduct = demoNode ? [demoNode] : [];
      demoProduct.forEach(object => { object.visible = false; });
      boxScene.traverse(object => {
        if (object.isMesh && !demoProduct.some(demo => demo === object || demo.getObjectById(object.id))) {
          object.material = Array.isArray(object.material) ? object.material.map(material => material.clone()) : object.material.clone();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => boxMaterials.push(material));
        }
      });
      mixer = new THREE.AnimationMixer(boxScene);
      action = mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, 'BoxReveal') || gltf.animations[0]);
      mixer.addEventListener('finished', () => {
        if (state === 'opening') {
          state = 'revealed';
          canvas.style.cursor = 'grab';
          if (currentProduct) controls.target.copy(new THREE.Box3().setFromObject(currentProduct).getCenter(new THREE.Vector3()));
          controls.enabled = true;
          controls.update();
          hint.classList.add('is-visible');
        } else if (state === 'reboxing') {
          index = queuedIndex;
          queuedIndex = null;
          loadProduct();
        }
      });
      loadProduct();
    }, undefined, () => { status.lastElementChild.textContent = t.failed; });

    // Render only while the lab is visible; idle frames stop entirely when
    // nothing moves (reduced motion turns off the ambient spin).
    let last = performance.now();
    let frame = 0;
    function animating() {
      return state === 'opening' || state === 'reboxing' || (!reducedMotion && (state === 'boxed' || state === 'revealed'));
    }
    function render(now) {
      frame = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (mixer) mixer.update(dt);
      if (!reducedMotion && boxScene && state === 'boxed') { boxScene.rotation.y += dt * 0.32; boxScene.position.y = Math.sin(now * 0.0017) * 0.035; }
      if (action && state === 'opening') {
        const duration = action.getClip().duration;
        if (action.time > duration * 0.72) setBoxOpacity(Math.max(0, 1 - (action.time - duration * 0.72) / (duration * 0.25)));
      }
      if (!reducedMotion && state === 'revealed' && currentProduct) currentProduct.rotation.y += dt * 0.12;
      const damping = controls.update();
      renderer.render(scene, camera);
      if (onScreen && !document.hidden && (animating() || damping)) frame = requestAnimationFrame(render);
    }
    wake = () => {
      if (!frame && onScreen && !document.hidden) { last = performance.now(); frame = requestAnimationFrame(render); }
    };
    document.addEventListener('visibilitychange', wake);
    wake();
  }
}
