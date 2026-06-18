"use client";

import { useEffect, useRef } from "react";

export default function DynamicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let app: any = null;
    let isMounted = true;
    let clickHandler: (() => void) | undefined;
    let onMouseMove: ((e: MouseEvent) => void) | undefined;
    let onMouseDown: ((e: MouseEvent) => void) | undefined;

    // References for clean-up
    let modularGroup: any = null;
    let particularGroup: any = null;
    let customPointLight: any = null;
    let customAmbientLight: any = null;
    let intersectedObj: any = null;
    let initialEmissive = 0;

    // Camera target position for smooth zoom lerping (default at z=5)
    const targetCameraPos = { x: 0, y: 0, z: 5 };

    // Curated neon colors matched with QIE Aurix theme
    const neonPalette = [
      "#dfb443", // Aurix Gold
      "#00f5d4", // Soft Teal
      "#6958d5", // Purple
      "#ff008a", // Neon Pink
      "#83f36e", // Neon Green
      "#00e5ff", // Light Cyan
      "#a78bfa", // Lavender
      "#f43f5e", // Rose
      "#10b981", // Emerald
    ];

    const getRandomColors = (count: number) => {
      const shuffled = [...neonPalette].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const initCursor = async () => {
      try {
        // Load Three.js dynamically to access mathematical classes & geometry constructors
        const loadThree = new Function(
          "return import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js')"
        );
        const THREE = await loadThree();
        
        if (!isMounted) return;

        // Load TubesCursor CDN
        const loadTubesCursor = new Function(
          "return import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js')"
        );
        const module = await loadTubesCursor();
        
        if (!isMounted) return;

        const TubesCursor = module.default;

        // Initialize Tubes Cursor with Aurix Gold, Soft Teal, and Purple
        app = TubesCursor(canvas, {
          bloom: null,
          tubes: {
            colors: ["#dfb443", "#00f5d4", "#6958d5"],
            lights: {
              intensity: 300,
              colors: ["#00f5d4", "#dfb443", "#ff008a", "#04091a"]
            }
          }
        });

        if (!isMounted) {
          if (app && typeof app.dispose === "function") app.dispose();
          return;
        }

        // 1. Extract constructors from bundled Three.js instances
        const findAncestorWithProp = (instance: any, propName: string) => {
          let proto = Object.getPrototypeOf(instance);
          while (proto) {
            if (proto[propName] || (proto.constructor && proto.constructor.prototype && proto.constructor.prototype[propName])) {
              return proto.constructor;
            }
            proto = Object.getPrototypeOf(proto);
          }
          return null;
        };

        const getSuperClass = (cls: any) => Object.getPrototypeOf(cls.prototype)?.constructor;

        const SceneClass = app.three.scene.constructor;
        const Object3D = getSuperClass(SceneClass) || findAncestorWithProp(app.three.scene, 'isObject3D');
        
        // Custom Group subclass matching THREE.Group behavior
        class Group extends Object3D {
          isGroup = true;
          type = "Group";
        }

        const qCClass = app.tubes.tubes[0].constructor;
        const Mesh = getSuperClass(qCClass) || findAncestorWithProp(app.tubes.tubes[0], 'isMesh');
        
        const XCClass = app.tubes.tubes[0].geometry.constructor;
        const TubeGeometry = getSuperClass(XCClass);
        const BufferGeometry = getSuperClass(TubeGeometry) || findAncestorWithProp(app.tubes.tubes[0].geometry, 'isBufferGeometry');
        
        const positionAttr = app.tubes.tubes[0].geometry.getAttribute('position');
        const BufferAttribute = findAncestorWithProp(positionAttr, 'isBufferAttribute') || positionAttr.constructor;
        
        const MeshStandardMaterial = app.tubes.tubes[0].material.constructor;
        
        const PointLight = app.tubes.lights[0].constructor;
        const Color = app.tubes.lights[0].color.constructor;
        const Vector3 = app.three.camera.position.constructor;

        // Helper to procedurally create CircleGeometry using bundled constructors
        const createCircleGeometry = (radius: number, segments: number) => {
          const geom = new BufferGeometry();
          const positions: number[] = [];
          const indices: number[] = [];
          
          // Center point
          positions.push(0, 0, 0);
          
          for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            positions.push(radius * Math.cos(theta), radius * Math.sin(theta), 0);
          }
          
          for (let i = 1; i <= segments; i++) {
            indices.push(0, i, i + 1);
          }
          
          geom.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
          geom.setIndex(indices);
          geom.computeVertexNormals();
          return geom;
        };

        // Helper to procedurally create IcosahedronGeometry using bundled constructors
        const createIcosahedronGeometry = (radius: number) => {
          const geom = new BufferGeometry();
          const t = (1 + Math.sqrt(5)) / 2;
          
          const rawVertices = [
            -1,  t,  0,    1,  t,  0,   -1, -t,  0,    1, -t,  0,
             0, -1,  t,    0,  1,  t,    0, -1, -t,    0,  1, -t,
             t,  0, -1,    t,  0,  1,   -t,  0, -1,   -t,  0,  1
          ];
          
          const vertices: number[] = [];
          for (let i = 0; i < rawVertices.length; i += 3) {
            const x = rawVertices[i];
            const y = rawVertices[i+1];
            const z = rawVertices[i+2];
            const len = Math.sqrt(x*x + y*y + z*z);
            vertices.push((x / len) * radius, (y / len) * radius, (z / len) * radius);
          }
          
          const indices = [
             0, 11,  5,    0,  5,  1,    0,  1,  7,    0,  7, 10,    0, 10, 11,
             1,  5,  9,    5, 11,  4,   11, 10,  2,   10,  7,  6,    7,  1,  8,
             3,  9,  4,    3,  4,  2,    3,  2,  6,    3,  6,  8,    3,  8,  9,
             4,  9,  5,    2,  4, 11,    6,  2, 10,    8,  6,  7,    9,  8,  1
          ];
          
          geom.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
          geom.setIndex(indices);
          geom.computeVertexNormals();
          return geom;
        };

        // 2. Create Scene Groups for Custom Geometries
        modularGroup = new Group();
        particularGroup = new Group();

        // 3. Generate 30 flat-shaded orbiting Icosahedrons (QIE Aurix colors: Purple, Teal, Gold)
        const colorsList = [0x6958d5, 0x00f5d4, 0xdfb443];
        for (let i = 0; i < 30; i++) {
          const geometry = createIcosahedronGeometry(0.35);
          const material = new MeshStandardMaterial({
            flatShading: true,
            color: colorsList[i % colorsList.length],
            transparent: true,
            opacity: 0.7,
            roughness: 0.2,
            metalness: 0.8,
            emissive: new Color(0x000000)
          });
          const cube = new Mesh(geometry, material) as any;
          cube.speedRotation = Math.random() * 0.1;
          cube.positionX = -1.2 + Math.random() * 2.4;
          cube.positionY = -1.2 + Math.random() * 2.4;
          cube.positionZ = -1.2 + Math.random() * 2.4;
          
          const scaleVal = 0.15 + Math.random() * 0.25;
          cube.scale.set(scaleVal, scaleVal, scaleVal);
          
          cube.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          
          cube.position.set(cube.positionX, cube.positionY, cube.positionZ);
          modularGroup.add(cube);
        }

        // 4. Generate 120 drifting circular particles (Purple) using self-illuminated MeshStandardMaterial (DoubleSide)
        const pMaterial = new MeshStandardMaterial({
          color: 0x000000,
          emissive: new Color(0x6958d5),
          side: 2, // DoubleSide
          transparent: true,
          opacity: 0.35,
          roughness: 1.0,
          metalness: 0.0
        });
        const pGeometry = createCircleGeometry(0.015, 5);
        for (let i = 0; i < 120; i++) {
          const particle = new Mesh(pGeometry, pMaterial) as any;
          const amp = 3.0;
          particle.position.set(
            (-0.5 + Math.random()) * amp * 2,
            (-0.5 + Math.random()) * amp * 2,
            (-0.5 + Math.random()) * amp * 2
          );
          particle.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          );
          const pScale = 0.5 + Math.random() * 1.5;
          particle.scale.set(pScale, pScale, pScale);
          particle.speedValue = Math.random() * 0.3;
          particularGroup.add(particle);
        }

        // Add groups to the dynamic tubes scene
        app.three.scene.add(modularGroup);
        app.three.scene.add(particularGroup);

        // Add a dedicated PointLight to emphasize the geometries' flat edges
        customPointLight = new PointLight(0x6958d5, 8, 15);
        customPointLight.position.set(0, 0, 4);
        app.three.scene.add(customPointLight);

        // Ambient lighting/headlight for general structural visibility (PointLight placed far away)
        customAmbientLight = new PointLight(0xffffff, 0.5, 100);
        customAmbientLight.position.set(0, 0, 10);
        app.three.scene.add(customAmbientLight);

        // 5. Mouse Interaction / Raycaster Setup (uses CDN THREE for Raycaster and Vector2 CPU utilities)
        const mouse = new THREE.Vector2(0, 0);
        const raycaster = new THREE.Raycaster();
        
        onMouseMove = (e: MouseEvent) => {
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        onMouseDown = (e: MouseEvent) => {
          if (!app || !app.three || !app.three.camera) return;
          raycaster.setFromCamera(mouse, app.three.camera);
          const intersects = raycaster.intersectObjects(modularGroup.children);
          
          if (intersects.length > 0) {
            const hit = intersects[0].object as any;
            if (intersectedObj !== hit) {
              // Reset previous emissive highlight
              if (intersectedObj && intersectedObj.material) {
                intersectedObj.material.emissive.setHex(initialEmissive);
              }
              intersectedObj = hit;
              if (intersectedObj.material) {
                initialEmissive = intersectedObj.material.emissive.getHex();
                // Highlight with Gold emissive glow
                intersectedObj.material.emissive.setHex(0xdfb443);
              }
              // Zoom camera target closer to the clicked element
              targetCameraPos.x = hit.position.x;
              targetCameraPos.y = hit.position.y;
              targetCameraPos.z = hit.position.z + 1.8;
            } else {
              // Clicked same object -> reset
              if (intersectedObj && intersectedObj.material) {
                intersectedObj.material.emissive.setHex(initialEmissive);
              }
              intersectedObj = null;
              targetCameraPos.x = 0;
              targetCameraPos.y = 0;
              targetCameraPos.z = 5;
            }
          } else {
            // Clicked background -> reset zoom
            if (intersectedObj && intersectedObj.material) {
              intersectedObj.material.emissive.setHex(initialEmissive);
            }
            intersectedObj = null;
            targetCameraPos.x = 0;
            targetCameraPos.y = 0;
            targetCameraPos.z = 5;
          }
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mousedown", onMouseDown);

        // 6. Click handler to randomize neon palettes
        clickHandler = () => {
          if (app && app.tubes) {
            const colors = getRandomColors(3);
            const lightsColors = getRandomColors(4);
            app.tubes.setColors(colors);
            app.tubes.setLightsColors(lightsColors);
          }
          // Randomize icosahedrons colors on click
          if (modularGroup) {
            modularGroup.children.forEach((mesh: any) => {
              if (mesh.material) {
                const randColor = neonPalette[Math.floor(Math.random() * neonPalette.length)];
                mesh.material.color.set(randColor);
              }
            });
          }
        };

        window.addEventListener("click", clickHandler);

        // 7. Chain into Three.js render loop callback
        const originalOnBeforeRender = app.three.onBeforeRender;
        app.three.onBeforeRender = (time: any) => {
          if (originalOnBeforeRender) {
            originalOnBeforeRender(time);
          }

          const elapsed = time.elapsed * 0.4; // smooth speed modifier

          // Animate particles (drift and rotate)
          particularGroup.children.forEach((p: any) => {
            p.rotation.x += p.speedValue * 0.01;
            p.rotation.y += p.speedValue * 0.01;
            p.rotation.z += p.speedValue * 0.01;
          });
          particularGroup.rotation.y += 0.0015;

          // Animate icosahedrons (sine/cosine orbits)
          modularGroup.children.forEach((cube: any) => {
            cube.rotation.x += 0.003;
            cube.rotation.y += 0.002;
            cube.rotation.z += 0.001;

            cube.position.x = Math.sin(elapsed * cube.positionZ) * cube.positionY;
            cube.position.y = Math.cos(elapsed * cube.positionX) * cube.positionZ;
            cube.position.z = Math.sin(elapsed * cube.positionY) * cube.positionX;
          });

          // Parallax movement of group based on mouse
          modularGroup.rotation.y -= (mouse.x * 0.8 + modularGroup.rotation.y) * 0.05;
          modularGroup.rotation.x -= (-mouse.y * 0.8 + modularGroup.rotation.x) * 0.05;

          // Camera target position lerping
          if (app.three.camera) {
            const camTarget = new Vector3(targetCameraPos.x, targetCameraPos.y, targetCameraPos.z);
            app.three.camera.position.lerp(camTarget, 0.05);
            app.three.camera.lookAt(0, 0, 0);
          }
        };

      } catch (err) {
        console.error("Failed to initialize WebGL raycaster background:", err);
      }
    };

    initCursor();

    return () => {
      isMounted = false;
      if (onMouseMove) window.removeEventListener("mousemove", onMouseMove);
      if (onMouseDown) window.removeEventListener("mousedown", onMouseDown);
      if (clickHandler) window.removeEventListener("click", clickHandler);
      
      // Clean up Three.js groups and lights to avoid memory leaks
      if (app && app.three && app.three.scene) {
        if (modularGroup) {
          modularGroup.children.forEach((mesh: any) => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m: any) => m.dispose());
              } else {
                mesh.material.dispose();
              }
            }
          });
          app.three.scene.remove(modularGroup);
        }
        if (particularGroup) {
          particularGroup.children.forEach((mesh: any) => {
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
          });
          app.three.scene.remove(particularGroup);
        }
        if (customPointLight) app.three.scene.remove(customPointLight);
        if (customAmbientLight) app.three.scene.remove(customAmbientLight);
      }

      if (app && typeof app.dispose === "function") {
        app.dispose();
      }
    };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Aurora Ambient Glow Layer 1 */}
      <div className="glow-ambient glow-teal" style={{ top: "-10%", left: "-10%", opacity: 0.12 }} />
      {/* Aurora Ambient Glow Layer 2 */}
      <div className="glow-ambient glow-gold" style={{ bottom: "-10%", right: "-10%", opacity: 0.08 }} />
      {/* WebGL Canvas */}
      <canvas ref={canvasRef} id="canvas" style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none" }} />
    </div>
  );
}

