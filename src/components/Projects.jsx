// src/components/Projects.jsx
import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FiGithub, FiExternalLink, FiArrowUpRight } from "react-icons/fi";
import { projects } from "../data/projects";

const FILTERS = ["All", "NLP", "Web", "ML", "Other"];

// ─── Filter pill ───────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily:    "'Space Mono', monospace",
      fontSize:      "0.62rem",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      padding:       "6px 16px",
      border:        "none",
      borderBottom:  active ? "2px solid var(--acid)" : "2px solid transparent",
      background:    "transparent",
      color:         active ? "var(--acid)" : "rgba(var(--white-rgb),0.35)",
      cursor:        "pointer",
      transition:    "all 0.18s",
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.color = "var(--white)"; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = "rgba(var(--white-rgb),0.35)"; }}
    >{label}</button>
  );
}

// ─── NUMBERED LIST ROW — for first 3 projects ────────────────────────────────
function ListCard({ project, num, delay = 0 }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:             "grid",
        gridTemplateColumns: "64px 1fr auto",
        alignItems:          "stretch",
        gap:                 "0 28px",
        padding:             "28px 32px",
        borderBottom:        "1px solid rgba(var(--acid-rgb),0.1)",
        position:            "relative",
        overflow:            "hidden",
        cursor:              "default",
        transition:          "background 0.25s",
        background:          hov ? "rgba(var(--acid-rgb),0.04)" : "transparent",
      }}
    >
      {/* Acid left bar */}
      <motion.div
        animate={{ scaleY: hov ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 3, background: "var(--acid)", transformOrigin: "top",
        }}
      />

      {/* Number */}
      <span style={{
        fontFamily:    "'Bebas Neue', cursive",
        fontSize:      "3.2rem",
        lineHeight:    1,
        color:         hov ? "var(--acid)" : "rgba(var(--acid-rgb),0.13)",
        letterSpacing: "0.05em",
        transition:    "color 0.25s",
        userSelect:    "none",
        alignSelf:     "center",
      }}>{String(num).padStart(2, "0")}</span>

      {/* Middle */}
      <div style={{ alignSelf: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
          <h3 style={{
            fontFamily:    "'Bebas Neue', cursive",
            fontSize:      "clamp(1.4rem, 2.5vw, 1.9rem)",
            letterSpacing: "0.04em",
            color:         hov ? "var(--acid)" : "var(--white)",
            margin:        0, lineHeight: 1,
            transition:    "color 0.25s",
          }}>{project.title}</h3>
          {project.featured && (
            <span style={{
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontSize:      "0.58rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              padding:       "3px 10px",
              border:        "1px solid var(--acid)",
              color:         "var(--acid)",
            }}>FEATURED</span>
          )}
        </div>
        <p style={{
          fontFamily:          "'Space Mono', monospace",
          fontSize:            "0.7rem",
          lineHeight:          1.75,
          color:               "rgba(var(--white-rgb),0.45)",
          margin:              "0 0 12px 0",
          maxWidth:            560,
          overflow:            "hidden",
          display:             "-webkit-box",
          WebkitLineClamp:     2,
          WebkitBoxOrient:     "vertical",
        }}>{project.desc}</p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {project.tech?.slice(0, 5).map(t => (
            <span key={t} style={{
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontSize:      "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding:       "2px 8px",
              border:        "1px solid rgba(var(--acid-rgb),0.18)",
              color:         "rgba(var(--white-rgb),0.35)",
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Right links */}
      <div style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "flex-end",
        justifyContent: "space-between",
        paddingTop:     4,
        paddingBottom:  4,
      }}>
        {/* Arrow */}
        <motion.div
          animate={{ rotate: hov ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            width: 40, height: 40,
            border:         `1px solid ${hov ? "var(--acid)" : "rgba(var(--acid-rgb),0.25)"}`,
            display:        "flex", alignItems: "center", justifyContent: "center",
            color:          hov ? "var(--acid)" : "rgba(var(--acid-rgb),0.35)",
            transition:     "color 0.2s, border-color 0.2s",
          }}
        ><FiArrowUpRight size={16} /></motion.div>

        {/* GitHub + Demo */}
        <div style={{ display: "flex", gap: 6 }}>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer"
              style={{ color: "rgba(var(--white-rgb),0.3)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--acid)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(var(--white-rgb),0.3)"}
            ><FiGithub size={14} /></a>
          )}
          {project.demo && (
            <a href={project.demo} target="_blank" rel="noreferrer"
              style={{ color: "rgba(var(--white-rgb),0.3)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--acid)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(var(--white-rgb),0.3)"}
            ><FiExternalLink size={14} /></a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MOSAIC TILE — INVERTED (acid bg, dark text) ──────────────────────────────
function TileCard({ project, num, delay = 0, tall = false }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border:        `1px solid ${hov ? "rgba(var(--darkest-rgb),0.5)" : "rgba(var(--darkest-rgb),0.15)"}`,
        position:      "relative",
        overflow:      "hidden",
        cursor:        "default",
        gridRow:       tall ? "span 2" : "span 1",
        display:       "flex",
        flexDirection: "column",
        minHeight:     tall ? 380 : 220,
        background:    "var(--acid)",
        transition:    "border-color 0.25s, box-shadow 0.25s, background 0.3s",
        boxShadow:     hov ? "0 8px 32px rgba(var(--acid-rgb),0.3)" : "none",
      }}
    >
      {/* Top accent line */}
      <motion.div
        animate={{ scaleX: hov ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 2, background: "var(--acid-fg)", transformOrigin: "left", zIndex: 2,
        }}
      />

      <div style={{
        padding:       tall ? "32px 28px" : "24px 24px 20px",
        display:       "flex",
        flexDirection: "column",
        flex:          1,
      }}>
        <div style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "flex-start",
          marginBottom:   tall ? 20 : 14,
        }}>
          <span style={{
            fontFamily:    "'Bebas Neue', cursive",
            fontSize:      tall ? "4rem" : "2.8rem",
            lineHeight:    1,
            color:         hov ? "rgba(var(--darkest-rgb),0.22)" : "rgba(var(--darkest-rgb),0.10)",
            letterSpacing: "0.05em",
            transition:    "color 0.25s",
            userSelect:    "none",
          }}>{String(num).padStart(2, "0")}</span>

          <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer" style={{
                width: 28, height: 28,
                border: "1px solid rgba(var(--darkest-rgb),0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(var(--darkest-rgb),0.45)", textDecoration: "none", transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--acid-fg)"; e.currentTarget.style.borderColor = "var(--acid-fg)"; e.currentTarget.style.background = "rgba(var(--darkest-rgb),0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(var(--darkest-rgb),0.45)"; e.currentTarget.style.borderColor = "rgba(var(--darkest-rgb),0.25)"; e.currentTarget.style.background = "transparent"; }}
              ><FiGithub size={12} /></a>
            )}
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer" style={{
                width: 28, height: 28,
                border: "1px solid rgba(var(--darkest-rgb),0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(var(--darkest-rgb),0.45)", textDecoration: "none", transition: "all 0.18s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--acid-fg)"; e.currentTarget.style.borderColor = "var(--acid-fg)"; e.currentTarget.style.background = "rgba(var(--darkest-rgb),0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(var(--darkest-rgb),0.45)"; e.currentTarget.style.borderColor = "rgba(var(--darkest-rgb),0.25)"; e.currentTarget.style.background = "transparent"; }}
              ><FiExternalLink size={12} /></a>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: tall ? 16 : 10 }}>
          {project.tech?.slice(0, tall ? 4 : 3).map(t => (
            <span key={t} style={{
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontSize:      "0.58rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              padding:       "2px 7px",
              border:        "1px solid rgba(var(--darkest-rgb),0.2)",
              color:         "rgba(var(--darkest-rgb),0.38)",
            }}>{t}</span>
          ))}
        </div>

        <h3 style={{
          fontFamily:    "'Bebas Neue', cursive",
          fontSize:      tall ? "clamp(1.7rem, 2.8vw, 2.2rem)" : "clamp(1.2rem, 2vw, 1.6rem)",
          letterSpacing: "0.04em",
          color:         "var(--acid-fg)",
          margin:        "0 0 10px 0",
          lineHeight:    1.05,
          transition:    "color 0.25s",
        }}>{project.title}</h3>

        <p style={{
          fontFamily:      "'Space Mono', monospace",
          fontSize:        "0.68rem",
          lineHeight:      1.8,
          color:           "rgba(var(--darkest-rgb),0.55)",
          flex:            1,
          overflow:        "hidden",
          display:         "-webkit-box",
          WebkitLineClamp: tall ? 4 : 2,
          WebkitBoxOrient: "vertical",
          margin:          0,
        }}>{project.desc}</p>
      </div>
    </motion.div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Projects() {
  const [active, setActive] = useState("All");

  const allProjects = Array.isArray(projects) ? projects : [];
  const filtered    = active === "All"
    ? allProjects
    : allProjects.filter(p => p.tags?.includes(active));

  const listItems = filtered.slice(0, 3);
  const tileItems = filtered.slice(3);

  return (
    <section id="projects" style={{
      width:      "100%",
      padding:    "100px 6% 110px",
      background: "var(--darker)",
      position:   "relative",
      overflow:   "hidden",
      fontFamily: "'Space Mono', monospace",
      transition: "background 0.4s ease",
    }}>

      {/* Grid texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage:
          "linear-gradient(rgba(var(--acid-rgb),0.02) 1px, transparent 1px)," +
          "linear-gradient(90deg, rgba(var(--acid-rgb),0.02) 1px, transparent 1px)",
        backgroundSize: "50px 50px", zIndex: 0,
      }} />

      {/* Rotating shapes */}
      <div style={{ position: "absolute", top: "6%", right: "-40px", width: 200, height: 200, opacity: 0.045, pointerEvents: "none", zIndex: 0, animation: "cssRotateCW 40s linear infinite" }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <polygon points="50,3 97,25 97,75 50,97 3,75 3,25" stroke="var(--acid)" strokeWidth="1.2" fill="none" />
          <polygon points="50,18 82,35 82,65 50,82 18,65 18,35" stroke="var(--acid)" strokeWidth="0.6" fill="none" />
          <line x1="50" y1="3" x2="50" y2="97" stroke="var(--acid)" strokeWidth="0.4" />
          <line x1="3" y1="50" x2="97" y2="50" stroke="var(--acid)" strokeWidth="0.4" />
        </svg>
      </div>

      <div style={{ position: "absolute", bottom: "10%", left: "-30px", width: 150, height: 150, opacity: 0.035, pointerEvents: "none", zIndex: 0, animation: "cssRotateCCW 55s linear infinite" }}>
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
          <rect x="15" y="15" width="70" height="70" stroke="var(--acid)" strokeWidth="1.2" fill="none" transform="rotate(45 50 50)" />
          <rect x="30" y="30" width="40" height="40" stroke="var(--acid)" strokeWidth="0.6" fill="none" transform="rotate(45 50 50)" />
        </svg>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between", flexWrap: "wrap",
          gap: 20, marginBottom: 52,
        }}>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.65rem", letterSpacing: "0.5em",
              color: "var(--acid)", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 14, marginBottom: 18,
              transition: "color 0.3s",
            }}>
              <span style={{ fontFamily: "'Space Mono', monospace", opacity: 0.4, fontSize: "0.6rem" }}>04</span>
              <span>Selected Work</span>
              <div style={{ height: 1, width: 60, background: "rgba(var(--acid-rgb),0.3)" }} />
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(3.5rem, 7vw, 7rem)",
              lineHeight: 0.9, letterSpacing: "0.03em",
              color: "var(--white)", margin: 0,
              transition: "color 0.3s",
            }}>
              PROJECTS<br />
              <span style={{ color: "var(--acid)" }}>&amp; BUILDS</span>
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(var(--acid-rgb),0.1)" }}>
              {FILTERS.map(f => (
                <FilterPill key={f} label={f} active={active === f} onClick={() => setActive(f)} />
              ))}
            </div>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: "0.6rem",
              color: "rgba(var(--white-rgb),0.2)", letterSpacing: "0.1em",
            }}>// {filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

            {filtered.length === 0 && (
              <div style={{
                textAlign: "center", padding: "80px 0",
                color: "rgba(var(--white-rgb),0.2)",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.75rem", letterSpacing: "0.15em",
              }}>// NO PROJECTS MATCH THIS FILTER</div>
            )}

            {/* Numbered list — projects 1, 2, 3 */}
            {listItems.length > 0 && (
              <div style={{ border: "1px solid rgba(var(--acid-rgb),0.1)", marginBottom: 3 }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "64px 1fr auto",
                  gap: "0 28px", padding: "10px 32px",
                  borderBottom: "1px solid rgba(var(--acid-rgb),0.08)",
                  background: "rgba(var(--acid-rgb),0.03)",
                }}>
                  {["#", "Project", "Links"].map(h => (
                    <span key={h} style={{
                      fontFamily: "'Space Mono', monospace", fontSize: "0.55rem",
                      letterSpacing: "0.25em", color: "rgba(var(--acid-rgb),0.35)", textTransform: "uppercase",
                    }}>{h}</span>
                  ))}
                </div>
                {listItems.map((p, i) => (
                  <ListCard key={p.id} project={p} num={i + 1} delay={i * 0.07} />
                ))}
              </div>
            )}

            {/* Mosaic grid — projects 4, 5, 6... (INVERTED acid tiles) */}
            {tileItems.length > 0 && (
              <div className="mosaic-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridAutoRows: "200px",
                gap: 3,
              }}>
                {tileItems.map((p, i) => (
                  <TileCard
                    key={p.id} project={p}
                    num={listItems.length + i + 1}
                    delay={i * 0.06}
                    tall={true}
                  />
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Footer strip */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            marginTop: 44, paddingTop: 28,
            borderTop: "1px solid rgba(var(--acid-rgb),0.1)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          }}
        >
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: "0.65rem",
            color: "rgba(var(--white-rgb),0.2)", letterSpacing: "0.1em",
          }}>// All projects available on GitHub</span>
          <a href="https://github.com/SubodhWalondre-1" target="_blank" rel="noreferrer"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.78rem",
              fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--acid-fg)", background: "var(--acid)", border: "2px solid var(--acid)",
              padding: "10px 26px", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--acid)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--acid)"; e.currentTarget.style.color = "var(--acid-fg)"; }}
          ><FiGithub size={14} /> View All</a>
        </motion.div>
      </div>

      <style>{`
  @keyframes cssRotateCW  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes cssRotateCCW { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
  @media (max-width: 1024px) { .mosaic-grid { grid-template-columns: repeat(3, 1fr) !important; } }
  @media (max-width: 768px)  { .mosaic-grid { grid-template-columns: repeat(2, 1fr) !important; grid-auto-rows: 200px !important; } }
  @media (max-width: 480px)  {
    .mosaic-grid { grid-template-columns: 1fr !important; grid-auto-rows: auto !important; }
    .mosaic-grid > div { grid-row: span 1 !important; min-height: 180px !important; }
  }

  #projects *::selection { background: transparent; }
  #projects *::-moz-selection { background: transparent; }
  #projects { -webkit-user-select: none; -moz-user-select: none; user-select: none; }
`}</style>
    </section>
  );
}