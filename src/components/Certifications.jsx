// src/components/Certifications.jsx
import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { certifications } from "../data/certifications";

const TABS = [
  { key: "certification", label: "Certifications" },
  { key: "workshop",      label: "Workshops"      },
];

// ─── Liquid Metal Canvas ────────────────────────────────────────────────────────
// Full-section deformable spring mesh. Mouse pushes nodes away like liquid mercury.
// Reads --acid-rgb every frame → auto-adapts to dark/light theme.
function LiquidMetalCanvas({ sectionRef }) {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef(null);
  const nodesRef  = useRef([]);
  const dimsRef   = useRef({ W: 0, H: 0, colGap: 0, rowGap: 0 });

  // Grid density — denser = more dramatic but heavier
  const COLS     = 32;
  const ROWS     = 20;
  const SPRING   = 0.14;   // restore speed
  const DAMPING  = 0.68;   // lower = bouncier ripple
  const RADIUS   = 140;    // px — cursor influence zone
  const STRENGTH = 28;     // max px displacement

  const getAcid = () => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--acid-rgb").trim() || "195,216,9";
    const [r = 195, g = 216, b = 9] = raw.split(",").map(Number);
    return { r, g, b };
  };

  const buildGrid = (W, H) => {
    const colGap = W / (COLS - 1);
    const rowGap = H / (ROWS - 1);
    dimsRef.current = { W, H, colGap, rowGap };
    const nodes = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const ox = col * colGap;
        const oy = row * rowGap;
        nodes.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
    nodesRef.current = nodes;
  };

  useEffect(() => {
    const canvas  = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");

    // ── Size canvas to match the section exactly ──────────────
    const sync = () => {
      const rect = section.getBoundingClientRect();
      const W    = section.offsetWidth;
      const H    = section.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
      buildGrid(W, H);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(section);

    // ── Physics loop ─────────────────────────────────────────
    const tick = () => {
      const nodes = nodesRef.current;
      const { x: mx, y: my } = mouseRef.current;
      const { W, H } = dimsRef.current;

      // Update physics
      for (const n of nodes) {
        let ax = (n.ox - n.x) * SPRING;
        let ay = (n.oy - n.y) * SPRING;
        const dx   = n.x - mx;
        const dy   = n.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < RADIUS && dist > 0.5) {
          const f = (1 - dist / RADIUS) * STRENGTH;
          ax += (dx / dist) * f;
          ay += (dy / dist) * f;
        }
        n.vx = (n.vx + ax) * DAMPING;
        n.vy = (n.vy + ay) * DAMPING;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      const { r, g, b } = getAcid();

      const distortion = (n) =>
        Math.min(1, (Math.abs(n.x - n.ox) + Math.abs(n.y - n.oy)) / STRENGTH);

      // Horizontal lines
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 1; col++) {
          const n0 = nodes[row * COLS + col];
          const n1 = nodes[row * COLS + col + 1];
          const d  = (distortion(n0) + distortion(n1)) / 2;
          const a  = 0.06 + d * 0.55;
          const lw = 0.5  + d * 1.8;
          ctx.beginPath();
          ctx.moveTo(n0.x, n0.y);
          ctx.lineTo(n1.x, n1.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth   = lw;
          ctx.stroke();
        }
      }

      // Vertical lines
      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS - 1; row++) {
          const n0 = nodes[row * COLS + col];
          const n1 = nodes[(row + 1) * COLS + col];
          const d  = (distortion(n0) + distortion(n1)) / 2;
          const a  = 0.06 + d * 0.55;
          const lw = 0.5  + d * 1.8;
          ctx.beginPath();
          ctx.moveTo(n0.x, n0.y);
          ctx.lineTo(n1.x, n1.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth   = lw;
          ctx.stroke();
        }
      }

      // Glowing dots at intersections near cursor
      for (const n of nodes) {
        const dist = Math.hypot(n.x - mx, n.y - my);
        if (dist < RADIUS * 0.7) {
          const glow = 1 - dist / (RADIUS * 0.7);
          ctx.beginPath();
          ctx.arc(n.x, n.y, glow * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${glow * 0.75})`;
          ctx.fill();

          // Extra outer soft glow
          if (glow > 0.5) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, glow * 8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${(glow - 0.5) * 0.15})`;
            ctx.fill();
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    // ── Mouse / touch tracking relative to the SECTION (not canvas) ──
    // canvas is position:absolute, so rect is the same as section, but
    // we track against section for safety.
    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const cx   = e.touches ? e.touches[0].clientX : e.clientX;
      const cy   = e.touches ? e.touches[0].clientY : e.clientY;
      mouseRef.current = { x: cx - rect.left, y: cy - rect.top };
    };
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };

    section.addEventListener("mousemove",  onMove,  { passive: true });
    section.addEventListener("touchmove",  onMove,  { passive: true });
    section.addEventListener("mouseleave", onLeave, { passive: true });
    section.addEventListener("touchend",   onLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      section.removeEventListener("mousemove",  onMove);
      section.removeEventListener("touchmove",  onMove);
      section.removeEventListener("mouseleave", onLeave);
      section.removeEventListener("touchend",   onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        0,
        display:       "block",
      }}
    />
  );
}

// ─── Single name row ────────────────────────────────────────────────────────────
function NameRow({ cert, index, isLast }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [hov, setHov] = useState(false);

  const indent = index % 3 === 0 ? 0 : index % 3 === 1 ? "6%" : "3%";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 8) * 0.045, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        paddingLeft:   indent,
        paddingTop:    "18px",
        paddingBottom: "18px",
        borderBottom:  isLast ? "none" : "1px solid rgba(var(--acid-rgb),0.07)",
        display:       "flex",
        alignItems:    "baseline",
        gap:           "20px",
        cursor:        "default",
        position:      "relative",
        overflow:      "hidden",
        transition:    "background 0.2s",
        background:    hov ? "rgba(var(--acid-rgb),0.03)" : "transparent",
      }}
    >
      <motion.div
        animate={{ scaleY: hov ? 1 : 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position:        "absolute",
          left: 0, top: 0, bottom: 0,
          width:           3,
          background:      "var(--acid)",
          transformOrigin: "top",
        }}
      />
      <span style={{
        fontFamily:    "'Bebas Neue', cursive",
        fontSize:      "0.85rem",
        letterSpacing: "0.1em",
        color:         hov ? "var(--acid)" : "rgba(var(--acid-rgb),0.18)",
        minWidth:      "2rem",
        transition:    "color 0.2s",
        userSelect:    "none",
        flexShrink:    0,
      }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span style={{
        fontFamily:    "'Bebas Neue', cursive",
        fontSize:      "clamp(1.25rem, 3vw, 2rem)",
        letterSpacing: "0.04em",
        lineHeight:    1,
        color:         hov ? "var(--acid)" : "var(--white)",
        transition:    "color 0.2s",
        flex:          1,
      }}>
        {cert.name}
      </span>
      <span className="cert-org" style={{
        fontFamily:    "'Barlow Condensed', sans-serif",
        fontSize:      "0.65rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color:         hov ? "rgba(var(--acid-rgb),0.55)" : "rgba(var(--white-rgb),0.15)",
        transition:    "color 0.2s",
        flexShrink:    0,
      }}>
        {cert.org}
      </span>
    </motion.div>
  );
}

// ─── Tab bar ────────────────────────────────────────────────────────────────────
function TabBar({ active, onChange, counts }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(var(--acid-rgb),0.1)", marginBottom: 48 }}>
      {TABS.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily:    "'Space Mono', monospace",
              fontSize:      "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding:       "10px 24px",
              border:        "none",
              borderBottom:  isActive ? "2px solid var(--acid)" : "2px solid transparent",
              background:    "transparent",
              color:         isActive ? "var(--acid)" : "rgba(var(--white-rgb),0.3)",
              cursor:        "pointer",
              transition:    "all 0.18s",
              display:       "flex",
              alignItems:    "center",
              gap:           10,
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--white)"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(var(--white-rgb),0.3)"; }}
          >
            {label}
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize:   "0.52rem",
              padding:    "1px 6px",
              border:     `1px solid ${isActive ? "rgba(var(--acid-rgb),0.5)" : "rgba(var(--acid-rgb),0.15)"}`,
              color:      isActive ? "var(--acid)" : "rgba(var(--white-rgb),0.25)",
              transition: "all 0.18s",
            }}>
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Marquee ticker ─────────────────────────────────────────────────────────────
function MarqueeTicker({ items }) {
  const repeated = [...items, ...items, ...items];
  return (
    <div style={{
      overflow:     "hidden",
      borderTop:    "1px solid rgba(var(--acid-rgb),0.1)",
      borderBottom: "1px solid rgba(var(--acid-rgb),0.1)",
      padding:      "10px 0",
      marginBottom: 52,
      position:     "relative",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 80,
        background: "linear-gradient(90deg, var(--dark), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 80,
        background: "linear-gradient(-90deg, var(--dark), transparent)",
        zIndex: 2, pointerEvents: "none",
      }} />
      <motion.div
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", whiteSpace: "nowrap" }}
      >
        {repeated.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
            <span style={{
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontSize:      "0.65rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(var(--white-rgb),0.45)",
              padding:       "0 28px",
            }}>{item}</span>
            <span style={{ color: "rgba(var(--acid-rgb),0.3)", fontSize: "0.45rem" }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────────
export default function Certifications() {
  const [activeTab, setActiveTab] = useState("certification");
  const sectionRef = useRef(null);

  const counts = {
    certification: certifications.filter(c => c.category === "certification").length,
    workshop:      certifications.filter(c => c.category === "workshop").length,
  };

  const visible = certifications.filter(c => c.category === activeTab);
  const orgs = [
  "Microsoft", "NPTEL", "Udemy", "AlgoZenith", "NIELIT",
  "LinkedIn Learning", 
  "HackerRank", "Microsoft", "NPTEL", "VirtuNexa", "AlgoZenith", "NIELIT",
  "LinkedIn Learning",
  "Udemy", "HackerRank"
];

  return (
    <section
      ref={sectionRef}
      id="certifications"
      style={{
        width:      "100%",
        padding:    "100px 6% 110px",
        background: "var(--dark)",
        position:   "relative",    // ← canvas positions against this
        overflow:   "hidden",
        fontFamily: "'Space Mono', monospace",
        transition: "background 0.4s ease",
      }}
    >
      {/* ── LIQUID METAL — full section background ─────────────────────── */}
      {/*   sectionRef passed so canvas measures section, not itself        */}
      <LiquidMetalCanvas sectionRef={sectionRef} />

      {/*
        Soft center-glow vignette: keeps grid visible at edges but fades toward
        content so text stays legible. Uses --dark-rgb → works in both themes.
      */}
      <div style={{
        position:      "absolute",
        inset:         0,
        pointerEvents: "none",
        zIndex:        1,
        background: [
          /* dark center so content is readable */
          "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(var(--dark-rgb),0.82) 0%, transparent 100%)",
          /* subtle edge darkening */
          "linear-gradient(to bottom, rgba(var(--dark-rgb),0.3) 0%, transparent 15%, transparent 85%, rgba(var(--dark-rgb),0.3) 100%)",
        ].join(","),
      }} />

     

      {/* ── All content at z-index 2 ────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: 52 }}
        >
          <div style={{
            fontFamily:    "'Barlow Condensed', sans-serif",
            fontSize:      "0.65rem",
            letterSpacing: "0.5em",
            color:         "var(--acid)",
            textTransform: "uppercase",
            display:       "flex",
            alignItems:    "center",
            gap:           14,
            marginBottom:  18,
            transition:    "color 0.3s",
          }}>
            <span style={{ fontFamily: "'Space Mono', monospace", opacity: 0.4, fontSize: "0.6rem" }}>05</span>
            <span>Credentials</span>
            <div style={{ height: 1, width: 60, background: "rgba(var(--acid-rgb),0.3)" }} />
          </div>

          <h2 style={{
            fontFamily:    "'Bebas Neue', cursive",
            fontSize:      "clamp(3.5rem, 7vw, 7rem)",
            lineHeight:    0.9,
            letterSpacing: "0.03em",
            color:         "var(--white)",
            margin:        0,
            transition:    "color 0.3s",
          }}>
            CERTS<br />
            <span style={{ color: "var(--acid)" }}>&amp; WORKSHOPS</span>
          </h2>
        </motion.div>

        {/* Marquee */}
        <MarqueeTicker items={orgs} />

        {/* Tabs */}
        <TabBar active={activeTab} onChange={setActiveTab} counts={counts} />

        {/* Name wall */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              border:     "1px solid rgba(var(--acid-rgb),0.1)",
              background: "rgba(var(--dark-rgb),0.4)",   /* slight glass so mesh shows through */
              backdropFilter: "blur(0px)",               /* intentionally 0 — don't blur the mesh */
            }}
          >
            {visible.length === 0 ? (
              <div style={{
                padding:       "80px 0",
                textAlign:     "center",
                color:         "rgba(var(--white-rgb),0.2)",
                fontFamily:    "'Space Mono', monospace",
                fontSize:      "0.75rem",
                letterSpacing: "0.15em",
              }}>
                // NO {activeTab.toUpperCase()}S ADDED YET
              </div>
            ) : (
              <>
                <div style={{
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "20px",
                  padding:      "10px 24px",
                  borderBottom: "1px solid rgba(var(--acid-rgb),0.12)",
                  background:   "rgba(var(--acid-rgb),0.03)",
                }}>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: "0.48rem",
                    letterSpacing: "0.3em", color: "rgba(var(--acid-rgb),0.35)",
                    textTransform: "uppercase", minWidth: "2rem",
                  }}>#</span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: "0.48rem",
                    letterSpacing: "0.3em", color: "rgba(var(--acid-rgb),0.35)",
                    textTransform: "uppercase", flex: 1,
                  }}>Name</span>
                  <span className="cert-org" style={{
                    fontFamily: "'Space Mono', monospace", fontSize: "0.48rem",
                    letterSpacing: "0.3em", color: "rgba(var(--acid-rgb),0.35)",
                    textTransform: "uppercase",
                  }}>Issuer</span>
                </div>

                <div style={{ padding: "0 24px" }}>
                  {visible.map((c, i) => (
                    <NameRow key={c.id} cert={c} index={i} isLast={i === visible.length - 1} />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            marginTop:      44,
            paddingTop:     28,
            borderTop:      "1px solid rgba(var(--acid-rgb),0.1)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            16,
          }}
        >
          <span style={{
            fontFamily:    "'Space Mono', monospace",
            fontSize:      "0.6rem",
            color:         "rgba(var(--white-rgb),0.2)",
            letterSpacing: "0.1em",
          }}>
            // {visible.length} {activeTab}{visible.length !== 1 ? "s" : ""}&nbsp;&nbsp;·&nbsp;&nbsp;
            <span style={{ color: "rgba(var(--acid-rgb),0.45)" }}>always learning</span>
          </span>
          <span style={{
            fontFamily:    "'Space Mono', monospace",
            fontSize:      "0.55rem",
            color:         "rgba(var(--white-rgb),0.1)",
            letterSpacing: "0.08em",
          }}>
            {certifications.length} total credentials
          </span>
        </motion.div>
      </div>

      <style>{`
  @keyframes cssRotateCW  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
  @keyframes cssRotateCCW { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
  @media (min-width: 640px) { .cert-org { display: block !important; } }
  @media (max-width: 639px) { .cert-org { display: none  !important; } }

  #certifications *::selection { background: transparent; }
  #certifications *::-moz-selection { background: transparent; }
  #certifications { -webkit-user-select: none; -moz-user-select: none; user-select: none; }
`}</style>
    </section>
  );
}