"use client";

import { useEffect, useRef } from "react";

// Script list in sequence to ensure proper globals (window.THREE) exist before dependent libraries load
const SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/three@0.124.0/build/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/postprocessing/EffectComposer.js",
  "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/postprocessing/ShaderPass.js",
  "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/postprocessing/RenderPass.js",
  "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/shaders/CopyShader.js",
  "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/shaders/LuminosityHighPassShader.js",
  "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/shaders/FXAAShader.js",
  "https://cdn.jsdelivr.net/npm/three@0.124.0/examples/js/postprocessing/UnrealBloomPass.js",
  "https://cdn.jsdelivr.net/npm/three.meshline@1.3.0/src/THREE.MeshLine.js",
  "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
  "https://cdn.jsdelivr.net/npm/noisejs@2.1.0/index.js",
];

// Helper to dynamically load a script and resolve when loaded
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // If script is already in the document, resolve immediately
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false; // load synchronously in order
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Shaders as string templates
const SHADER_PASSTHROUGH_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;

const SHADER_PASSTHROUGH_FRAGMENT = `
  uniform sampler2D tDiffuse;
  varying vec2 vUv;
  void main() {
    gl_FragColor = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );
  }
`;

const SHADER_VOLUMETRIC_LIGHT_FRAGMENT = `
  varying vec2 vUv;
  uniform sampler2D tDiffuse;
  uniform vec2 lightPosition;
  uniform float exposure;
  uniform float decay;
  uniform float density;
  uniform float weight;
  uniform int samples;
  const int MAX_SAMPLES = 100;
  void main()
  {
    vec2 texCoord = vUv;
    vec2 deltaTextCoord = texCoord - lightPosition;
    deltaTextCoord *= 1.0 / float(samples) * density;
    vec4 color = texture2D(tDiffuse, texCoord);
    float illuminationDecay = 1.0;
    for(int i=0; i < MAX_SAMPLES; i++) {
      if(i == samples) {
        break;
      }
      texCoord -= deltaTextCoord;
      vec4 sampledColor = texture2D(tDiffuse, texCoord);
      sampledColor *= illuminationDecay * weight;
      color += sampledColor;
      illuminationDecay *= decay;
    }
    gl_FragColor = color * exposure;
  }
`;

const SHADER_ADDITIVE_FRAGMENT = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tAdd;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D( tDiffuse, vUv );
    vec4 add = texture2D( tAdd, vUv );
    gl_FragColor = color + add;
  }
`;

// Base64 map gif image
const MAP_IMAGE_DATA = "data:image/gif;base64,R0lGODdhHAAfAPIAAAAAAAD/AAAA//8AACZFySZFySZFySZFySH5BAEAAAQALAAAAAAcAB8AAAOwOLrc/iMIAISkNahL7cyKwIhj2JDmADArq7QLrKZ0itYk5+0SL3gdzeBGupWGR2IteeQAhD3oTxp8GIsnB4YyY7q24FUrOp2+VGFMF8VNibcObBhJZ4GjaHh0nkXOsQ1gaxAkb2liGx9bFmeHXC1GC4V5bUcyLnUMOk6MEYpAIJlXS0qifaOSiVAZZT5Pql6RNkt0gHGzCxJ4nq+enWRCsqmZt8SBtE2KYK5pnRDP0AkAOw==";

// Helper to dynamically load an image and return a Promise
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export default function ResilienceCore3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    let appInstance: any = null;

    // Load scripts in sequence
    const loadAll = async () => {
      try {
        for (const src of SCRIPTS) {
          await loadScript(src);
        }
        if (!isMounted) return;

        // Initialize local 3D application once scripts are ready
        await initApp();
      } catch (err) {
        console.error("Failed to load scripts for 3D Resilience Core:", err);
      }
    };

    loadAll();

    const initApp = async () => {
      const THREE = (window as any).THREE;
      const gsap = (window as any).gsap;
      const TweenMax = (window as any).TweenMax || gsap;
      const TimelineMax = (window as any).TimelineMax || gsap.timeline;
      const Linear = (window as any).Linear || { easeNone: "none" };
      const noise = (window as any).noise;
      const MeshLine = (window as any).MeshLine;
      const MeshLineMaterial = (window as any).MeshLineMaterial;

      const img = await loadImage(MAP_IMAGE_DATA);
      if (!isMounted) return;

      const CUBE_SIZE = 10;
      const MAP_WIDTH = 28;
      const MAP_HEIGHT = 31;

      // Directions
      const NONE = 0;
      const UP = 1;
      const RIGHT = 2;
      const DOWN = 3;
      const LEFT = 4;

      // Map Items
      const MAP_EMPTY = 1;
      const MAP_WALL = 2;
      const MAP_JUNCTION = 3;
      const MAP_DIRECTION = 4;

      const MAP_PARSE_COLORS: Record<string, number> = {
        "0,0,0": MAP_EMPTY,
        "255,0,0": MAP_WALL,
        "0,255,0": MAP_JUNCTION,
        "0,0,255": MAP_DIRECTION,
      };

      class BoardMap {
        width = 0;
        height = 0;
        tiles: number[] = [];
        mapImageData: Uint8ClampedArray;

        constructor(imgElement: HTMLImageElement) {
          this.mapImageData = this.getImageData(imgElement);
          this.parseMap();
        }

        getImageData(imgElement: HTMLImageElement): Uint8ClampedArray {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return new Uint8ClampedArray();
          
          // Image dimensions are 28x31 based on constants
          const w = MAP_WIDTH;
          const h = MAP_HEIGHT;
          canvas.width = w;
          canvas.height = h;
          
          ctx.drawImage(imgElement, 0, 0);
          this.width = w;
          this.height = h;
          
          try {
            return ctx.getImageData(0, 0, w, h).data;
          } catch {
            return new Uint8ClampedArray(w * h * 4);
          }
        }

        getMapPixelRGB(x: number, y: number) {
          const idx = (x + this.width * y) * 4;
          return [
            Math.round(this.mapImageData[idx + 0] / 255) * 255,
            Math.round(this.mapImageData[idx + 1] / 255) * 255,
            Math.round(this.mapImageData[idx + 2] / 255) * 255,
          ];
        }

        stepToDirection(x: number, y: number, direction: number) {
          let xTo = x;
          let yTo = y;
          switch (direction) {
            case UP:    yTo -= 1; break;
            case RIGHT: xTo += 1; break;
            case DOWN:  yTo += 1; break;
            case LEFT:  xTo -= 1; break;
          }
          return [xTo, yTo];
        }

        getTileAt(x: number, y: number, direction = NONE) {
          const [xTo, yTo] = this.stepToDirection(x, y, direction);
          if (xTo >= 0 && xTo < this.width && yTo >= 0 && yTo < this.height) {
            const idx = yTo * this.width + xTo;
            return this.tiles[idx];
          }
          return undefined;
        }

        getNearestNeighborFrom(x: number, y: number, direction: number, type: number): [number, number] | undefined {
          const next = this.getTileAt(x, y, direction);
          const [xTo, yTo] = this.stepToDirection(x, y, direction);
          if (next === type) {
            return [xTo, yTo];
          } else if (next !== undefined) {
            return this.getNearestNeighborFrom(xTo, yTo, direction, type);
          }
          return undefined;
        }

        getIndexFromCoords(x: number, y: number) {
          return y * this.width + x;
        }

        getCoordsFromIndex(idx: number): [number, number] {
          const x = idx % this.width;
          const y = Math.floor(idx / this.width);
          return [x, y];
        }

        parseMap() {
          // Fallback static map structure if canvas image data is fully transparent/empty
          let hasData = false;
          if (this.mapImageData) {
            for (let i = 0; i < this.mapImageData.length; i += 4) {
              if (this.mapImageData[i + 3] > 0) {
                hasData = true;
                break;
              }
            }
          }

          if (hasData) {
            for (let y = 0; y < this.height; y++) {
              for (let x = 0; x < this.width; x++) {
                const [r, g, b] = this.getMapPixelRGB(x, y);
                const tile = MAP_PARSE_COLORS[`${r},${g},${b}`] || MAP_EMPTY;
                this.tiles.push(tile);
              }
            }
          } else {
            // Generate procedurally simplified maze layout to represent financial resilience routes
            for (let y = 0; y < MAP_HEIGHT; y++) {
              for (let x = 0; x < MAP_WIDTH; x++) {
                // outer border is wall
                if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                  this.tiles.push(MAP_WALL);
                } else if (x % 4 === 0 && y % 4 === 0) {
                  this.tiles.push(MAP_JUNCTION);
                } else if (x % 4 === 0 || y % 4 === 0) {
                  this.tiles.push(MAP_DIRECTION);
                } else {
                  this.tiles.push(MAP_EMPTY);
                }
              }
            }
          }
        }
      }

      class MapBoundariesMesh {
        geometry: any;
        boardMap: BoardMap;

        constructor(boardMap: BoardMap) {
          this.boardMap = boardMap;
          this.geometry = new THREE.Geometry();
          this.generateGeometry();
        }

        generateGeometry() {
          for (let x = 0; x < MAP_WIDTH; x++) {
            for (let y = 0; y < MAP_HEIGHT; y++) {
              const idx = y * MAP_WIDTH + x;
              if (this.boardMap.tiles[idx] === MAP_WALL) {
                this.putBlock(x, y);
              }
            }
          }
        }

        putBlock(x: number, y: number) {
          const boxWidth = CUBE_SIZE / MAP_WIDTH;
          const boxHeight = CUBE_SIZE / MAP_HEIGHT;
          const halfSize = CUBE_SIZE / 2;
          const boxElevation = 0.22;
          const geo = new THREE.BoxGeometry(boxWidth, boxElevation, boxHeight);
          const tX = -halfSize + x * boxWidth + boxWidth / 2;
          const tY = -halfSize + y * boxHeight + boxHeight / 2;
          geo.translate(tX, boxElevation / 2, tY);
          const mesh = new THREE.Mesh(geo);
          this.geometry.merge(mesh.geometry, mesh.matrix);
        }
      }

      class Particles {
        clusters: any[] = [];
        texture: any;

        constructor() {
          this.initParticles();
        }

        initParticles() {
          this.texture = new THREE.TextureLoader().load(
            "https://s3-us-west-2.amazonaws.com/s.cdpn.io/204379/particle.png"
          );
          for (let i = 0; i < 5; i++) {
            const cluster = {
              scale: i + 2,
              speed: THREE.Math.randFloat(0.3, 1.2),
              points: this.getCluster(40), // optimized count
            };
            this.clusters.push(cluster);
          }
        }

        getCluster(count: number) {
          const geo = new THREE.Geometry();
          const mat = new THREE.PointsMaterial({
            color: 0x00f5d4, // Aurix Soft Teal particles
            size: THREE.Math.randFloat(0.08, 0.2),
            map: this.texture,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });

          for (let i = 0; i < count; i++) {
            const p = new THREE.Vector3();
            p.x = THREE.Math.randFloatSpread(4);
            p.y = THREE.Math.randFloatSpread(4);
            p.z = THREE.Math.randFloatSpread(4);
            geo.vertices.push(p);
          }
          return new THREE.Points(geo, mat);
        }

        update(delta: number) {
          for (let i = 0; i < this.clusters.length; i++) {
            const cluster = this.clusters[i];
            if (cluster.scale > 10) {
              cluster.scale = 2;
              cluster.points.material.opacity = 0.8;
            }
            cluster.scale += 0.3 * delta * cluster.speed;
            cluster.points.scale.set(cluster.scale, cluster.scale, cluster.scale);
            cluster.points.rotation.y += 0.002 * cluster.speed;

            if (cluster.scale > 6) {
              const opacity = THREE.Math.lerp(0.8, 0, 1 - (10 - cluster.scale) / 4);
              cluster.points.material.opacity = Math.max(0, opacity);
            }
          }
        }

        dispose() {
          this.clusters.forEach(c => {
            if (c.points.geometry) c.points.geometry.dispose();
            if (c.points.material) c.points.material.dispose();
          });
          if (this.texture) this.texture.dispose();
        }
      }

      class Trails {
        group: any;
        position: any;
        map: BoardMap;
        maxPositions = 20; // optimized points count
        geometry: any;
        line: any;
        mesh: any;
        light: any;
        timeline: any;
        junctionTiles: number[] = [];

        constructor(map: BoardMap) {
          this.group = new THREE.Object3D();
          this.position = new THREE.Vector3();
          this.map = map;
          this.init();
          this.spawn();
        }

        init() {
          this.geometry = new THREE.Geometry();
          const mat = new MeshLineMaterial({
            color: new THREE.Color(0xdfb443), // Aurix Gold trails
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
          });
          this.line = new MeshLine();
          this.mesh = new THREE.Mesh(this.line.geometry, mat);
          this.group.add(this.mesh);

          for (let i = 0; i < this.maxPositions; i++) {
            this.geometry.vertices.push(new THREE.Vector3());
          }
          this.map.tiles.forEach((t, idx) => {
            if (t === MAP_JUNCTION) {
              this.junctionTiles.push(idx);
            }
          });
          this.light = new THREE.PointLight(0x00f5d4, 1.2, 4); // soft teal light beam
          this.group.add(this.light);
        }

        spawn() {
          if (!isMounted) return;
          const { position, line } = this;
          const { vertices } = this.geometry;
          const wayPoints = this.getWayPoints();
          if (wayPoints.length === 0) return;

          vertices.forEach((v: any) => v.copy(wayPoints[0]));
          position.copy(wayPoints[0]);
          this.light.position.copy(wayPoints[0]);
          line.setGeometry(this.geometry, (p: number) => p * 0.35); // thin glowing thread
          this.startPath(wayPoints);
        }

        getTileDirections(x: number, y: number) {
          return [UP, RIGHT, DOWN, LEFT].filter(d => {
            const tile = this.map.getTileAt(x, y, d);
            return tile !== undefined && tile !== MAP_WALL;
          });
        }

        scaleTilePosition(position: any) {
          const tileScaleX = CUBE_SIZE / this.map.width;
          const tileScaleY = CUBE_SIZE / this.map.height;
          position.set(
            -CUBE_SIZE / 2 + (position.x + 0.5) * tileScaleX,
            -CUBE_SIZE / 2 + (position.y + 0.5) * tileScaleY,
            0
          );
          return position;
        }

        getWayPoints() {
          const jTiles = this.junctionTiles;
          if (jTiles.length === 0) return [];
          const startTile = jTiles[Math.floor(Math.random() * jTiles.length)];
          let [xCurrent, yCurrent] = this.map.getCoordsFromIndex(startTile);
          const visitedTiles: number[] = [];
          let insert = true;

          while (insert) {
            visitedTiles.push(this.map.getIndexFromCoords(xCurrent, yCurrent));
            const directions = this.getTileDirections(xCurrent, yCurrent);
            const neighbours = directions
              .map(d => this.map.getNearestNeighborFrom(xCurrent, yCurrent, d, MAP_JUNCTION))
              .filter(n => n && visitedTiles.indexOf(this.map.getIndexFromCoords(n[0], n[1])) === -1);

            const nPick = neighbours[Math.floor(Math.random() * neighbours.length)];
            if (nPick) {
              [xCurrent, yCurrent] = nPick;
              insert = true;
            } else {
              insert = false;
            }
          }

          return visitedTiles.map(idx => {
            const [x, y] = this.map.getCoordsFromIndex(idx);
            return this.scaleTilePosition(new THREE.Vector3(x, y, 0));
          });
        }

        updatePosition() {
          if (!isMounted) return;
          this.light.position.copy(this.position);
          this.line.advance(this.position);
        }

        startPath(waypoints: any[]) {
          if (!isMounted) return;
          this.timeline = new TimelineMax({
            onComplete: () => {
              if (!isMounted) return;
              TweenMax.to(this.position, 0.8, {
                onUpdate: this.updatePosition.bind(this),
                onComplete: () => {
                  if (isMounted) {
                    setTimeout(this.spawn.bind(this), Math.random() * 2000 + 400);
                  }
                },
              });
            },
          });

          waypoints.forEach((pos, idx) => {
            this.timeline.to(this.position, 0.22, {
              x: pos.x,
              y: pos.y,
              onUpdate: this.updatePosition.bind(this),
              ease: Linear.easeNone,
            });

            if (idx === 0) {
              this.timeline.to(this.light, 0.15, { power: 1.5 * 4 * Math.PI });
            }

            if (idx === waypoints.length - 1) {
              this.timeline.to(this.light, 0.3, { power: 0.05 * 4 * Math.PI }, "-=0.3");
            }
          });
        }

        dispose() {
          if (this.timeline) this.timeline.kill();
          if (this.geometry) this.geometry.dispose();
          if (this.mesh) {
            if (this.mesh.geometry) this.mesh.geometry.dispose();
            if (this.mesh.material) this.mesh.material.dispose();
          }
          if (this.light) this.group.remove(this.light);
        }
      }

      class App {
        width = 0;
        height = 0;
        mouse = new THREE.Vector2(0, 0);
        renderer: any;
        scene: any;
        camera: any;
        clock: any;
        particles: any;
        mazeMesh: any;
        lightSphere: any;
        occlusionMesh: any;
        occlusionRenderTarget: any;
        occlusionComposer: any;
        occlusionPass: any;
        composer: any;
        bloomPass: any;
        effectFXAA: any;
        trailsList: Trails[] = [];
        container: HTMLDivElement;

        constructor(container: HTMLDivElement, imgElement: HTMLImageElement) {
          this.container = container;
          this.init();
          this.initLights();
          this.initMazeMesh(imgElement);
          this.initTrails(imgElement);
          this.initParticles();
          this.initGodRays();
          this.setupComposer();
          this.setupPostprocessing();
          this.attachEvents();
          this.updateSize();
          this.onFrame(0);
        }

        init() {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const w = this.container.offsetWidth || 400;
          const h = this.container.offsetHeight || 400;
          
          this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: false,
            alpha: true
          });
          this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
          this.renderer.setSize(w, h);
          this.renderer.gammaInput = true;
          
          this.scene = new THREE.Scene();
          this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
          this.camera.position.set(13.5, 13.5, 13.5);
          this.clock = new THREE.Clock();
        }

        initTrails(imgElement: HTMLImageElement) {
          const map = new BoardMap(imgElement);
          
          // Face 1: Top
          const t1 = new Trails(map);
          t1.group.position.set(0, CUBE_SIZE / 2 + 0.1, 0);
          t1.group.rotation.x = Math.PI / 2;
          this.scene.add(t1.group);
          this.trailsList.push(t1);

          // Face 2: Right
          const t2 = new Trails(map);
          t2.group.position.set(CUBE_SIZE / 2 + 0.1, 0, 0);
          t2.group.rotation.x = Math.PI / 2;
          t2.group.rotation.y = Math.PI / 2;
          this.scene.add(t2.group);
          this.trailsList.push(t2);

          // Face 3: Front
          const t3 = new Trails(map);
          t3.group.position.set(0, 0, CUBE_SIZE / 2 + 0.1);
          this.scene.add(t3.group);
          this.trailsList.push(t3);
        }

        initParticles() {
          this.particles = new Particles();
          this.particles.clusters.forEach((cluster: any) => {
            this.scene.add(cluster.points);
          });
        }

        initLights() {
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.08);
          const innerLight = new THREE.PointLight(0xffffff, 0.5, 20);
          const outterLight = new THREE.PointLight(0x6958d5, 2.5, 20); // Aurix Purple ambient glow
          outterLight.position.set(10, 10, 10);
          
          this.scene.add(innerLight);
          this.scene.add(outterLight);
          this.scene.add(ambientLight);
        }

        setupPostprocessing() {
          const w = this.width || 400;
          const h = this.height || 400;
          this.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
          this.effectFXAA.uniforms["resolution"].value.set(1 / w, 1 / h);
          this.composer.addPass(this.effectFXAA);

          // Dark atmosphere bloom
          this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(w, h), 1.2, 0.35, 0.9);
          this.bloomPass.renderToScreen = true;
          this.composer.addPass(this.bloomPass);
        }

        initGodRays() {
          // Centered Core Sphere
          const geoSphere = new THREE.BoxGeometry(CUBE_SIZE * 0.76, CUBE_SIZE * 0.76, CUBE_SIZE * 0.76);
          const matSphere = new THREE.MeshBasicMaterial({ color: 0xdfb443, transparent: true }); // Aurix Gold central source
          this.lightSphere = new THREE.Mesh(geoSphere, matSphere);
          this.lightSphere.layers.set(1);
          this.lightSphere.material.opacity = 1;
          this.scene.add(this.lightSphere);

          // Occlusion mesh (copy of maze geometry)
          this.occlusionMesh = new THREE.Mesh(
            this.mazeMesh.geometry,
            new THREE.MeshBasicMaterial({ color: 0x000000 })
          );
          this.occlusionMesh.position.copy(this.mazeMesh.position);
          this.occlusionMesh.rotation.copy(this.mazeMesh.rotation);
          this.occlusionMesh.layers.set(1);
          this.scene.add(this.occlusionMesh);
        }

        setupComposer() {
          const w = this.container.offsetWidth || 400;
          const h = this.container.offsetHeight || 400;
          const scale = 0.5; // downscale for shader performance

          this.occlusionRenderTarget = new THREE.WebGLRenderTarget(w * scale, h * scale);
          this.occlusionComposer = new THREE.EffectComposer(this.renderer, this.occlusionRenderTarget);
          this.occlusionComposer.addPass(new THREE.RenderPass(this.scene, this.camera));

          const occPass = new THREE.ShaderPass({
            uniforms: {
              tDiffuse: { value: null },
              lightPosition: { value: new THREE.Vector2(0.5, 0.5) },
              exposure: { value: 0.18 },
              decay: { value: 0.94 },
              density: { value: 0.08 },
              weight: { value: 0.6 },
              samples: { value: 40 },
            },
            vertexShader: SHADER_PASSTHROUGH_VERTEX,
            fragmentShader: SHADER_VOLUMETRIC_LIGHT_FRAGMENT,
          });
          occPass.needsSwap = false;
          this.occlusionPass = occPass;
          this.occlusionComposer.addPass(occPass);

          this.composer = new THREE.EffectComposer(this.renderer);
          this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

          const addPass = new THREE.ShaderPass({
            uniforms: {
              tDiffuse: { value: null },
              tAdd: { value: null },
            },
            vertexShader: SHADER_PASSTHROUGH_VERTEX,
            fragmentShader: SHADER_ADDITIVE_FRAGMENT,
          });
          addPass.uniforms.tAdd.value = this.occlusionRenderTarget.texture;
          this.composer.addPass(addPass);
        }


        initMazeMesh(imgElement: HTMLImageElement) {
          const geo = new THREE.Geometry();
          const map = new BoardMap(imgElement);

          // Face 1: Top
          const up = this.getGamePlaneGeometry(map);
          up.position.y = CUBE_SIZE / 2;
          up.updateMatrix();
          geo.merge(up.geometry, up.matrix);

          // Face 2: Right
          const right = this.getGamePlaneGeometry(map);
          right.position.x = CUBE_SIZE / 2;
          right.rotation.z = Math.PI / 2;
          right.updateMatrix();
          geo.merge(right.geometry, right.matrix);

          // Face Front
          const front = this.getGamePlaneGeometry(map);
          front.rotation.x = Math.PI / 2;
          front.position.z = CUBE_SIZE / 2;
          front.updateMatrix();
          geo.merge(front.geometry, front.matrix);

          // Face Left
          const left = this.getGamePlaneGeometry(map);
          left.rotation.z = Math.PI / 2;
          left.position.x = -CUBE_SIZE / 2;
          left.updateMatrix();
          geo.merge(left.geometry, left.matrix);

          // Face Down
          const down = this.getGamePlaneGeometry(map);
          down.position.y = -CUBE_SIZE / 2;
          down.updateMatrix();
          geo.merge(down.geometry, down.matrix);

          // Face Back
          const back = this.getGamePlaneGeometry(map);
          back.rotation.x = Math.PI / 2;
          back.position.z = -CUBE_SIZE / 2;
          back.updateMatrix();
          geo.merge(back.geometry, back.matrix);

          const mat = new THREE.MeshPhongMaterial({
            color: 0x4583dc, // Premium blue maze walls
            shininess: 30,
            transparent: true,
            opacity: 0.85,
          });
          this.mazeMesh = new THREE.Mesh(geo, mat);
          this.mazeMesh.updateMatrix();
          this.scene.add(this.mazeMesh);
        }

        getGamePlaneGeometry(boardMap: BoardMap) {
          const mapBoundariesMesh = new MapBoundariesMesh(boardMap);
          return new THREE.Mesh(mapBoundariesMesh.geometry);
        }

        attachEvents() {
          window.addEventListener("resize", this.handleResize);
          window.addEventListener("mousemove", this.handleMouseMove);
        }

        handleResize = () => {
          this.updateSize();
        };

        handleMouseMove = (e: MouseEvent) => {
          if (!this.container) return;
          const rect = this.container.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          this.mouse.x = (e.clientX - cx) / (window.innerWidth / 2);
          this.mouse.y = -(e.clientY - cy) / (window.innerHeight / 2);
        };

        updateSize() {
          if (!this.container) return;
          const w = this.container.offsetWidth || 400;
          const h = this.container.offsetHeight || 400;
          this.renderer.setSize(w, h);
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.composer.setSize(w, h);
          this.occlusionComposer.setSize(w, h);
          this.width = w;
          this.height = h;
        }

        updateOcclusionIntensity(time: number) {
          const u = this.occlusionPass.uniforms;
          const speed = 0.0006;
          // Simple procedural noise via overlapping sines to prevent library dependencies
          const n0 = (Math.sin(time * speed) + Math.cos(time * speed * 1.5) + 1.5) / 3.0;
          const n1 = (Math.cos(time * speed * 0.8) + Math.sin(time * speed * 2.1) + 1.5) / 3.0;
          u.exposure.value = THREE.Math.lerp(0.04, 0.18, n0);
          u.decay.value = THREE.Math.lerp(0.93, 0.96, n1);
          u.density.value = THREE.Math.lerp(0.18, 0.35, n0);
          u.weight.value = THREE.Math.lerp(0.1, 0.55, n1);
        }

        updateLightPosition(time: number) {
          const speed = 0.0004;
          const n0 = (Math.sin(time * speed) + Math.cos(time * speed * 1.2) + 1.5) / 3.0;
          this.lightSphere.position.y = THREE.Math.lerp(-0.8, 0.8, n0);
        }

        updateCameraTilt() {
          if (typeof (window as any).TweenMax !== "undefined") {
            (window as any).TweenMax.to(this.camera.position, 1.2, {
              x: 13.5 + this.mouse.x * 2.0,
              y: 13.5 + this.mouse.y * 2.0,
              z: 13.5 + this.mouse.x * this.mouse.y,
              overwrite: "auto",
            });
          } else {
            // Fallback lerp without TweenMax
            const tx = 13.5 + this.mouse.x * 2.0;
            const ty = 13.5 + this.mouse.y * 2.0;
            const tz = 13.5 + this.mouse.x * this.mouse.y;
            this.camera.position.x += (tx - this.camera.position.x) * 0.05;
            this.camera.position.y += (ty - this.camera.position.y) * 0.05;
            this.camera.position.z += (tz - this.camera.position.z) * 0.05;
          }
        }

        onFrame = (time: number) => {
          if (!isMounted) return;
          requestAnimationFrame(this.onFrame);
          
          this.camera.layers.set(1);
          this.updateCameraTilt();
          const delta = this.clock.getDelta();
          this.particles.update(delta);
          this.updateOcclusionIntensity(time);
          this.updateLightPosition(time);
          
          this.renderer.setClearColor(0x000000, 0);
          this.occlusionComposer.render();
          
          this.camera.layers.set(0);
          this.camera.lookAt(this.scene.position);
          this.composer.render();
        };

        dispose() {
          window.removeEventListener("resize", this.handleResize);
          window.removeEventListener("mousemove", this.handleMouseMove);

          this.trailsList.forEach(t => t.dispose());
          if (this.particles) this.particles.dispose();

          if (this.scene) {
            this.scene.traverse((obj: any) => {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) {
                if (Array.isArray(obj.material)) {
                  obj.material.forEach((m: any) => m.dispose());
                } else {
                  obj.material.dispose();
                }
              }
            });
          }

          if (this.occlusionRenderTarget) this.occlusionRenderTarget.dispose();
          if (this.renderer) this.renderer.dispose();
        }
      }

      if (containerRef.current) {
        appInstance = new App(containerRef.current, img);
      }
    };

    return () => {
      isMounted = false;
      if (appInstance) {
        appInstance.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", opacity: 0.9 }} />
    </div>
  );
}
