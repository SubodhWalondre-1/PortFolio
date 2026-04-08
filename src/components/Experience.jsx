// src/components/Experience.jsx
import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading } from "./About";
import { experiences } from "../data/experience";

// ─── Accent colour — uses CSS vars ────────────────────────────────────────
const ACCENT = {
  cyan:   { fg: "var(--acid)", bg: "rgba(var(--acid-rgb),0.07)",  border: "rgba(var(--acid-rgb),0.28)" },
  orange: { fg: "var(--white)", bg: "rgba(var(--white-rgb),0.05)", border: "rgba(var(--white-rgb),0.18)" },
};

// ─── Nano Assembly Canvas ──────────────────────────────────────────────────────
// Confined to the Experience section only. Uses position:absolute so it
// doesn't overlay other sections. Trail uses clearRect (transparent), not fill.
function NanoAssemblyCanvas({ sectionRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas  = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    const NUM_BOTS = 60;

    let W = section.offsetWidth;
    let H = section.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    // Mouse tracked relative to the SECTION (not window)
    let mouseX = W / 2;
    let mouseY = H / 2;
    let cursorSpeed   = 0;
    let lastMoveTime  = Date.now();
    let assembleProgress = 0;
    let hasMouseMoved = false;
    let animId;

    function getThemeColors() {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      return isLight
        ? {
            botBright:  "rgba(205,0,0,1)",
            botDim:     "rgba(160,30,30,0.6)",
            line1:      "205,0,0",
            line2:      "180,20,20",
            line3:      "150,10,10",
            cursor:     "rgba(205,0,0,0.9)",
            cursorRing: "rgba(205,0,0,0.3)",
          }
        : {
            botBright:  "rgba(195,216,9,1)",
            botDim:     "rgba(160,180,8,0.6)",
            line1:      "195,216,9",
            line2:      "170,190,8",
            line3:      "140,160,6",
            cursor:     "rgba(195,216,9,0.9)",
            cursorRing: "rgba(195,216,9,0.3)",
          };
    }

    // Init bots spread across section
    const bots = Array.from({ length: NUM_BOTS }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
    }));

    function getTarget(i) {
      const cx = mouseX, cy = mouseY;
      let angle, radius;
      if      (i < 6)  { angle = (i / 6) * Math.PI * 2 - Math.PI / 6;                       radius = 55; }
      else if (i < 12) { angle = ((i - 6)  / 6) * Math.PI * 2 - Math.PI / 6 + Math.PI / 6; radius = 55; }
      else if (i < 18) { angle = ((i - 12) / 6) * Math.PI * 2;                              radius = 30; }
      else if (i < 24) { angle = ((i - 18) / 6) * Math.PI * 2 + Math.PI / 6;                radius = 30; }
      else if (i < 30) { angle = ((i - 24) / 6) * Math.PI * 2;                              radius = 42; }
      else if (i < 36) { angle = ((i - 30) / 6) * Math.PI * 2 + Math.PI / 6;                radius = 15; }
      else             { angle = (i / 60) * Math.PI * 2 * 3; radius = ((i % 20) / 20) * 20; }
      return { tx: cx + Math.cos(angle) * radius, ty: cy + Math.sin(angle) * radius };
    }

    function drawHex(cx, cy, r, color, lw) {
      ctx.beginPath();
      for (let v = 0; v < 6; v++) {
        const a = (v / 6) * Math.PI * 2 - Math.PI / 6;
        v === 0
          ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
          : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.stroke();
    }

    function drawSpokes(cx, cy, r, color, lw) {
      ctx.strokeStyle = color;
      ctx.lineWidth   = lw;
      for (let v = 0; v < 6; v++) {
        const a = (v / 6) * Math.PI * 2 - Math.PI / 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.stroke();
      }
    }

    function frame() {
      animId = requestAnimationFrame(frame);
      const delta = Date.now() - lastMoveTime;
      const c     = getThemeColors();

      // Assemble only after mouse has entered section AND been still 400ms
      if (hasMouseMoved && delta > 400) {
        assembleProgress = Math.min(1, assembleProgress + 0.04);
      } else {
        assembleProgress = Math.max(0, assembleProgress - 0.06);
      }

      // ── Clear canvas fully transparent each frame — no page overlay ──
      ctx.clearRect(0, 0, W, H);

      // Motion trail: semi-transparent rect drawn OVER previous frame
      // but only on canvas pixels — section bg shows through
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W, H);

      // Structure lines
      if (assembleProgress > 0.3) {
        const alpha = (assembleProgress - 0.3) / 0.7;
        drawHex(mouseX, mouseY, 55, `rgba(${c.line1},${(alpha * 0.5).toFixed(2)})`, 0.8);
        drawHex(mouseX, mouseY, 30, `rgba(${c.line2},${(alpha * 0.4).toFixed(2)})`, 0.6);
        drawSpokes(mouseX, mouseY, 55, `rgba(${c.line3},${(alpha * 0.3).toFixed(2)})`, 0.5);
      }

      // Bots
      bots.forEach((b, i) => {
        const { tx, ty } = getTarget(i);
        const dist        = Math.hypot(tx - b.x, ty - b.y);
        const isAssembled = dist < 6 && assembleProgress > 0.75;

        if (assembleProgress > 0.01) {
          b.vx += (tx - b.x) * 0.06 * assembleProgress;
          b.vy += (ty - b.y) * 0.06 * assembleProgress;
          b.vx *= 0.72;
          b.vy *= 0.72;
        } else {
          b.vx += (Math.random() - 0.5) * 0.5;
          b.vy += (Math.random() - 0.5) * 0.5;
          if (cursorSpeed > 2) {
            b.vx += (Math.random() - 0.5) * cursorSpeed * 0.12;
            b.vy += (Math.random() - 0.5) * cursorSpeed * 0.12;
          }
          b.vx *= 0.97;
          b.vy *= 0.97;
        }

        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 2)     { b.x = 2;     b.vx *= -0.6; }
        if (b.x > W - 2) { b.x = W - 2; b.vx *= -0.6; }
        if (b.y < 2)     { b.y = 2;     b.vy *= -0.6; }
        if (b.y > H - 2) { b.y = H - 2; b.vy *= -0.6; }

        ctx.fillStyle = isAssembled ? c.botBright : c.botDim;
        ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
      });

      // Custom cursor dot (only inside section)
      if (hasMouseMoved) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
        ctx.fillStyle = c.cursor;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 7, 0, Math.PI * 2);
        ctx.strokeStyle = c.cursorRing;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      cursorSpeed *= 0.85;
    }

    // Track mouse relative to section bounding rect
    const onMove = (e) => {
      const rect = section.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      cursorSpeed   = Math.hypot(x - mouseX, y - mouseY);
      mouseX        = x;
      mouseY        = y;
      lastMoveTime  = Date.now();
      hasMouseMoved = true;
    };

    const onLeave = () => {
      hasMouseMoved = false;
      assembleProgress = 0;
    };

    const onResize = () => {
      W = section.offsetWidth;
      H = section.offsetHeight;
      canvas.width  = W;
      canvas.height = H;
    };

    section.addEventListener("mousemove",  onMove,   { passive: true });
    section.addEventListener("mouseleave", onLeave,  { passive: true });
    window.addEventListener("resize",      onResize);
    frame();

    return () => {
      cancelAnimationFrame(animId);
      section.removeEventListener("mousemove",  onMove);
      section.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize",      onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",   // ← confined to section, NOT fixed
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        zIndex:        0,            // ← behind content
        display:       "block",
      }}
    />
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
function TypeBadge({ type, accent }) {
  const { fg, bg, border } = ACCENT[accent] ?? ACCENT.cyan;
  return (
    <span style={{
      fontFamily:    "'Space Mono', monospace",
      fontSize:      10.5,
      padding:       "3px 10px",
      borderRadius:  20,
      background:    bg,
      border:        `1px solid ${border}`,
      color:         fg,
      letterSpacing: 0.4,
    }}>
      {type}
    </span>
  );
}

// ─── Tag pill ──────────────────────────────────────────────────────────────────
function Tag({ label }) {
  return (
    <span
      style={{
        fontFamily:   "'Space Mono', monospace",
        fontSize:     11,
        padding:      "3px 10px",
        borderRadius: 6,
        background:   "rgba(var(--acid-rgb),0.06)",
        border:       "1px solid rgba(var(--acid-rgb),0.18)",
        color:        "rgba(var(--white-rgb),0.5)",
        display:      "inline-block",
        transition:   "all 0.2s",
        cursor:       "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--acid)";
        e.currentTarget.style.color       = "var(--acid)";
        e.currentTarget.style.background  = "rgba(var(--acid-rgb),0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(var(--acid-rgb),0.18)";
        e.currentTarget.style.color       = "rgba(var(--white-rgb),0.5)";
        e.currentTarget.style.background  = "rgba(var(--acid-rgb),0.06)";
      }}
    >
      {label}
    </span>
  );
}

// ─── Experience card ───────────────────────────────────────────────────────────
function ExperienceCard({ exp, side, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const isLeft = side === "left";
  const accent = ACCENT[exp.accent] ?? ACCENT.cyan;

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <motion.div
        initial={{ opacity: 0, x: isLeft ? -48 : 48 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.65, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background:   "var(--card-bg)",
          border:       "1px solid rgba(var(--acid-rgb),0.15)",
          borderRadius: 0,
          padding:      "28px 30px",
          position:     "relative",
          transition:   "border-color 0.3s, box-shadow 0.3s, background 0.3s",
        }}
        whileHover={{
          borderColor: "var(--acid)",
          boxShadow:   "0 8px 40px rgba(var(--acid-rgb),0.12)",
          y: -3,
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 14,
        }}>
          <TypeBadge type={exp.type} accent={exp.accent} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(var(--white-rgb),0.4)" }}>
            📅 {exp.dateRange}
          </span>
        </div>

        <h3 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(1.3rem, 2.2vw, 1.7rem)",
          fontWeight: 400, letterSpacing: "0.04em", color: "var(--white)",
          marginBottom: 4, lineHeight: 1.2, transition: "color 0.3s",
        }}>
          {exp.role}
        </h3>

        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          {exp.orgUrl
            ? <a href={exp.orgUrl} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'Space Mono', monospace", fontSize: 12,
                color: accent.fg, textDecoration: "none", transition: "opacity 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.65"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >{exp.org} ↗</a>
            : <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: accent.fg }}>{exp.org}</span>
          }
          <span style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(var(--white-rgb),0.35)", padding: "2px 8px",
            border: "1px solid rgba(var(--acid-rgb),0.15)",
          }}>
            {exp.location}
          </span>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
          {exp.bullets.map((b, i) => (
            <li key={i} style={{
              display: "flex", gap: 10, marginBottom: 10,
              fontSize: 13.5, lineHeight: 1.85,
              color: "rgba(var(--white-rgb),0.6)", fontFamily: "'Space Mono', monospace",
            }}>
              <span style={{ color: "var(--acid)", flexShrink: 0, marginTop: "0.35em", fontSize: 8 }}>▶</span>
              {b}
            </li>
          ))}
        </ul>

        {exp.tags?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {exp.tags.map(t => <Tag key={t} label={t} />)}
          </div>
        )}

        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 3, background: "var(--acid)", opacity: 0.5, transition: "background 0.3s",
        }} />

        <div className={isLeft ? "notch-right" : "notch-left"} style={{
          position: "absolute", top: 32, width: 0, height: 0,
          borderTop: "8px solid transparent", borderBottom: "8px solid transparent",
        }} />
      </motion.div>
    </div>
  );
}

// ─── Timeline dot ──────────────────────────────────────────────────────────────
function TimelineDot({ accent, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const fg     = (ACCENT[accent] ?? ACCENT.cyan).fg;

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 30 }}>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.1 + index * 0.1, type: "spring", stiffness: 200 }}
        style={{
          position: "relative", width: 16, height: 16, borderRadius: "50%",
          background: fg, boxShadow: `0 0 0 4px var(--darker), 0 0 0 6px rgba(var(--acid-rgb),0.4)`,
          zIndex: 2, flexShrink: 0, transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        <motion.div
          animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.4 }}
          style={{
            position: "absolute", inset: -4, borderRadius: "50%",
            border: `1.5px solid var(--acid)`,
          }}
        />
      </motion.div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function Experience() {
  const sectionRef = useRef(null);
  const lineRef    = useRef(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="experience"
      style={{
        width:      "100%",
        padding:    "110px 6%",
        background: "var(--dark)",
        position:   "relative",   // ← canvas positions against this
        overflow:   "hidden",
        fontFamily: "'Space Mono', monospace",
        transition: "background 0.4s ease",
        cursor:     "none",       // hide native cursor only in this section
      }}
    >
      {/* Canvas confined to section — position:absolute, z-index:0 */}
      <NanoAssemblyCanvas sectionRef={sectionRef} />

      {/* Content above canvas */}
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.7rem",
          letterSpacing: "0.5em", color: "var(--acid)", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 16, marginBottom: 24, transition: "color 0.3s",
        }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", opacity: 0.4, color: "var(--acid)" }}>03</span>
          <span>Experience</span>
          <div style={{ height: 1, background: "rgba(var(--acid-rgb),0.3)", width: 80 }} />
        </div>

        <h2 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: "clamp(4rem, 8vw, 8rem)",
          lineHeight: 0.9, letterSpacing: "0.03em", color: "var(--white)",
          marginBottom: 60, transition: "color 0.3s",
        }}>
          WHAT I'VE<br />
          <span style={{ color: "var(--acid)" }}>BUILT</span>
        </h2>

        <div className="timeline-root" style={{ position: "relative" }}>

          <div ref={lineRef} className="timeline-line-desktop" style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: 2, transform: "translateX(-50%)",
            background: "rgba(var(--acid-rgb),0.15)", zIndex: 0,
          }}>
            <motion.div
              initial={{ scaleY: 0 }}
              animate={lineInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.6, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(to bottom, var(--acid), rgba(var(--acid-rgb),0.3), var(--acid))`,
                transformOrigin: "top center", opacity: 0.7,
              }}
            />
          </div>

          {experiences.map((exp, i) => {
            const side = i % 2 === 0 ? "left" : "right";
            return (
              <div key={exp.id} className="timeline-row" style={{
                display: "grid", gridTemplateColumns: "1fr 48px 1fr",
                gap: "0 0", marginBottom: i < experiences.length - 1 ? 32 : 0, alignItems: "start",
              }}>
                <div style={{ padding: "0 24px 0 0" }}>
                  {side === "left" && <ExperienceCard exp={exp} side="left" index={i} />}
                </div>
                <TimelineDot accent={exp.accent} index={i} />
                <div style={{ padding: "0 0 0 24px" }}>
                  {side === "right" && <ExperienceCard exp={exp} side="right" index={i} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
  @media (max-width: 768px) {
    .timeline-line-desktop { display: none !important; }
    .timeline-row { grid-template-columns: 28px 1fr !important; }
    .timeline-row > div:first-child { display: none !important; }
    .timeline-row > div:last-child  { padding: 0 0 0 16px !important; }
    .timeline-root::before {
      content: ''; position: absolute; left: 7px; top: 0; bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--acid), rgba(var(--acid-rgb),0.3));
      opacity: 0.5;
    }
  }
  @media (min-width: 769px) {
    .notch-right { right: -8px; border-left: 8px solid var(--darker); }
    .notch-left  { left:  -8px; border-right: 8px solid var(--darker); }
  }

  #experience *::selection {
    background: transparent;
  }
  #experience *::-moz-selection {
    background: transparent;
  }
  #experience {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
`}</style>
    </section>
  );
}