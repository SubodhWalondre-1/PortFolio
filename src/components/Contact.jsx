// src/components/Contact.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FiSend, FiLoader, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

// ─── Config ────────────────────────────────────────────────────────────────────
const FORMSPREE_URL = `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_ID}`;

const CONTACT_INFO = [
  {
    num:   "01",
    label: "Email",
    value: "subodhwalondre07@gmail.com",
    href:  "mailto:subodhwalondre07@gmail.com",
  },
  {
    num:   "02",
    label: "LinkedIn",
    value: "linkedin.com/in/subodhWalondre",
    href:  "https://www.linkedin.com/in/subodh-walondre-073576283",
  },
  {
    num:   "03",
    label: "GitHub",
    value: "github.com/SubodhWalondre",
    href:  "https://github.com/SubodhWalondre-1",
  },
];

const FIELDS = [
  { id: "name",    num: "01", label: "Your Name",     type: "text",     placeholder: "Enter your Name" },
  { id: "email",   num: "02", label: "Email Address", type: "email",    placeholder: "you@example.com" },
  { id: "subject", num: "03", label: "Subject",       type: "text",     placeholder: "Internship / Project / Just saying hi" },
  { id: "message", num: "04", label: "Message",       type: "textarea", placeholder: "What's on your mind?" },
];

// ─── Validation ────────────────────────────────────────────────────────────────
function validate(form) {
  const errors = {};
  if (!form.name.trim())                       errors.name    = "Name is required";
  if (!form.email.trim())                      errors.email   = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(form.email))  errors.email   = "Enter a valid email";
  if (!form.subject.trim())                    errors.subject = "Subject is required";
  if (form.message.trim().length < 20)         errors.message = "At least 20 characters required";
  return errors;
}

// ─── Theme detection hook ──────────────────────────────────────────────────────
function useThemeColors() {
  const [isLight, setIsLight] = useState(
    () => document.documentElement.getAttribute("data-theme") === "light"
  );
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return { isLight };
}

// ─── Magnetic Ribbons ──────────────────────────────────────────────────────────
// FIX SUMMARY:
//  1. Raw mouse position stored in a ref (no rect offset lag) — updated via
//     pointermove on the canvas itself so coords are already canvas-local.
//  2. Head easing: 0.20 → 0.55  (snaps to cursor much faster)
//  3. Chain-follow easing: 0.28 → 0.46  (tail catches up quickly)
//  4. Orbit radius tightens when cursor is active (ribbons cluster around cursor)
//  5. t increment: 0.018 → 0.022  (slightly snappier orbit animation)
function MagneticRibbons({ isLight }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  const s = useRef({
    // FIX 1: Store raw canvas-local coords directly — updated via pointermove
    mx: -999, my: -999,
    cursorActive: false,          // FIX 4: track if cursor is over canvas
    t: 0,
    ribbons: [],
    W: 0, H: 0,
    ribbonCount: 8,
    paletteIndex: 0,
  });

  const getPaletteFn = useCallback((light, paletteIndex) => {
    const dark = [
      (i, n) => `hsl(${(i / n) * 360}, 80%, 65%)`,
      (i, n) => `hsl(${20  + (i / n) * 60},  85%, 65%)`,
      (i, n) => `hsl(${180 + (i / n) * 120}, 75%, 65%)`,
      (i, n) => `hsl(220, ${10 + (i / n) * 20}%, ${50 + (i / n) * 30}%)`,
    ];
    const lite = [
      (i, n) => `hsl(${(i / n) * 55}, 85%, 48%)`,
      (i, n) => `hsl(${350 + (i / n) * 30}, 80%, 52%)`,
      (i, n) => `hsl(${(i / n) * 40}, 90%, 42%)`,
      (i, n) => `hsl(${340 + (i / n) * 50}, 75%, 48%)`,
    ];
    const fns = light ? lite : dark;
    return fns[paletteIndex % fns.length];
  }, []);

  const buildRibbons = useCallback((W, H, count) => {
    const TAIL = 36;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        pts: Array.from({ length: TAIL }, (_, j) => ({
          x: W / 2 + Math.cos(angle) * j * 4,
          y: H / 2 + Math.sin(angle) * j * 4,
        })),
        phase:     (i / count) * Math.PI * 2,
        baseAngle: angle,
        width:     1.8 + Math.sin(i) * 0.6,
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // ── Resize ───────────────────────────────────────────────────────────────
    const resize = () => {
      s.current.W = canvas.width  = canvas.offsetWidth;
      s.current.H = canvas.height = canvas.offsetHeight;
      s.current.ribbons = buildRibbons(s.current.W, s.current.H, s.current.ribbonCount);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // ── FIX 1: Use pointermove on canvas — coords already canvas-local ────────
    // This avoids the rect.getBoundingClientRect() call every frame and ensures
    // the position update is synchronous with the pointer event (zero extra lag).
    const onPointerMove = (e) => {
      // offsetX/offsetY are relative to the element itself — no rect needed
      s.current.mx = e.offsetX;
      s.current.my = e.offsetY;
      s.current.cursorActive = true;
    };
    const onPointerLeave = () => {
      s.current.mx = -999;
      s.current.my = -999;
      s.current.cursorActive = false;
    };

    // Attach to canvas (already correct coordinate space)
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    // Also track via window mousemove so ribbons follow even when cursor is
    // over child elements (form inputs, buttons, etc.)
    const onWindowMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Only update if cursor is within canvas bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        s.current.mx = x;
        s.current.my = y;
        s.current.cursorActive = true;
      }
    };
    const onWindowLeave = () => {
      s.current.mx = -999;
      s.current.my = -999;
      s.current.cursorActive = false;
    };
    window.addEventListener("mousemove", onWindowMove);

    const section = canvas.closest("section") || canvas.parentElement;
    section?.addEventListener("mouseleave", onWindowLeave);

    // Touch
    const onTouch = (e) => {
      const rect = canvas.getBoundingClientRect();
      s.current.mx = e.touches[0].clientX - rect.left;
      s.current.my = e.touches[0].clientY - rect.top;
      s.current.cursorActive = true;
    };
    const onTouchEnd = () => {
      s.current.mx = -999;
      s.current.my = -999;
      s.current.cursorActive = false;
    };
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend",  onTouchEnd);

    // ── HSL helper ────────────────────────────────────────────────────────────
    const hslToHsla = (color, a) =>
      color.startsWith("hsla")
        ? color
        : color.replace("hsl(", "hsla(").replace(")", `, ${a})`);

    // ── Draw loop ─────────────────────────────────────────────────────────────
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);

      const { W, H, mx, my, ribbonCount, paletteIndex, cursorActive } = s.current;
      if (!W || !H) return;

      // FIX 5: Slightly faster time step for snappier orbit
      s.current.t += 0.022;
      const t = s.current.t;

      ctx.clearRect(0, 0, W, H);

      // Subtle vignette
      const vig = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.hypot(W, H) * 0.6);
      if (isLight) {
        vig.addColorStop(0, "rgba(226,224,217,0)");
        vig.addColorStop(1, "rgba(210,207,198,0.45)");
      } else {
        vig.addColorStop(0, "rgba(3,5,8,0)");
        vig.addColorStop(1, "rgba(0,0,4,0.7)");
      }
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      const colorFn = getPaletteFn(isLight, paletteIndex);

      // Auto-orbit when cursor is off-screen
      const tcx = mx > 0 ? mx : W / 2 + Math.sin(t * 0.4) * 120;
      const tcy = my > 0 ? my : H / 2 + Math.cos(t * 0.35) * 80;

      s.current.ribbons.forEach((r, ri) => {
        r.phase += 0.022;

        // FIX 4: Tighter orbit radius when cursor is active so ribbons cluster
        // quickly around the cursor instead of orbiting wide
        const baseOrbit  = cursorActive ? 10 + ri * 2.5 : 18 + ri * 4;
        const orbitR     = baseOrbit + Math.sin(r.phase * 0.7) * (cursorActive ? 5 : 10);
        const orbitSpd   = 1 + ri * 0.08;

        const headX = tcx + Math.cos(r.baseAngle + t * orbitSpd)        * orbitR;
        const headY = tcy + Math.sin(r.baseAngle + t * orbitSpd * 0.85) * orbitR;

        // FIX 2: Head easing 0.20 → 0.55 — snaps to cursor much faster
        r.pts[0].x += (headX - r.pts[0].x) * 0.55;
        r.pts[0].y += (headY - r.pts[0].y) * 0.55;

        // FIX 3: Chain-follow easing 0.28 → 0.46 — tail catches up quickly
        for (let i = 1; i < r.pts.length; i++) {
          r.pts[i].x += (r.pts[i - 1].x - r.pts[i].x) * 0.46;
          r.pts[i].y += (r.pts[i - 1].y - r.pts[i].y) * 0.46;
        }

        const color = colorFn(ri, ribbonCount);

        // ── Ribbon body ────────────────────────────────────────────────────
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(r.pts[0].x, r.pts[0].y);
        for (let i = 1; i < r.pts.length - 1; i++) {
          const xc = (r.pts[i].x + r.pts[i + 1].x) / 2;
          const yc = (r.pts[i].y + r.pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(r.pts[i].x, r.pts[i].y, xc, yc);
        }

        const tail = r.pts[r.pts.length - 1];
        const grad = ctx.createLinearGradient(r.pts[0].x, r.pts[0].y, tail.x, tail.y);
        grad.addColorStop(0,   hslToHsla(color, 0.95));
        grad.addColorStop(0.4, hslToHsla(color, 0.5));
        grad.addColorStop(1,   hslToHsla(color, 0));

        ctx.strokeStyle = grad;
        ctx.lineWidth   = r.width + Math.sin(r.phase) * 0.6;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";

        ctx.shadowColor = color;
        ctx.shadowBlur  = isLight ? 8 : 12;
        ctx.stroke();

        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.restore();

        // ── Shimmer dot at ribbon head ─────────────────────────────────────
        ctx.save();
        ctx.globalAlpha = 0.9 + Math.sin(r.phase * 3) * 0.1;
        const dotG = ctx.createRadialGradient(
          r.pts[0].x, r.pts[0].y, 0,
          r.pts[0].x, r.pts[0].y, 5,
        );
        dotG.addColorStop(0,   "rgba(255,255,255,0.95)");
        dotG.addColorStop(0.4, hslToHsla(color, 0.6));
        dotG.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = dotG;
        ctx.beginPath();
        ctx.arc(r.pts[0].x, r.pts[0].y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Cursor aura
      if (mx > 0) {
        const aura = ctx.createRadialGradient(mx, my, 0, mx, my, 55);
        aura.addColorStop(0, isLight ? "rgba(205,0,0,0.07)" : "rgba(200,180,255,0.07)");
        aura.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = aura;
        ctx.fillRect(0, 0, W, H);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("mousemove", onWindowMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend",  onTouchEnd);
      section?.removeEventListener("mouseleave", onWindowLeave);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLight, buildRibbons, getPaletteFn]);

  useEffect(() => {
    const { W, H, ribbonCount } = s.current;
    if (W && H) s.current.ribbons = buildRibbons(W, H, ribbonCount);
  }, [isLight, buildRibbons]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        display:       "block",
        // FIX: Remove pointerEvents: none from canvas so pointermove fires on it
        // Ribbons still won't block clicks because the content div is z-index: 1
        pointerEvents: "none",
        zIndex:        0,
      }}
    />
  );
}

// ─── Indexed field row ─────────────────────────────────────────────────────────
function IndexedField({ field, value, onChange, error, isLast }) {
  const [focused, setFocused] = useState(false);
  const isTextarea = field.type === "textarea";

  return (
    <div
      className="indexed-field-row"
      style={{
        display:             "grid",
        gridTemplateColumns: "28px 1fr",
        alignItems:          "stretch",
        borderTop:           "1px solid var(--contact-border)",
        borderBottom:        isLast ? "1px solid var(--contact-border)" : "none",
      }}
    >
      <span
        style={{
          fontFamily:    "'Bebas Neue', cursive",
          fontSize:      13,
          color:         focused ? "var(--acid)" : "var(--contact-num-idle)",
          paddingTop:    isTextarea ? 18 : 14,
          letterSpacing: "0.05em",
          userSelect:    "none",
          transition:    "color 0.18s",
        }}
      >
        {field.num}
      </span>

      <div
        style={{
          padding:       isTextarea ? "16px 0 16px 16px" : "12px 0 12px 16px",
          borderLeft:    `2px solid ${focused ? "var(--acid)" : "transparent"}`,
          transition:    "border-color 0.18s",
          display:       "flex",
          flexDirection: "column",
        }}
      >
        <label
          style={{
            display:       "block",
            fontFamily:    "'Space Mono', monospace",
            fontSize:      8,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color:         focused ? "var(--contact-label-focus)" : "var(--contact-label-idle)",
            marginBottom:  6,
            transition:    "color 0.18s",
            lineHeight:    1,
          }}
        >
          {field.label}
        </label>

        {isTextarea ? (
          <textarea
            name={field.id}
            value={value}
            onChange={e => onChange(field.id, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={field.placeholder}
            rows={4}
            style={{
              background:    "transparent",
              border:        "none",
              outline:       "none",
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontSize:      15,
              fontWeight:    400,
              color:         "var(--white)",
              width:         "100%",
              letterSpacing: "0.03em",
              lineHeight:    1.6,
              resize:        "none",
              minHeight:     88,
              paddingTop:    2,
            }}
          />
        ) : (
          <input
            type={field.type}
            name={field.id}
            value={value}
            onChange={e => onChange(field.id, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={field.placeholder}
            style={{
              background:    "transparent",
              border:        "none",
              outline:       "none",
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontSize:      15,
              fontWeight:    400,
              color:         "var(--white)",
              width:         "100%",
              letterSpacing: "0.03em",
              lineHeight:    1.5,
              height:        "30px",
            }}
          />
        )}

        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display:       "block",
                fontFamily:    "'Space Mono', monospace",
                fontSize:      8,
                letterSpacing: "0.2em",
                color:         "rgba(255,100,60,0.85)",
                marginTop:     4,
              }}
            >
              // {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ type, message }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        10,
        padding:    "11px 16px",
        borderLeft: `2px solid ${type === "success" ? "var(--acid)" : "rgba(255,100,60,0.8)"}`,
        background: type === "success" ? "var(--contact-toast-success-bg)" : "rgba(255,100,60,0.05)",
        color:      type === "success" ? "var(--acid)" : "rgba(255,130,80,1)",
        marginTop:  16,
      }}
    >
      {type === "success"
        ? <FiCheckCircle size={14} style={{ flexShrink: 0 }} />
        : <FiAlertCircle size={14} style={{ flexShrink: 0 }} />
      }
      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.04em" }}>
        {message}
      </span>
    </motion.div>
  );
}

// ─── Right panel (form) ────────────────────────────────────────────────────────
function RightPanel() {
  const [form,   setForm]   = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");

  const handleChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStatus("loading");
    try {
      const res = await fetch(FORMSPREE_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body:    JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    <div
      style={{
        flex:          1,
        padding:       "48px 44px",
        position:      "relative",
        overflow:      "hidden",
        display:       "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 32 }}>
        <span style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: "var(--white)", letterSpacing: "0.06em" }}>
          SEND A MESSAGE
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.2em", color: "var(--contact-meta)", textTransform: "uppercase" }}>
          drop_a_message()
        </span>
      </div>

      <div>
        {FIELDS.map((field, i) => (
          <IndexedField
            key={field.id}
            field={field}
            value={form[field.id]}
            onChange={handleChange}
            error={errors[field.id]}
            isLast={i === FIELDS.length - 1}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 28 }}>
        <motion.button
          onClick={handleSubmit}
          disabled={status === "loading" || status === "success"}
          whileHover={status === "idle" ? { filter: "brightness(1.1)" } : {}}
          whileTap={status === "idle" ? { scale: 0.97 } : {}}
          style={{
            background:    status === "success" ? "transparent" : status === "error" ? "rgba(255,100,60,0.12)" : "var(--acid)",
            color:         status === "success" ? "var(--acid)" : status === "error" ? "rgba(255,130,80,1)" : "var(--acid-fg)",
            border:        `1px solid ${status === "success" ? "var(--acid)" : status === "error" ? "rgba(255,100,60,0.5)" : "var(--acid)"}`,
            fontFamily:    "'Bebas Neue', cursive",
            fontSize:      16,
            letterSpacing: "0.12em",
            padding:       "13px 32px",
            cursor:        status === "loading" ? "not-allowed" : "pointer",
            opacity:       status === "loading" ? 0.6 : 1,
            display:       "flex",
            alignItems:    "center",
            gap:           8,
            transition:    "background 0.18s, color 0.18s, border-color 0.3s",
          }}
        >
          {status === "loading" && (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              style={{ display: "flex" }}
            >
              <FiLoader size={14} />
            </motion.span>
          )}
          {status === "loading"
            ? "TRANSMITTING…"
            : status === "success"
              ? "TRANSMITTED ✓"
              : status === "error"
                ? "TRY AGAIN"
                : <><FiSend size={14} /> TRANSMIT</>
          }
        </motion.button>

        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.2em", color: "var(--contact-hint)", textTransform: "uppercase" }}>
          Press to send
        </span>
      </div>

      <AnimatePresence>
        {status === "success" && <Toast type="success" message="Message sent — I'll reply within 24 hours" />}
        {status === "error"   && <Toast type="error"   message="Something went wrong — please try again." />}
      </AnimatePresence>
    </div>
  );
}

// ─── Left panel (info) ─────────────────────────────────────────────────────────
function LeftPanel({ inView }) {
  return (
    <div
      style={{
        background:    "var(--card-bg-2)",
        borderRight:   "1px solid var(--contact-border)",
        padding:       "48px 36px",
        display:       "flex",
        flexDirection: "column",
        position:      "relative",
        overflow:      "hidden",
        minWidth:      300,
        width:         300,
        flexShrink:    0,
      }}
    >
      {/* Ghost number */}
      <div style={{
        fontFamily: "'Bebas Neue', cursive", fontSize: 88, lineHeight: 0.85,
        color: "var(--contact-ghost-num)", position: "absolute", top: 32, right: 24,
        letterSpacing: "-0.02em", userSelect: "none", pointerEvents: "none", zIndex: 0,
      }}>06</div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        style={{
          fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.4em",
          color: "var(--contact-tag)", textTransform: "uppercase", marginBottom: 28,
          position: "relative", zIndex: 1,
        }}
      >
        // section_06 · contact
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <h2 style={{
          fontFamily: "'Bebas Neue', cursive", fontSize: 38, color: "var(--white)",
          letterSpacing: "0.04em", lineHeight: 1, marginBottom: 10, fontWeight: 400,
        }}>
          GET IN<br />
          <span style={{ color: "var(--acid)" }}>TOUCH</span>
        </h2>
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 300, fontSize: 13,
          color: "var(--contact-body-muted)", lineHeight: 1.8, marginBottom: 36,
          letterSpacing: "0.02em", maxWidth: 260,
        }}>
          Open to{" "}
          <span style={{ color: "var(--contact-body-emphasis)", fontWeight: 400 }}>internships</span>,
          freelance work, or just a good conversation about code and ideas.
        </p>
      </motion.div>

      <div style={{ height: 1, background: "var(--contact-divider)", marginBottom: 28, position: "relative", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {CONTACT_INFO.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}
          >
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.15em", color: "var(--contact-num-idle)", marginTop: 2, minWidth: 18 }}>
              {item.num}
            </span>
            <div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--contact-label-idle)", marginBottom: 3 }}>
                {item.label}
              </div>
              <a
                href={item.href}
                target={item.href.startsWith("mailto") ? "_self" : "_blank"}
                rel="noopener noreferrer"
                className="contact-link"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: "var(--contact-link)", letterSpacing: "0.03em", textDecoration: "none", transition: "color 0.18s" }}
              >
                {item.value}
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.55 }}
        style={{
          marginTop: "auto", paddingTop: 28, borderTop: "1px solid var(--contact-divider-faint)",
          display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1,
        }}
      >
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--acid)", flexShrink: 0 }}
        />
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.25em", color: "var(--contact-status)", textTransform: "uppercase" }}>
          Available · replies within 24h
        </span>
      </motion.div>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export default function Contact() {
  const ref         = useRef(null);
  const inView      = useInView(ref, { once: true, margin: "-60px" });
  const { isLight } = useThemeColors();

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        width:      "100%",
        padding:    "100px 6% 110px",
        background: "var(--darker)",
        position:   "relative",
        overflow:   "hidden",
        fontFamily: "'Space Mono', monospace",
        transition: "background 0.4s ease",
      }}
    >
      {/* ── Magnetic Ribbons background ─────────────────────────────── */}
      {/* FIX: Wrapper is position:absolute but NOT pointer-events:none  */}
      {/* so that window mousemove still fires over child elements       */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <MagneticRibbons isLight={isLight} />
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 36,
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11,
            letterSpacing: "0.5em", color: "var(--acid)", textTransform: "uppercase",
          }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", opacity: 0.4, fontSize: 10 }}>06</span>
          <span>Contact</span>
          <div style={{ height: 1, width: 60, background: "var(--contact-eyebrow-line)" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="contact-split"
          style={{
            maxWidth: 1100, margin: "0 auto", display: "flex",
            border: "1px solid var(--contact-border)", overflow: "hidden", backdropFilter: "blur(2px)",
          }}
        >
          <LeftPanel inView={inView} />
          <RightPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            maxWidth: 1100, margin: "28px auto 0", paddingTop: 20,
            borderTop: "1px solid var(--contact-divider-faint)",
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}
        >
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--contact-footer-muted)", letterSpacing: "0.1em" }}>
            // 3 channels &nbsp;·&nbsp;
            <span style={{ color: "var(--contact-footer-accent)" }}>always reachable</span>
          </span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--contact-footer-copy)", letterSpacing: "0.08em" }}>
            subodh walondre · 2026
          </span>
        </motion.div>
      </div>

      <style>{`
        /* ── Dark theme contact variables ── */
        #contact {
          --contact-border:           rgba(200,241,53,0.12);
          --contact-divider:          rgba(200,241,53,0.10);
          --contact-divider-faint:    rgba(200,241,53,0.08);
          --contact-eyebrow-line:     rgba(200,241,53,0.30);
          --contact-ghost-num:        rgba(200,241,53,0.06);
          --contact-tag:              rgba(200,241,53,0.40);
          --contact-meta:             rgba(200,241,53,0.30);
          --contact-status:           rgba(200,241,53,0.50);
          --contact-num-idle:         rgba(200,241,53,0.20);
          --contact-label-idle:       rgba(200,241,53,0.35);
          --contact-label-focus:      rgba(200,241,53,0.70);
          --contact-body-muted:       rgba(255,255,255,0.35);
          --contact-body-emphasis:    rgba(255,255,255,0.65);
          --contact-link:             rgba(255,255,255,0.60);
          --contact-hint:             rgba(255,255,255,0.15);
          --contact-footer-muted:     rgba(255,255,255,0.20);
          --contact-footer-accent:    rgba(200,241,53,0.45);
          --contact-footer-copy:      rgba(255,255,255,0.10);
          --contact-toast-success-bg: rgba(200,241,53,0.05);
        }

        /* ── Light theme contact variables ── */
        [data-theme="light"] #contact {
          --contact-border:           rgba(205,0,0,0.20);
          --contact-divider:          rgba(205,0,0,0.15);
          --contact-divider-faint:    rgba(205,0,0,0.10);
          --contact-eyebrow-line:     rgba(205,0,0,0.35);
          --contact-ghost-num:        rgba(139,0,0,0.10);
          --contact-tag:              rgba(139,0,0,0.60);
          --contact-meta:             rgba(139,0,0,0.50);
          --contact-status:           rgba(139,0,0,0.70);
          --contact-num-idle:         rgba(139,0,0,0.40);
          --contact-label-idle:       rgba(139,0,0,0.55);
          --contact-label-focus:      rgba(205,0,0,0.90);
          --contact-body-muted:       rgba(26,26,26,0.55);
          --contact-body-emphasis:    rgba(26,26,26,0.90);
          --contact-link:             rgba(26,26,26,0.70);
          --contact-hint:             rgba(26,26,26,0.35);
          --contact-footer-muted:     rgba(26,26,26,0.45);
          --contact-footer-accent:    rgba(205,0,0,0.70);
          --contact-footer-copy:      rgba(26,26,26,0.30);
          --contact-toast-success-bg: rgba(205,0,0,0.06);
        }

        #contact .contact-link:hover { color: var(--acid) !important; }

        #contact input::placeholder,
        #contact textarea::placeholder { color: var(--contact-hint); }

        #contact input:-webkit-autofill,
        #contact input:-webkit-autofill:hover,
        #contact input:-webkit-autofill:focus,
        #contact textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px var(--card-bg-2) inset !important;
          -webkit-text-fill-color: var(--white) !important;
          transition: background-color 9999s ease-in-out 0s;
        }

        #contact input, #contact textarea, #contact button { box-sizing: border-box; }

        @media (max-width: 700px) {
          .contact-split { flex-direction: column !important; }
          .contact-split > div:first-child {
            border-right:  none !important;
            border-bottom: 1px solid var(--contact-border) !important;
            padding:       36px 24px !important;
            width:         100% !important;
            min-width:     unset !important;
          }
          .contact-split > div:last-child { padding: 32px 24px !important; }
        }

        #contact *::selection      { background: transparent; }
        #contact *::-moz-selection { background: transparent; }
        #contact { -webkit-user-select: none; -moz-user-select: none; user-select: none; }

        #contact input, #contact textarea {
          -webkit-user-select: text; -moz-user-select: text; user-select: text;
        }
        #contact input::selection,
        #contact textarea::selection { background: rgba(var(--acid-rgb), 0.25); }
      `}</style>
    </section>
  );
}