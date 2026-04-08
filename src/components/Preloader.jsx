import { useEffect, useState } from "react";

const LETTERS = ["S", "U", "B", "O", "D", "H", "."];

export default function Preloader({ onComplete }) {
  const [hidden, setHidden] = useState(false);
  const [gone, setGone] = useState(false);
  const [shown, setShown] = useState(LETTERS.map(() => false));
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // Stagger each letter
    LETTERS.forEach((_, i) => {
      setTimeout(() => {
        setShown((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 70);
    });

    // Bar fills from 600ms over 1800ms
    let step = 0;
    const STEPS = 60;
    const barTimer = setTimeout(() => {
      const iv = setInterval(() => {
        step++;
        setBarWidth(Math.min((step / STEPS) * 100, 100));
        if (step >= STEPS) clearInterval(iv);
      }, 1800 / STEPS);
    }, 600);

    // Fade out at 2600ms
    const hideTimer = setTimeout(() => {
      setHidden(true);
      setTimeout(() => {
        setGone(true);
        if (onComplete) onComplete();
      }, 600);
    }, 2600);

    return () => {
      clearTimeout(barTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <style>{`

        .preloader-root {
          position: fixed;
          inset: 0;
          background: var(--dark);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 24px;
          transition: opacity 0.6s ease, transform 0.6s ease, background 0.4s ease;
        }

        .preloader-root.hidden {
          opacity: 0;
          transform: translateY(-20px);
          pointer-events: none;
        }

        .preloader-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 10vw, 120px);
          letter-spacing: 0.1em;
          color: var(--white);
          overflow: hidden;
          display: flex;
          transition: color 0.4s ease;
        }

        .preloader-letter {
          display: inline-block;
          transform: translateY(100%);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease;
        }

        .preloader-letter.show {
          transform: translateY(0%);
          opacity: 1;
        }

        .preloader-bar-wrap {
          width: 300px;
          height: 2px;
          background: var(--preloader-bar-track);
          overflow: hidden;
          transition: background 0.4s ease;
        }

        .preloader-bar {
          height: 100%;
          background: var(--acid);
          transition: width 0.03s linear, background-color 0.4s ease;
        }
      `}</style>

      <div className={`preloader-root${hidden ? " hidden" : ""}`}>
        {/* Animated name letters */}
        <div className="preloader-name">
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className={`preloader-letter${shown[i] ? " show" : ""}`}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Loading bar */}
        <div className="preloader-bar-wrap">
          <div
            className="preloader-bar"
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>
    </>
  );
}