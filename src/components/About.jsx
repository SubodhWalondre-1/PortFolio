import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

/* ─────────────────────────────────────────────
   About.jsx
   - Default export: About section component
   - Named export:   SectionHeading (reusable by Experience.jsx etc.)
   - No global styles (body/nav/cursor handled by Home.jsx)
   - Fonts already loaded by Home.jsx via Google Fonts
───────────────────────────────────────────────*/

// ── CSS-in-JS styles ──────────────────────────
const S = {
  section: {
    position: "relative",
    background: "var(--darker)",
    overflow: "hidden",
    fontFamily: "'Space Mono', monospace",
    transition: "background 0.4s ease",
  },
  inner: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "120px 60px",
    position: "relative",
    zIndex: 1,
  },
  sectionLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.5em",
    color: "var(--acid)",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    transition: "color 0.3s",
  },
  labelNum: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.65rem",
    opacity: 0.4,
    color: "var(--acid)",
    transition: "color 0.3s",
  },
  labelLine: {
    height: 1,
    background: "rgba(var(--acid-rgb),0.3)",
    width: 80,
  },
  heading: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: "clamp(4rem, 8vw, 8rem)",
    lineHeight: 0.9,
    letterSpacing: "0.03em",
    color: "var(--white)",
    marginBottom: 60,
    margin: "0 0 60px 0",
    padding: 0,
    transition: "color 0.3s",
  },
  headingAccent: {
    color: "var(--acid)",
    transition: "color 0.3s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 80,
    alignItems: "start",
  },
  bioText: {
    fontSize: "0.82rem",
    lineHeight: 1.95,
    color: "rgba(var(--white-rgb),0.68)",
    marginBottom: 20,
    fontFamily: "'Space Mono', monospace",
  },
  strong: {
    color: "var(--acid)",
    fontWeight: 700,
    transition: "color 0.3s",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(var(--acid-rgb),0.08)",
    border: "1px solid rgba(var(--acid-rgb),0.35)",
    color: "var(--acid)",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    padding: "6px 14px",
    marginBottom: 28,
    transition: "color 0.3s, background 0.3s, border-color 0.3s",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--acid)",
    flexShrink: 0,
    transition: "background 0.3s",
  },
  techHeader: {
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.65rem",
    letterSpacing: "0.3em",
    color: "rgba(var(--acid-rgb),0.5)",
    textTransform: "uppercase",
    marginBottom: 14,
    marginTop: 28,
  },
  pillsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    background: "rgba(var(--acid-rgb),0.07)",
    border: "1px solid rgba(var(--acid-rgb),0.2)",
    color: "var(--acid)",
    padding: "4px 10px",
    cursor: "default",
    transition: "all 0.2s",
  },
  pillHover: {
    background: "rgba(var(--acid-rgb),0.18)",
    borderColor: "var(--acid)",
  },
  learningTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "1px solid rgba(var(--acid-rgb),0.3)",
    color: "rgba(var(--white-rgb),0.55)",
    fontFamily: "'Space Mono', monospace",
    fontSize: "0.65rem",
    padding: "6px 14px",
    marginTop: 10,
  },
  learningAccent: {
    color: "var(--acid)",
    transition: "color 0.3s",
  },
  canvasWrap: {
    position: "relative",
    height: 420,
    border: "3px solid var(--acid)",
    overflow: "hidden",
    background: "var(--darkest)",
    transition: "border-color 0.3s, background 0.3s",
  },
  canvasLabel: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "var(--acid)",
    color: "var(--acid-fg)",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "0.65rem",
    letterSpacing: "0.3em",
    padding: "6px 12px",
    textTransform: "uppercase",
    zIndex: 2,
    transition: "background 0.3s, color 0.3s",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    marginTop: 60,
    border: "3px solid var(--acid)",
    transition: "border-color 0.3s",
  },
  statBlock: {
    padding: "30px 24px",
    borderRight: "3px solid var(--acid)",
    background: "var(--dark)",
    transition: "background 0.3s, border-color 0.3s",
  },
  statBlockLast: {
    padding: "30px 24px",
    background: "var(--dark)",
    transition: "background 0.3s",
  },
  statNum: {
    fontFamily: "'Bebas Neue', cursive",
    fontSize: "3.8rem",
    color: "var(--acid)",
    lineHeight: 1,
    display: "block",
    transition: "color 0.3s",
  },
  statLabel: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontSize: "0.68rem",
    letterSpacing: "0.3em",
    color: "rgba(var(--white-rgb),0.45)",
    textTransform: "uppercase",
    marginTop: 6,
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    backgroundImage:
      "linear-gradient(rgba(var(--acid-rgb),0.03) 1px, transparent 1px)," +
      "linear-gradient(90deg, rgba(var(--acid-rgb),0.03) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    zIndex: 0,
  },
};

// ── Data ──────────────────────────────────────
const TECH = [
  "Python", "FastAPI", "Django", "HTML", "CSS",
  "JavaScript", "React.js", "SQLite", "PostgreSQL",
];
const TECH2 = [
  "Machine Learning", "TensorFlow.js", "WebSocket", "Authentication", "Redis",
];
const LEARNING = "Node.js · MongoDB";

const STATS = [
  { num: "6th", label: "Semester\nS.B. Jain, Nagpur" },
  { num: "10+", label: "Projects Built\nFull-stack & AI/ML" },
  { num: "5+",  label: "Certifications\nMicrosoft · NPTEL" },
];

// ─────────────────────────────────────────────
// ParticleCanvas — sphere confined, no overflow
// ─────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const rafRef    = useRef(null);
  const { dark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Derive colors directly from dark boolean to avoid race condition
    // (CSS variable may not yet be updated when this effect runs)
    const acidHex  = dark ? '#C3D809' : '#CD0000';
    const whiteHex = dark ? '#F5F5F0' : '#1a1a1a';

    const N = 700;
    const particles = [];

    function buildParticles() {
      particles.length = 0;
      const cx   = W() / 2;
      const cy   = H() / 2;
      const maxR = Math.min(W(), H()) * 0.38;

      for (let i = 0; i < N; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = maxR * Math.cbrt(Math.random());
        const x     = cx + r * Math.sin(phi) * Math.cos(theta);
        const y     = cy + r * Math.sin(phi) * Math.sin(theta) * 0.72;

        // Parse white color for rgba
        const wR = parseInt(whiteHex.slice(1,3), 16) || 245;
        const wG = parseInt(whiteHex.slice(3,5), 16) || 245;
        const wB = parseInt(whiteHex.slice(5,7), 16) || 240;

        particles.push({
          ox: x, oy: y, x, y,
          vx: 0, vy: 0,
          size:       Math.random() * 1.8 + 0.4,
          alpha:      0.35 + Math.random() * 0.65,
          color:      Math.random() < 0.28
            ? acidHex
            : `rgba(${wR},${wG},${wB},${(0.25 + Math.random() * 0.5).toFixed(2)})`,
          phase:      Math.random() * Math.PI * 2,
          floatAmp:   0.3 + Math.random() * 0.7,
          floatSpeed: 0.4 + Math.random() * 0.8,
          maxR, cx, cy,
        });
      }
    }
    buildParticles();

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    // Derive acid-rgb directly from dark boolean
    const acidRgb = dark ? '195,216,9' : '205,0,0';

    let t = 0;
    let isVisible = true;
    function draw() {
      if (!isVisible) { rafRef.current = null; return; }
      ctx.clearRect(0, 0, W(), H());

      // subtle center glow
      const grad = ctx.createRadialGradient(
        W() / 2, H() / 2, 0,
        W() / 2, H() / 2, W() * 0.4
      );
      grad.addColorStop(0,   `rgba(${acidRgb},0.05)`);
      grad.addColorStop(0.5, `rgba(${acidRgb},0.01)`);
      grad.addColorStop(1,   "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W(), H());

      t += 0.012;

      particles.forEach((p) => {
        // float target
        const tx = p.ox + Math.cos(t * p.floatSpeed + p.phase) * p.floatAmp;
        const ty = p.oy + Math.sin(t * p.floatSpeed * 0.7 + p.phase) * p.floatAmp;

        // mouse repulsion
        const dx   = mouseRef.current.x - p.x;
        const dy   = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 70 && dist > 0) {
          const force = ((70 - dist) / 70) * 2.2;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }

        // spring back
        p.vx += (tx - p.x) * 0.04;
        p.vy += (ty - p.y) * 0.04;
        p.vx *= 0.88;
        p.vy *= 0.88;

        // ── sphere boundary clamp ──
        const ndx = p.x + p.vx - p.cx;
        const ndy = p.y + p.vy - p.cy;
        const nd  = Math.sqrt(ndx * ndx + ndy * ndy);

        if (nd > p.maxR) {
          p.x = p.cx + (ndx / nd) * p.maxR;
          p.y = p.cy + (ndy / nd) * p.maxR;
          const dot = p.vx * (ndx / nd) + p.vy * (ndy / nd);
          p.vx -= 2 * dot * (ndx / nd);
          p.vy -= 2 * dot * (ndy / nd);
          p.vx *= 0.4;
          p.vy *= 0.4;
        } else {
          p.x += p.vx;
          p.y += p.vy;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle  = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha  = 1;
      rafRef.current   = requestAnimationFrame(draw);
    }
    draw();

    // Pause when off-screen
    const visObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafRef.current) draw();
      },
      { threshold: 0 }
    );
    visObserver.observe(canvas.parentElement);

    // resize observer — keeps canvas crisp on resize
    const ro = new ResizeObserver(() => { resize(); buildParticles(); });
    ro.observe(canvas.parentElement);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      visObserver.disconnect();
      ro.disconnect();
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─────────────────────────────────────────────
// Pill with hover state
// ─────────────────────────────────────────────
function Pill({ label }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      style={{ ...S.pill, ...(hov ? S.pillHover : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// StatBlock
// ─────────────────────────────────────────────
function StatBlock({ num, label, last }) {
  return (
    <div style={last ? S.statBlockLast : S.statBlock}>
      <span style={S.statNum}>{num}</span>
      <div style={S.statLabel}>
        {label.split("\n").map((line, i) => (
          <span key={i} style={{ display: "block" }}>{line}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SectionHeading — NAMED EXPORT
// Use in Experience.jsx, Skills.jsx, etc.:
//   import { SectionHeading } from './About'
// ─────────────────────────────────────────────
export function SectionHeading({ num, label }) {
  return (
    <div style={S.sectionLabel}>
      <span style={S.labelNum}>{num}</span>
      <span>{label}</span>
      <div style={S.labelLine} />
    </div>
  );
}

// ─────────────────────────────────────────────
// About — DEFAULT EXPORT
// ─────────────────────────────────────────────
export default function About() {
  const leftRef  = useRef(null);
  const rightRef = useRef(null);

  // scroll-reveal
  useEffect(() => {
    const els = [leftRef.current, rightRef.current].filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity   = "1";
            entry.target.style.transform = "translateX(0)";
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* scoped styles — only about-section internals, no globals */}
      <style>{`
        @keyframes aboutBadgePulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(0.7); }
        }
        #about-section * { box-sizing: border-box; }
        @media (max-width: 900px) {
          #about-grid  { grid-template-columns: 1fr !important; gap: 40px !important; }
          #about-stats { grid-template-columns: 1fr !important; }
          #about-stats > div {
            border-right: none !important;
            border-bottom: 3px solid var(--acid) !important;
          }
          #about-section .about-inner {
            padding: 80px 24px !important;
          }
        }
        
        #about-section *::selection {
    background: transparent;
  }
  #about-section *::-moz-selection {
    background: transparent;
  }
  #about-section {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
      
      `}</style>

      <section id="about-section" style={S.section}>

        {/* subtle grid texture */}
        <div style={S.gridOverlay} />

        <div className="about-inner" style={S.inner}>

          {/* ── section label ── */}
          <div style={S.sectionLabel}>
            <span style={S.labelNum}>01</span>
            <span>About</span>
            <div style={S.labelLine} />
          </div>

          {/* ── giant heading ── */}
          <h2 style={S.heading}>
            WHO<br />
            AM <span style={S.headingAccent}>I?</span>
          </h2>

          {/* ── 2-col grid ── */}
          <div id="about-grid" style={S.grid}>

            {/* LEFT — bio */}
            <div
              ref={leftRef}
              style={{
                opacity: 0,
                transform: "translateX(-40px)",
                transition: "opacity 0.85s ease, transform 0.85s ease",
              }}
            >
              {/* Open to Work badge */}
              <div style={S.badge}>
                <span
                  style={{
                    ...S.badgeDot,
                    animation: "aboutBadgePulse 1.5s ease-in-out infinite",
                  }}
                />
                Open to Work
              </div>

              {/* Bio — content from Image 1 */}
              <p style={S.bioText}>
                I'm a{" "}
                <strong style={S.strong}>Computer Science undergraduate</strong>{" "}
                specialising in Artificial Intelligence &amp; Machine Learning at{" "}
                <strong style={S.strong}>
                  S.B. Jain Institute of Technology, Management &amp; Research, Nagpur.
                </strong>{" "}
                My academic journey has been driven by a deep curiosity about how
                machines understand language and how full-stack systems can bring
                that understanding to real users.
              </p>

              <p style={S.bioText}>
                Over the past two years I've built production-grade systems spanning{" "}
                <strong style={S.strong}>Anti-Proxy attendance (AttendFlow)</strong>,
                an AI-powered budget planner that learns your spending patterns, and a
                browser-based digit recognition engine using{" "}
                <strong style={S.strong}>TensorFlow.js</strong> — each project pushing
                me to close the gap between research and real-world deployment.
              </p>

              <p style={S.bioText}>
  Beyond code, I actively participate in hackathons, where tight deadlines and
  ambiguous problem statements sharpen my ability to design, build, and ship
  under pressure.
</p>

              <p style={S.bioText}>
                When I'm not pushing commits, I keep myself sharp — following industry
                trends, catching tech podcasts, and staying current with what's shipping
                in the AI and web space. If it's new and useful,{" "}
                <strong style={S.strong}>I want to know about it first.</strong>
              </p>

              {/* Tech stack */}
              <div style={S.techHeader}>// Tech I work with</div>
              <div style={S.pillsWrap}>
                {TECH.map((t) => <Pill key={t} label={t} />)}
              </div>
              <div style={S.pillsWrap}>
                {TECH2.map((t) => <Pill key={t} label={t} />)}
              </div>

              {/* Currently learning */}
              <div style={S.learningTag}>
                <span style={{ opacity: 0.5 }}>⌗</span>
                <span>Currently learning:&nbsp;</span>
                <span style={S.learningAccent}>{LEARNING}</span>
              </div>
            </div>

            {/* RIGHT — particle canvas */}
            <div
              ref={rightRef}
              style={{
                opacity: 0,
                transform: "translateX(40px)",
                transition: "opacity 0.85s ease 0.2s, transform 0.85s ease 0.2s",
              }}
            >
              <div style={S.canvasWrap}>
                <ParticleCanvas />
                <div style={S.canvasLabel}>Particle System</div>
              </div>
            </div>

          </div>

          {/* ── Stats row ── */}
          <div id="about-stats" style={S.statsRow}>
            {STATS.map((s, i) => (
              <StatBlock
                key={s.num}
                num={s.num}
                label={s.label}
                last={i === STATS.length - 1}
              />
            ))}

          
          </div>

        </div>
      </section>
    </>
  );
}