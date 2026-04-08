// src/App.jsx
import { useState, useEffect } from "react";
import { ThemeProvider }   from "./context/ThemeContext";
import Navbar              from "./components/Navbar";
import Preloader           from "./components/Preloader";
import Home                from "./components/Home";
import About               from "./components/About";
import Experience          from "./components/Experience";
import Projects            from "./components/Projects";
import Certifications      from "./components/Certifications";
import Contact             from "./components/Contact";

// ─── Scroll progress bar ───────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setPct(total > 0 ? (scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{
      position:      "fixed",
      top:           0,
      left:          0,
      right:         0,
      height:        2.5,
      zIndex:        9998,       // just below Preloader's 9999
      pointerEvents: "none",
    }}>
      <div style={{
        height:       "100%",
        width:        `${pct}%`,
        background:   "linear-gradient(90deg, var(--accent-cyan), var(--accent-orange))",
        transition:   "width 0.08s linear",
        borderRadius: "0 2px 2px 0",
      }} />
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <ThemeProvider>

      <ScrollProgress />

      {/* ✅ prop is onComplete — matches your Preloader exactly */}
      {!preloaderDone && (
        <Preloader onComplete={() => setPreloaderDone(true)} />
      )}

      <Navbar />

      <main>
        <Home />
        <About />
        <Experience />
        <Projects />
        <Certifications />
        <Contact />
      </main>

    </ThemeProvider>
  );
}