import { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { HiMoon, HiSun, HiBars3, HiXMark } from "react-icons/hi2";
import { useTheme } from "../context/ThemeContext";

// ─── Nav links config ──────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",           to: "hero"           },
  { label: "About",          to: "about-section"   },
  { label: "Experience",     to: "experience"      },
  { label: "Projects",       to: "projects"        },
  { label: "Certifications", to: "certifications"  },
  { label: "Contact",        to: "contact"         },
];

// ─── Framer Motion variants ────────────────────────────────────────────────────
const navContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};

const navItemVariants = {
  hidden:  { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const drawerVariants = {
  hidden:  { opacity: 0, y: -8, scale: 0.97 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit:    { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2, ease: "easeIn"  } },
};

const drawerItemVariants = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" },
  }),
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { dark, toggle } = useTheme();

  const [scrolled,   setScrolled]   = useState(false);
  const [activeLink, setActiveLink] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll watcher
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Scoped styles ─────────── */}
      <style>{`
        /* ── Floating pill navbar ── */
        .capsule-navbar {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 8px;
          border-radius: 999px;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          background: rgba(var(--dark-rgb), 0.75);
          border: 1px solid rgba(var(--acid-rgb), 0.15);
          box-shadow: 0 4px 30px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.03) inset;
          transition: background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, padding 0.3s ease;
        }
        .capsule-navbar.scrolled {
          background: rgba(var(--dark-rgb), 0.92);
          border-color: rgba(var(--acid-rgb), 0.25);
          box-shadow: 0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset;
          padding: 5px 8px;
        }

        /* Desktop link item */
        .pill-nav-link {
          position: relative;
          padding: 8px 16px;
          cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: .82rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--gray);
          text-decoration: none;
          border-radius: 999px;
          transition: color .2s ease, background .2s ease;
          user-select: none;
          white-space: nowrap;
        }
        .pill-nav-link:hover {
          color: var(--white);
          background: rgba(var(--white-rgb), 0.06);
        }
        .pill-nav-link.active {
          color: var(--acid);
          background: rgba(var(--acid-rgb), 0.1);
          font-weight: 600;
        }

        /* Divider dot between links */
        .nav-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(var(--acid-rgb), 0.25);
          flex-shrink: 0;
        }

        /* Theme toggle */
        .theme-toggle-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: rgba(var(--acid-rgb), 0.08);
          border: 1px solid rgba(var(--acid-rgb), 0.25);
          cursor: pointer;
          color: var(--acid);
          flex-shrink: 0;
          transition: background 0.25s, border-color 0.25s, box-shadow 0.25s, color 0.25s;
          margin-left: 4px;
        }
        .theme-toggle-pill:hover {
          border-color: var(--acid);
          box-shadow: 0 0 14px rgba(var(--acid-rgb), 0.3);
          background: rgba(var(--acid-rgb), 0.15);
        }

        /* Mobile hamburger */
        .mobile-hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: none;
          border: 1px solid rgba(var(--acid-rgb), 0.3);
          color: var(--white);
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.2s, background 0.2s;
        }
        .mobile-hamburger:hover {
          border-color: var(--acid);
          background: rgba(var(--acid-rgb), 0.07);
        }

        /* Mobile drawer */
        .mobile-drawer {
          position: fixed;
          top: 76px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 999;
          width: calc(100% - 40px);
          max-width: 400px;
          background: rgba(var(--dark-rgb), 0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(var(--acid-rgb), 0.15);
          border-radius: 24px;
          padding: 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
        }

        /* Drawer item */
        .drawer-item {
          padding: 13px 16px;
          border-radius: 12px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: .92rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          transition: all .2s ease;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .drawer-item.active {
          color: var(--acid);
          background: rgba(var(--acid-rgb), 0.08);
        }
        .drawer-item:not(.active) {
          color: var(--gray);
        }
        .drawer-item:not(.active):hover {
          color: var(--white);
          background: rgba(var(--white-rgb), 0.04);
        }

        /* Responsive */
        .desktop-links { display: flex !important; align-items: center; gap: 2px; }
        .mobile-hamburger { display: none !important; }
        @media (max-width: 767px) {
          .desktop-links   { display: none !important; }
          .mobile-hamburger { display: flex !important; }
          .capsule-navbar {
            padding: 6px 12px;
            gap: 8px;
          }
        }
      `}</style>

      {/* ── Main floating pill navbar ────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1  }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`capsule-navbar${scrolled ? " scrolled" : ""}`}
      >
        {/* ── Desktop nav links ── */}
        <motion.nav
          className="desktop-links"
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {NAV_LINKS.map(({ label, to }, idx) => (
            <motion.div key={to} variants={navItemVariants} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Link
                to={to}
                spy={true}
                smooth={true}
                offset={-70}
                duration={500}
                onSetActive={() => setActiveLink(to)}
                style={{ textDecoration: "none" }}
              >
                <div className={`pill-nav-link${activeLink === to ? " active" : ""}`}>
                  {label}
                </div>
              </Link>
              {idx < NAV_LINKS.length - 1 && <div className="nav-divider" />}
            </motion.div>
          ))}
        </motion.nav>

        {/* ── Theme toggle ── */}
        <motion.div variants={navItemVariants}>
          <ThemeToggle dark={dark} toggle={toggle} />
        </motion.div>

        {/* ── Mobile hamburger ── */}
        <motion.button
          className="mobile-hamburger"
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <HiXMark size={20} /> : <HiBars3 size={20} />}
        </motion.button>
      </motion.header>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="drawer"
            className="mobile-drawer"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <nav>
              {NAV_LINKS.map(({ label, to }, i) => (
                <motion.div
                  key={to}
                  custom={i}
                  variants={drawerItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Link
                    to={to}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    onSetActive={() => setActiveLink(to)}
                    onClick={() => setMobileOpen(false)}
                    style={{ textDecoration: "none", display: "block" }}
                  >
                    <div className={`drawer-item${activeLink === to ? " active" : ""}`}>
                      <span>{label}</span>
                      {activeLink === to && (
                        <span
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize:   10,
                            color:      "var(--acid)",
                            opacity:    0.8,
                          }}
                        >
                          ●
                        </span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ThemeToggle({ dark, toggle }) {
  return (
    <motion.button
      className="theme-toggle-pill"
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.08 }}
      onClick={toggle}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
          animate={{ rotate: 0,   opacity: 1, scale: 1   }}
          exit={{    rotate:  30, opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          {dark ? <HiMoon size={15} /> : <HiSun size={17} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}