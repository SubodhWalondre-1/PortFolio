import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import myPhoto from "../assets/subodh.png";

/* ─────────────────────────────────────────────
   Home.jsx  — nav removed (now in Navbar.jsx)
   1. Shapes spawn only right half + edges, never over text
   2. Full canvas draggable, including near/over photo
   3. Text always readable — solid bg behind name heading
   ───────────────────────────────────────────── */

export default function Home() {
  const heroCanvasRef  = useRef(null);
  const cursorOuterRef = useRef(null);
  const cursorInnerRef = useRef(null);
  const { dark } = useTheme();

  useEffect(() => {
    /* ── fonts ── */
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Barlow+Condensed:wght@300;400;600;700&display=swap";
    document.head.appendChild(link);

    /* ── CURSOR ── */
    const outer = cursorOuterRef.current;
    const inner = cursorInnerRef.current;
    let mouseX = 0, mouseY = 0, ox = 0, oy = 0;

    const onMove = (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      inner.style.left = mouseX + "px"; inner.style.top = mouseY + "px";
    };
    document.addEventListener("mousemove", onMove);

    let rafCursor;
    const animCursor = () => {
      ox += (mouseX - ox) * 0.12; oy += (mouseY - oy) * 0.12;
      outer.style.left = ox + "px"; outer.style.top = oy + "px";
      rafCursor = requestAnimationFrame(animCursor);
    };
    animCursor();

    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("link-hovered"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("link-hovered"));
    });

    /* ── THREE.JS ── */
    const THREE  = window.THREE;
    const canvas = heroCanvasRef.current;
    if (!THREE || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
    camera.position.set(0, 0, 18);

    // Derive accent color directly from dark boolean to avoid race condition
    // (CSS variable may not yet be updated when this effect runs)
    const acidColor = dark ? 0xC3D809 : 0xCD0000;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const pl1 = new THREE.PointLight(acidColor, 2, 50); pl1.position.set(5, 10, 10);  scene.add(pl1);
    const pl2 = new THREE.PointLight(0xffffff, 1, 30); pl2.position.set(-8, -5, 5); scene.add(pl2);

    const geos = [
      new THREE.BoxGeometry(1.8, 1.8, 1.8),
      new THREE.SphereGeometry(1.1, 32, 32),
      new THREE.TorusGeometry(1.0, 0.35, 16, 100),
      new THREE.OctahedronGeometry(1.2),
      new THREE.TetrahedronGeometry(1.2),
      new THREE.IcosahedronGeometry(1.0),
      new THREE.ConeGeometry(0.9, 1.8, 6),
      new THREE.BoxGeometry(1.2, 1.2, 1.2),
      new THREE.SphereGeometry(0.8, 16, 16),
      new THREE.TorusGeometry(0.7, 0.28, 12, 60),
      new THREE.OctahedronGeometry(0.9),
      new THREE.IcosahedronGeometry(0.7),
    ];

    const acidWire  = new THREE.MeshPhongMaterial({ color: acidColor, wireframe: true,  opacity: 0.85, transparent: true });
    const whiteWire = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true,  opacity: 0.4,  transparent: true });
    const solidAcid = new THREE.MeshPhongMaterial({ color: acidColor, shininess: 100 });
    const solidGray = new THREE.MeshPhongMaterial({ color: 0x333133, shininess: 80  });
    const mats = [acidWire, whiteWire, acidWire, whiteWire, solidAcid, solidGray,
                  acidWire, whiteWire, acidWire, whiteWire, acidWire,  whiteWire];

    const rawPoints = [
      /* Zone A — right side: 7 shapes */
      ...Array.from({ length: 7 }, () => ({
        x:  2 + Math.random() * 11,
        y: -8 + Math.random() * 16,
        z: (Math.random() - 0.5) * 5,
      })),
      /* Zone B — far left: 2 shapes */
      ...Array.from({ length: 2 }, () => ({
        x: -13 + Math.random() * 5,
        y:  -7 + Math.random() * 14,
        z: (Math.random() - 0.5) * 4,
      })),
      /* Zone C — top strip: 2 shapes */
      ...Array.from({ length: 2 }, () => ({
        x:  -8 + Math.random() * 21,
        y:   6 + Math.random() * 3,
        z: (Math.random() - 0.5) * 3,
      })),
      /* Zone D — bottom strip: 1 shape */
      { x: -4 + Math.random() * 17, y: -9 + Math.random() * 3, z: (Math.random() - 0.5) * 3 },
    ];
    rawPoints.sort(() => Math.random() - 0.5);

    const meshes = [];
    geos.forEach((geo, i) => {
      const mesh = new THREE.Mesh(geo, mats[i]);
      const sp   = rawPoints[i % rawPoints.length];
      mesh.position.set(sp.x, sp.y, sp.z);
      mesh.userData = {
        rx: (Math.random() - 0.5) * 0.012,
        ry: (Math.random() - 0.5) * 0.015,
        origX: sp.x, origY: sp.y,
        grabbed: false,
        phase:      Math.random() * Math.PI * 2,
        floatSpeed: 0.4 + Math.random() * 0.6,
        floatAmp:   0.15 + Math.random() * 0.25,
        nudgeX: 0, nudgeY: 0,
      };
      scene.add(mesh);
      meshes.push(mesh);
    });

    /* ── DRAG SYSTEM ── */
    const raycaster   = new THREE.Raycaster();
    const mouse2D     = new THREE.Vector2();
    const dragPlane   = new THREE.Plane();
    const intersectPt = new THREE.Vector3();
    const dragOffset  = new THREE.Vector3();
    const planeNormal = new THREE.Vector3(0, 0, 1);
    let grabbed = null, isDragging = false;

    const toNDC = (cx, cy) => {
      const r = canvas.getBoundingClientRect();
      mouse2D.x =  ((cx - r.left) / r.width)  * 2 - 1;
      mouse2D.y = -((cy - r.top)  / r.height) * 2 + 1;
    };

    const onDown = (e) => {
      toNDC(e.clientX, e.clientY);
      raycaster.setFromCamera(mouse2D, camera);
      const hits = raycaster.intersectObjects(meshes);
      if (!hits.length) return;
      grabbed = hits[0].object;
      isDragging = true;
      grabbed.userData.grabbed = true;
      dragPlane.setFromNormalAndCoplanarPoint(planeNormal, grabbed.position);
      raycaster.ray.intersectPlane(dragPlane, intersectPt);
      dragOffset.subVectors(grabbed.position, intersectPt);
      document.body.classList.add("shape-grabbed");
    };

    const onDrag = (e) => {
      toNDC(e.clientX, e.clientY);
      raycaster.setFromCamera(mouse2D, camera);
      if (isDragging && grabbed) {
        if (raycaster.ray.intersectPlane(dragPlane, intersectPt)) {
          const tx = intersectPt.x + dragOffset.x;
          const ty = intersectPt.y + dragOffset.y;
          grabbed.position.x += (tx - grabbed.position.x) * 0.25;
          grabbed.position.y += (ty - grabbed.position.y) * 0.25;
          grabbed.userData.origX = grabbed.position.x;
          grabbed.userData.origY = grabbed.position.y;
        }
      } else {
        meshes.forEach((m) => {
          if (!m.userData.grabbed) {
            m.userData.nudgeX = mouse2D.x * 0.6;
            m.userData.nudgeY = mouse2D.y * 0.4;
          }
        });
      }
    };

    const onUp = () => {
      if (grabbed) grabbed.userData.grabbed = false;
      grabbed = null; isDragging = false;
      document.body.classList.remove("shape-grabbed");
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup",   onUp);

    /* ── ANIMATION LOOP (pauses when off-screen) ── */
    let time = 0, rafHero, heroVisible = true;
    const animHero = () => {
      if (!heroVisible) { rafHero = null; return; }
      rafHero = requestAnimationFrame(animHero);
      time += 0.01;
      meshes.forEach((mesh) => {
        const d = mesh.userData;
        if (d.grabbed) { mesh.rotation.x += 0.04; mesh.rotation.y += 0.05; return; }
        mesh.position.x = d.origX + Math.cos(time * d.floatSpeed * 0.7 + d.phase) * (d.floatAmp * 0.4) + d.nudgeX * 0.3;
        mesh.position.y = d.origY + Math.sin(time * d.floatSpeed       + d.phase) *  d.floatAmp        + d.nudgeY * 0.2;
        mesh.rotation.x += d.rx;
        mesh.rotation.y += d.ry;
      });
      renderer.render(scene, camera);
    };
    animHero();

    /* ── Pause when hero scrolls out of view ── */
    const heroSection = document.getElementById("hero");
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && !rafHero) animHero();
      },
      { threshold: 0 }
    );
    if (heroSection) heroObserver.observe(heroSection);

    const onResize = () => {
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ── GSAP entrance ── */
    const gsap = window.gsap;
    if (gsap) {
      gsap.timeline()
        .to(".hero-tag",     { opacity: 1, y: 0, duration: 0.6, delay: 0.2 })
        .to(".hero-name",    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.3")
        .to(".hero-role",    { opacity: 1,        duration: 0.5 }, "-=0.3")
        .to(".hero-desc",    { opacity: 1, y: 0, duration: 0.6 }, "-=0.2")
        .to(".hero-motto",   { opacity: 1, x: 0, duration: 0.5 }, "-=0.2")
        .to(".hero-ctas",    { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .to(".hero-socials", { opacity: 1, y: 0, duration: 0.5 }, "-=0.2")
        .to(".hero-right",   { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, "-=0.6")
        .to("#scrollInd",    { opacity: 1,        duration: 0.5 }, "-=0.3");
    }

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafCursor);
      if (rafHero) cancelAnimationFrame(rafHero);
      heroObserver.disconnect();
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("resize",    onResize);
      renderer.dispose();
    };
  }, [dark]);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--dark);
          color: var(--white);
          font-family: 'Space Mono', monospace;
          overflow-x: hidden;
          cursor: none;
          transition: background 0.4s ease, color 0.4s ease;
        }

        /* ── CURSOR ── */
        .c-outer {
          position: fixed; width: 40px; height: 40px;
          border: 2px solid var(--acid); border-radius: 50%;
          pointer-events: none; z-index: 9999;
          transform: translate(-50%,-50%);
          transition: width .2s, height .2s, background .2s, border-radius .2s, border-color .3s;
          mix-blend-mode: difference;
        }
        .c-inner {
          position: fixed; width: 8px; height: 8px;
          background: var(--acid); border-radius: 50%;
          pointer-events: none; z-index: 9999;
          transform: translate(-50%,-50%);
          transition: width .15s, height .15s, background .3s;
        }
        body.link-hovered .c-outer  { width: 70px; height: 70px; background: rgba(var(--acid-rgb),.15); }
        body.shape-grabbed .c-outer {
          width: 55px; height: 55px;
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          background: rgba(var(--acid-rgb),.2);
        }
        body.shape-grabbed .c-inner { width: 12px; height: 12px; }

        /* ── HERO ── */
        #hero {
          position: relative; min-height: 100vh;
          overflow: hidden; display: flex; align-items: center;
        }
        #hero-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          z-index: 0;
        }
        .hero-content {
          position: relative; z-index: 10;
          padding: 120px 60px 60px;
          max-width: 1400px; width: 100%; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 60px; align-items: center;
          pointer-events: none;
        }
        .hero-left { pointer-events: none; }
        .hero-left a,
        .hero-left button { pointer-events: auto; }

        .hero-tag {
          font-family: 'Space Mono', monospace; font-size: .75rem;
          letter-spacing: .4em; color: var(--acid); text-transform: uppercase;
          margin-bottom: 20px; opacity: 0; transform: translateY(20px);
          transition: color .3s;
        }
        .hero-name {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(5rem, 10vw, 9rem);
          line-height: .9; letter-spacing: .03em;
          margin-bottom: 20px; opacity: 0; transform: translateY(30px);
          color: var(--white);
          transition: color .3s;
        }
        .hero-name .acid { color: var(--acid); transition: color .3s; }
        .hero-role {
          font-family: 'Space Mono', monospace;
          font-size: clamp(.85rem, 1.5vw, 1.1rem);
          color: var(--acid); letter-spacing: .1em;
          margin-bottom: 20px; opacity: 0;
          transition: color .3s;
        }
        .hero-role::before { content: ">_"; margin-right: 8px; }
        .hero-desc {
          font-family: 'Space Mono', monospace; font-size: .85rem;
          line-height: 1.8; color: rgba(var(--white-rgb),.65);
          margin-bottom: 16px; opacity: 0; transform: translateY(15px);
        }
        .hero-motto {
          font-family: 'Space Mono', monospace; font-size: .8rem;
          font-style: italic; color: var(--acid);
          border-left: 3px solid var(--acid); padding-left: 16px;
          margin-bottom: 40px; opacity: 0; transform: translateX(-10px);
          transition: color .3s, border-color .3s;
        }
        .hero-ctas { display: flex; gap: 16px; opacity: 0; transform: translateY(15px); }

        .btn-primary {
          font-family: 'Barlow Condensed', sans-serif; font-size: .9rem;
          font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
          background: var(--acid); color: var(--acid-fg);
          border: 3px solid var(--acid); padding: 14px 32px;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          transition: background .2s, color .2s, border-color .3s; cursor: none; pointer-events: auto;
        }
        .btn-primary:hover { background: transparent; color: var(--acid); }
        .btn-secondary {
          font-family: 'Barlow Condensed', sans-serif; font-size: .9rem;
          font-weight: 700; letter-spacing: .2em; text-transform: uppercase;
          background: transparent; color: var(--white);
          border: 3px solid rgba(var(--white-rgb),.25); padding: 14px 32px;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          transition: all .2s; cursor: none; pointer-events: auto;
        }
        .btn-secondary:hover { border-color: var(--acid); color: var(--acid); }

        .hero-socials {
          margin-top: 40px; display: flex; align-items: center; gap: 16px;
          opacity: 0; transform: translateY(10px);
        }
        .hero-socials-label {
          font-family: 'Barlow Condensed'; font-size: .7rem;
          letter-spacing: .3em; color: var(--gray); text-transform: uppercase;
          transition: color .3s;
        }
        .social-icon {
          width: 40px; height: 40px; border: 2px solid rgba(var(--acid-rgb),.3);
          display: flex; align-items: center; justify-content: center;
          color: var(--gray); text-decoration: none;
          transition: all .2s; cursor: none; pointer-events: auto;
        }
        .social-icon:hover { border-color: var(--acid); color: var(--acid); background: rgba(var(--acid-rgb),.05); }

        /* ── PHOTO ── */
        .hero-right {
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: translateX(30px);
          pointer-events: none;
        }
        .photo-frame {
          position: relative;
          width: clamp(280px, 35vw, 440px);
          pointer-events: auto;
        }
        .photo-frame::before {
          content: '';
          position: absolute; top: -12px; left: -12px; right: 12px; bottom: -12px;
          border: 3px solid var(--acid); z-index: -1;
          transition: transform .3s ease, border-color .3s;
        }
        .photo-frame:hover::before { transform: translate(6px, 6px); }
        .photo-frame::after {
          content: 'SUBODH.W';
          position: absolute; bottom: -32px; right: 0;
          font-family: 'Barlow Condensed'; font-size: .7rem;
          letter-spacing: .4em; color: var(--acid); text-transform: uppercase;
          transition: color .3s;
        }
        .hero-photo {
          width: 100%; display: block;
          filter: grayscale(20%) contrast(1.05);
          transition: filter .3s ease;
        }
        .photo-frame:hover .hero-photo { filter: grayscale(0%) contrast(1.1); }
        .photo-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(var(--acid-rgb),.08) 0%, transparent 50%);
          pointer-events: none;
        }
        .photo-badge {
          position: absolute; top: 20px; right: -20px;
          background: var(--acid); color: var(--acid-fg);
          font-family: 'Space Mono', monospace; font-size: .65rem;
          font-weight: 700; padding: 8px 12px;
          letter-spacing: .1em; text-transform: uppercase; writing-mode: vertical-rl;
          transition: background .3s, color .3s;
        }

        /* ── drag hint ── */
        .drag-hint {
          position: absolute; bottom: 105px; right: 60px; z-index: 20;
          display: flex; align-items: center; gap: 8px;
          font-family: 'Barlow Condensed', sans-serif; font-size: .7rem;
          letter-spacing: .25em; color: rgba(var(--acid-rgb),.5); text-transform: uppercase;
          animation: hintPulse 3s ease-in-out infinite; pointer-events: none;
        }
        @keyframes hintPulse { 0%,100%{opacity:.5} 50%{opacity:1} }

        /* ── scroll indicator ── */
        #scrollInd {
          position: absolute; bottom: 40px; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; z-index: 10; pointer-events: none;
        }
        #scrollInd span {
          font-family: 'Barlow Condensed'; font-size: .65rem;
          letter-spacing: .4em; color: var(--gray); text-transform: uppercase;
          transition: color .3s;
        }
        .scroll-line {
          width: 1px; height: 50px;
          background: linear-gradient(to bottom, var(--acid), transparent);
          animation: scrollAnim 1.5s ease-in-out infinite;
        }
        @keyframes scrollAnim { 0%,100%{transform:scaleY(1);opacity:1} 50%{transform:scaleY(.5);opacity:.4} }

        /* ── TICKER ── */
        .ticker {
          position: relative; overflow: hidden;
          background: var(--acid); padding: 14px 0;
          border-top: 3px solid var(--darker); border-bottom: 3px solid var(--darker);
          transition: background .3s, border-color .3s;
        }
        .ticker-track { display: flex; animation: ticker 20s linear infinite; white-space: nowrap; }
        .ticker-item {
          font-family: 'Bebas Neue'; font-size: 1.4rem; letter-spacing: .1em;
          color: var(--acid-fg); padding: 0 30px;
          display: flex; align-items: center; gap: 20px;
          transition: color .3s;
        }
        .ticker-item::after { content: "✦"; color: rgba(var(--darkest-rgb),.4); }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        @media (max-width: 768px) {
          .hero-content { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .hero-right { display: none; }
        }
      `}</style>

      {/* CURSOR */}
      <div className="c-outer" ref={cursorOuterRef} />
      <div className="c-inner" ref={cursorInnerRef} />

      {/* HERO */}
      <section id="hero">
        <canvas id="hero-canvas" ref={heroCanvasRef} />
        <div className="drag-hint">✦ Grab &amp; drag the shapes</div>

        <div className="hero-content">
          {/* LEFT text */}
          <div className="hero-left">
            <div className="hero-tag">// Hi, I'm</div>

            <h1 className="hero-name">
              SUBODH<br />
              <span className="acid">WALONDRE</span>
            </h1>

            <div className="hero-role">Full Stack AI &amp; ML Engineer</div>

            <p className="hero-desc">
              From curiosity about how machines understand language to building
              full-stack web products — I turned a passion into a craft. Currently
              in Semester VI at S.B. Jain, Nagpur, proving that great software
              doesn't wait for a degree.
            </p>

            <div className="hero-motto">
              "Start where you are. Use what you have. Do what you can."
            </div>

            <div className="hero-ctas">
              <a href="#projects" className="btn-primary">View My Work →</a>
              <a href="#contact"  className="btn-secondary">↓ Download Resume</a>
            </div>

            <div className="hero-socials">
              <span className="hero-socials-label">Find me on</span>
              <a href="https://github.com/SubodhWalondre-1" target="_blank" rel="noreferrer" className="social-icon" title="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/subodh-walondre-073576283" target="_blank" rel="noreferrer" className="social-icon" title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* RIGHT photo */}
          <div className="hero-right">
            <div className="photo-frame">
              <img
                className="hero-photo"
                src={myPhoto}
                alt="Subodh Walondre"
                onError={(e) => {
                  e.target.style.minHeight = "400px";
                  e.target.style.background = `rgba(var(--acid-rgb),0.05)`;
                  e.target.style.display = "block";
                }}
              />
              <div className="photo-overlay" />
              <div className="photo-badge">AI · ML · FS</div>
            </div>
          </div>
        </div>

        <div id="scrollInd">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          {["FULLSTACK","AI/ML","REACT","PYTHON","FASTAPI","POSTGRES","UI/UX","WEBDEV",
 "FULLSTACK","AI/ML","REACT","PYTHON","FASTAPI","POSTGRES","UI/UX","WEBDEV"]
            .map((word, i) => <span className="ticker-item" key={i}>{word}</span>)}
        </div>
      </div>
    </>
  );
}