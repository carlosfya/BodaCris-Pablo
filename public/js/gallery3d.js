/* ============================================
   3D SCROLL GALLERY - Pablo & Cris Wedding
   Three.js Implementation - Scroll-based
============================================= */

/* ============================================
   🎛️ CONFIGURACIÓN - MODIFICA ESTOS VALORES
============================================= */
const GALLERY_CONFIG = {
  
  // === IMÁGENES ===
  images: [
    { src: 'images/image1.png', alt: 'Pablo y Cris - Momento 1' },
    { src: 'images/image2.png', alt: 'Pablo y Cris - Momento 2' },
    { src: 'images/image3.png', alt: 'Pablo y Cris - Momento 3' },
    { src: 'images/image4.png', alt: 'Pablo y Cris - Momento 4' },
    { src: 'images/image5.png', alt: 'Pablo y Cris - Momento 5' }
  ],
  
  // === SCROLL Y ESPACIADO ===
  scrollPerImage: 0.5,         // Altura de scroll por imagen
  extraScrollPadding: 0.4,     // Scroll extra al final
  
  // === POSICIONAMIENTO 3D ===
  imageSpacing: 3.5,           // Distancia Z entre imágenes
  zStart: -8,                  // Distancia Z inicial
  zEnd: 3,                     // Distancia Z final
  
  // === VISIBILIDAD DE IMÁGENES ===
  visibilityOverlap: 2.2,      // Cuántas imágenes se ven a la vez
  fadeInPoint: 0.08,           // Punto de fade in
  fadeOutPoint: 0.85,          // Punto de fade out
  
  // === ESCALA ===
  baseScale: 2.8,              // Tamaño base de las imágenes
  baseScaleMobile: 2.2,        // Tamaño base en móvil
  scaleGrowth: 0.25,           // Cuánto crece la imagen al acercarse
  minScaleMultiplier: 0.7,     // Escala mínima cuando está lejos
  
  // === MOVIMIENTO Y ROTACIÓN ===
  parallaxIntensity: 0.35,     // Intensidad del parallax con el mouse
  rotationIntensity: 0.08,     // Intensidad de rotación con el mouse
  floatAmplitude: 0.06,        // Amplitud del movimiento flotante
  floatSpeed: 0.4,             // Velocidad del movimiento flotante
  centerDrift: 0.5,            // Cuánto se acercan al centro al pasar
  
  // === SUAVIZADO ===
  scrollSmoothing: 0.12,       // Suavizado del scroll
  cameraSmoothing: 0.06,       // Suavizado del movimiento de cámara
  
  // === VISUAL ===
  borderRadius: 0.06,          // Radio de bordes redondeados (0-0.5)
  shadowIntensity: 0.4,        // Intensidad de la sombra
  vignetteIntensity: 0.3,      // Intensidad del viñeteado
  
  // === POSICIONES DESKTOP (izq/der alternadas) ===
  positions: [
    { x: -2.8, y: 0.2, rotY: 0.1 },
    { x: 2.8, y: -0.15, rotY: -0.1 },
    { x: -2.6, y: 0.05, rotY: 0.08 },
    { x: 2.6, y: 0.25, rotY: -0.08 },
    { x: -2.9, y: -0.2, rotY: 0.12 },
    { x: 2.7, y: 0.1, rotY: -0.1 }
  ],
  
  // === POSICIONES MÓVIL (más centradas) ===
  positionsMobile: [
    { x: -0.4, y: 0.15, rotY: 0.05 },
    { x: 0.4, y: -0.1, rotY: -0.05 },
    { x: -0.35, y: 0, rotY: 0.04 },
    { x: 0.35, y: 0.2, rotY: -0.04 },
    { x: -0.45, y: -0.15, rotY: 0.06 },
    { x: 0.4, y: 0.05, rotY: -0.05 }
  ]
};

/* ============================================
   CLASE PRINCIPAL
============================================= */

class ScrollGallery3D {
  constructor(container, images, config) {
    this.container = container;
    this.images = images;
    this.config = config;
    this.isMobile = window.innerWidth <= 768;
    this.isTouchDevice = 'ontouchstart' in window;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planes = [];
    this.textures = [];
    this.clock = new THREE.Clock();
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isInitialized = false;
    
    this.init();
  }
  
  async init() {
    if (!this.checkWebGL()) {
      this.showFallback();
      return;
    }
    
    await this.loadTextures();
    this.setupScene();
    this.createPlanes();
    this.setupEventListeners();
    this.calculateContainerHeight();
    this.animate();
    this.isInitialized = true;
  }
  
  checkWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }
  
  showFallback() {
    this.container.innerHTML = `
      <div class="gallery3d-fallback">
        ${this.images.map((img, i) => `
          <div class="gallery3d-fallback__item reveal-scale" style="transition-delay: ${i * 0.15}s">
            <img src="${img.src}" alt="${img.alt || 'Imagen ' + (i + 1)}" loading="lazy">
          </div>
        `).join('')}
      </div>
    `;
    this.container.style.height = 'auto';
    this.container.style.position = 'relative';
  }
  
  async loadTextures() {
    const loader = new THREE.TextureLoader();
    
    const loadTexture = (img) => {
      return new Promise((resolve, reject) => {
        loader.load(
          img.src,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            resolve(texture);
          },
          undefined,
          (error) => {
            console.warn('Error loading texture:', img.src);
            resolve(null);
          }
        );
      });
    };
    
    try {
      this.textures = await Promise.all(this.images.map(loadTexture));
      this.textures = this.textures.filter(t => t !== null);
    } catch (error) {
      console.error('Error loading textures:', error);
      this.showFallback();
    }
  }
  
  setupScene() {
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = window.innerHeight;
    
    // Scene
    this.scene = new THREE.Scene();
    
    // Camera - positioned to see planes coming from distance
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 5);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    
    // Canvas styling for fixed position
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100vh';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.renderer.domElement.style.zIndex = '1';
    
    this.container.appendChild(this.renderer.domElement);
    
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);
  }
  
  createShaderMaterial() {
    const { borderRadius, shadowIntensity, vignetteIntensity } = this.config;
    
    return new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        map: { value: null },
        opacity: { value: 1.0 },
        progress: { value: 0.0 },
        time: { value: 0.0 },
        borderRadius: { value: borderRadius },
        shadowIntensity: { value: shadowIntensity },
        vignetteIntensity: { value: vignetteIntensity },
        isMobile: { value: this.isMobile ? 1.0 : 0.0 }
      },
      vertexShader: `
        uniform float progress;
        uniform float time;
        uniform float isMobile;
        varying vec2 vUv;
        varying float vDepth;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Softer wave effect on mobile
          float waveMult = isMobile > 0.5 ? 0.5 : 1.0;
          float wave = sin(pos.x * 2.0 + time * 0.4) * 0.025 * waveMult;
          float wave2 = sin(pos.y * 1.8 + time * 0.3) * 0.02 * waveMult;
          pos.z += (wave + wave2) * (1.0 - progress * 0.5);
          
          // Slight perspective tilt for depth
          float tilt = (pos.y * 0.03) * (1.0 - progress);
          pos.z += tilt;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vDepth = -mvPosition.z * 0.1;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float opacity;
        uniform float progress;
        uniform float borderRadius;
        uniform float shadowIntensity;
        uniform float vignetteIntensity;
        uniform float time;
        varying vec2 vUv;
        varying float vDepth;
        
        // Smooth rounded rectangle SDF
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Rounded corners
          vec2 centered = uv - 0.5;
          float dist = roundedBoxSDF(centered, vec2(0.5 - borderRadius * 0.5), borderRadius);
          float mask = 1.0 - smoothstep(-0.01, 0.01, dist);
          
          if (mask < 0.01) discard;
          
          // Sample texture with subtle chromatic aberration near edges
          float chromatic = 0.002 * (1.0 - progress);
          vec4 color;
          color.r = texture2D(map, uv + vec2(chromatic, 0.0)).r;
          color.g = texture2D(map, uv).g;
          color.b = texture2D(map, uv - vec2(chromatic, 0.0)).b;
          color.a = texture2D(map, uv).a;
          
          // Edge shadow/glow
          float edgeDist = abs(dist);
          float edgeShadow = smoothstep(0.0, 0.08, edgeDist);
          float innerGlow = 1.0 - smoothstep(0.0, 0.15, edgeDist) * shadowIntensity * 0.3;
          
          // Elegant vignette - stronger at edges
          vec2 vignetteCenter = centered * 1.8;
          float vignette = 1.0 - dot(vignetteCenter, vignetteCenter) * vignetteIntensity;
          vignette = clamp(vignette, 0.7, 1.0);
          
          // Depth-based color grading
          float depthFade = clamp(1.0 - vDepth * 0.3, 0.8, 1.0);
          
          // Warm highlight for closer images
          vec3 warmTint = vec3(1.02, 1.0, 0.98);
          vec3 coolTint = vec3(0.98, 0.99, 1.02);
          vec3 tint = mix(coolTint, warmTint, progress);
          
          // Subtle saturation boost for foreground
          float saturation = 0.9 + progress * 0.15;
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          color.rgb = mix(vec3(gray), color.rgb, saturation);
          
          // Apply all effects
          color.rgb *= vignette * innerGlow * depthFade;
          color.rgb *= tint;
          
          // Soft edge for rounded corners
          float softEdge = smoothstep(-0.005, 0.005, -dist);
          
          gl_FragColor = vec4(color.rgb, color.a * opacity * mask * softEdge);
        }
      `
    });
  }
  
  createPlanes() {
    const totalImages = this.textures.length;
    const { imageSpacing, zStart } = this.config;
    
    // Select positions based on device
    const positions = this.isMobile ? this.config.positionsMobile : this.config.positions;
    const baseScale = this.isMobile ? this.config.baseScaleMobile : this.config.baseScale;
    
    for (let i = 0; i < totalImages; i++) {
      const texture = this.textures[i];
      if (!texture) continue;
      
      const material = this.createShaderMaterial();
      material.uniforms.map.value = texture;
      
      // Calculate aspect ratio - adjusted for mobile
      const aspect = texture.image ? texture.image.width / texture.image.height : 1;
      let scaleX, scaleY;
      
      if (this.isMobile) {
        // On mobile, make images larger relative to screen, max width constrained
        const maxWidth = 3.2;
        scaleX = Math.min(aspect > 1 ? baseScale : baseScale * aspect, maxWidth);
        scaleY = aspect > 1 ? baseScale / aspect : baseScale;
      } else {
        scaleX = aspect > 1 ? baseScale : baseScale * aspect;
        scaleY = aspect > 1 ? baseScale / aspect : baseScale;
      }
      
      const geometry = new THREE.PlaneGeometry(1, 1, 24, 24);
      const mesh = new THREE.Mesh(geometry, material);
      
      // Get position pattern (cycles through positions array)
      const posPattern = positions[i % positions.length];
      
      // Calculate Z position based on index - closer spacing on mobile
      const mobileSpacingMult = this.isMobile ? 0.85 : 1;
      const imageZStart = zStart - (i * imageSpacing * mobileSpacingMult);
      
      mesh.position.set(posPattern.x, posPattern.y, imageZStart);
      mesh.rotation.y = posPattern.rotY;
      mesh.scale.set(scaleX, scaleY, 1);
      
      this.planes.push({
        mesh,
        material,
        index: i,
        zStart: imageZStart,
        zEnd: this.config.zEnd,
        baseX: posPattern.x,
        baseY: posPattern.y,
        baseRotY: posPattern.rotY
      });
      
      this.scene.add(mesh);
    }
  }
  
  calculateContainerHeight() {
    const totalImages = this.textures.length;
    const { scrollPerImage, extraScrollPadding } = this.config;
    const scrollPerImagePx = window.innerHeight * scrollPerImage;
    const totalScrollHeight = totalImages * scrollPerImagePx + window.innerHeight * extraScrollPadding;
    
    this.container.style.height = `${totalScrollHeight}px`;
    this.totalScrollDistance = totalScrollHeight - window.innerHeight;
  }
  
  setupEventListeners() {
    // Scroll
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    
    // Mouse for subtle parallax (desktop only)
    if (!this.isTouchDevice) {
      window.addEventListener('mousemove', (e) => {
        this.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      });
    } else {
      // On touch devices, use device orientation if available
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
          if (e.gamma !== null && e.beta !== null) {
            this.mouseX = Math.max(-1, Math.min(1, e.gamma / 30));
            this.mouseY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
          }
        }, { passive: true });
      }
    }
    
    // Resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.isMobile = window.innerWidth <= 768;
        this.onResize();
      }, 100);
    });
    
    // Initial scroll position
    this.onScroll();
  }
  
  onScroll() {
    const containerRect = this.container.getBoundingClientRect();
    const containerTop = containerRect.top + window.scrollY;
    const scrollY = window.scrollY;
    
    // Calculate progress through the gallery section
    const startScroll = containerTop - window.innerHeight * 0.5;
    const endScroll = containerTop + this.totalScrollDistance;
    
    if (scrollY < startScroll) {
      this.targetScrollProgress = 0;
    } else if (scrollY > endScroll) {
      this.targetScrollProgress = 1;
    } else {
      this.targetScrollProgress = (scrollY - startScroll) / (endScroll - startScroll);
    }
    
    // Check if gallery is in view
    const inView = scrollY >= containerTop - window.innerHeight && 
                   scrollY <= containerTop + this.totalScrollDistance + window.innerHeight;
    
    if (this.renderer) {
      this.renderer.domElement.style.opacity = inView ? '1' : '0';
    }
  }
  
  onResize() {
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = window.innerHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.calculateContainerHeight();
  }
  
  updatePlanes(time) {
    const { 
      parallaxIntensity, 
      rotationIntensity, 
      visibilityOverlap,
      fadeInPoint,
      fadeOutPoint,
      scaleGrowth,
      minScaleMultiplier,
      floatAmplitude,
      floatSpeed,
      centerDrift,
      scrollSmoothing,
      cameraSmoothing
    } = this.config;
    
    // Reduced effects on mobile for performance and cleaner look
    const mobileMult = this.isMobile ? 0.5 : 1;
    
    // Smooth scroll interpolation
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * scrollSmoothing;
    
    const totalImages = this.planes.length;
    
    this.planes.forEach((plane, i) => {
      const { mesh, material, zStart, zEnd, baseX, baseY, baseRotY } = plane;
      
      // Calculate individual image progress with configurable overlap
      const imageProgressStart = i / (totalImages + visibilityOverlap - 1);
      const imageProgressEnd = (i + visibilityOverlap) / (totalImages + visibilityOverlap - 1);
      
      let localProgress = 0;
      if (this.scrollProgress <= imageProgressStart) {
        localProgress = 0;
      } else if (this.scrollProgress >= imageProgressEnd) {
        localProgress = 1;
      } else {
        localProgress = (this.scrollProgress - imageProgressStart) / (imageProgressEnd - imageProgressStart);
      }
      
      // Easing function for smooth movement
      const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
      const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const easedProgress = easeOutCubic(localProgress);
      
      // Z position - image travels from far to past camera
      const z = zStart + (zEnd - zStart) * easedProgress;
      mesh.position.z = z;
      
      // X position - drift towards center as image approaches (less on mobile)
      const xDrift = baseX * (1 - easedProgress * centerDrift * (this.isMobile ? 0.7 : 1));
      const mouseOffsetX = this.mouseX * parallaxIntensity * mobileMult * (1 - easedProgress * 0.5);
      mesh.position.x = xDrift + mouseOffsetX;
      
      // Y position - subtle float + mouse parallax
      const yFloat = Math.sin(time * floatSpeed + i * 0.8) * floatAmplitude * (1 - easedProgress * 0.5);
      const mouseOffsetY = -this.mouseY * parallaxIntensity * 0.4 * mobileMult * (1 - easedProgress * 0.5);
      mesh.position.y = baseY + yFloat + mouseOffsetY;
      
      // Rotation - straightens as it approaches (minimal on mobile)
      const rotY = baseRotY * (1 - easedProgress * 0.85) * (this.isMobile ? 0.6 : 1);
      const rotX = -this.mouseY * rotationIntensity * mobileMult * (1 - easedProgress * 0.5);
      mesh.rotation.y = rotY;
      mesh.rotation.x = rotX * 0.3;
      
      // Opacity - smooth fade in and out
      let opacity = 1;
      if (localProgress < fadeInPoint) {
        opacity = easeInOutQuad(localProgress / fadeInPoint);
      } else if (localProgress > fadeOutPoint) {
        opacity = easeInOutQuad((1 - localProgress) / (1 - fadeOutPoint));
      }
      
      // Scale - grow as approaches with spring effect
      const springProgress = Math.sin(easedProgress * Math.PI * 0.5);
      const scaleMultiplier = minScaleMultiplier + springProgress * scaleGrowth;
      const baseScaleX = mesh.userData.baseScaleX || mesh.scale.x;
      const baseScaleY = mesh.userData.baseScaleY || mesh.scale.y;
      if (!mesh.userData.baseScaleX) {
        mesh.userData.baseScaleX = mesh.scale.x;
        mesh.userData.baseScaleY = mesh.scale.y;
      }
      mesh.scale.x = baseScaleX * scaleMultiplier;
      mesh.scale.y = baseScaleY * scaleMultiplier;
      
      // Update material
      material.uniforms.opacity.value = Math.max(0, Math.min(1, opacity));
      material.uniforms.progress.value = easedProgress;
      material.uniforms.time.value = time;
    });
    
    // Camera subtle movement based on mouse (reduced on mobile)
    const camMult = this.isMobile ? 0.3 : 1;
    this.camera.position.x += (this.mouseX * 0.25 * camMult - this.camera.position.x) * cameraSmoothing;
    this.camera.position.y += (-this.mouseY * 0.15 * camMult - this.camera.position.y) * cameraSmoothing;
  }
  
  animate() {
    if (!this.renderer) return;
    
    requestAnimationFrame(() => this.animate());
    
    const time = this.clock.getElapsedTime();
    
    this.updatePlanes(time);
    this.renderer.render(this.scene, this.camera);
  }
  
  destroy() {
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    this.planes.forEach(plane => {
      plane.mesh.geometry?.dispose();
      plane.material?.dispose();
    });
    this.textures.forEach(texture => texture?.dispose());
  }
}

// Initialize gallery when DOM is ready
function initGallery3D() {
  const container = document.getElementById('gallery3d-container');
  if (!container) return;
  
  new ScrollGallery3D(container, GALLERY_CONFIG.images, GALLERY_CONFIG);
}

// Export for use
window.initGallery3D = initGallery3D;
