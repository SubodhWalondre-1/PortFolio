# SumOfCode Portfolio - Project Context Documentation

> **Personal Portfolio Website** — A modern, animated portfolio for Subodh Walondre, an AIML Engineer & Full Stack Developer.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack & Dependencies](#tech-stack--dependencies)
3. [Folder Structure](#folder-structure)
4. [Design System](#design-system)
   - [Color Palette](#color-palette)
   - [Typography](#typography)
   - [Spacing & Layout](#spacing--layout)
5. [Component Architecture](#component-architecture)
6. [Animations & Interactions](#animations--interactions)
7. [Data Structure](#data-structure)
8. [Configuration Files](#configuration-files)
9. [Environment Variables](#environment-variables)
10. [Features Overview](#features-overview)

---

## Project Overview

**SumOfCode** is a modern, single-page portfolio website built with React and Vite. It features sophisticated animations, a dark/light theme toggle, and a cinematic preloader. The portfolio showcases projects, experience, certifications, and provides a contact form.

### Key Characteristics

- **Single Page Application (SPA)** with smooth scroll navigation
- **Dark/Light theme** support with CSS custom properties
- **Cinematic preloader** with starfield animation (shows once per session)
- **Advanced animations** using Framer Motion
- **Canvas-based particle system** in hero section
- **Magnetic cursor** effect (desktop only)
- **Responsive design** with mobile-first approach

---

## Tech Stack & Dependencies

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.2.4 | UI Library |
| Vite | ^8.0.0 | Build Tool |
| Tailwind CSS | ^3.4.19 | Utility-first CSS |
| Framer Motion | ^12.36.0 | Animation Library |

### Additional Dependencies

```json
{
  "autoprefixer": "^10.4.27",
  "postcss": "^8.5.8",
  "react-icons": "^5.6.0",
  "react-scroll": "^1.9.3"
}
```

### Dev Dependencies

- ESLint with React plugins
- Type definitions for React
- Vite React plugin

---

## Folder Structure

```
sumofcode/
├── .env                      # Environment variables (Formspree ID)
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── README.md                 # Basic project readme
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point with Google Fonts
├── package.json              # Dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── postcss.config.js         # PostCSS configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── vite.config.js            # Vite build configuration
│
├── public/                   # Static assets
│   ├── Subodh-Walondre_AIML-Resume.pdf
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── icons.svg
│   └── profile.jpg           # Profile photo for About section
│
└── src/
    ├── main.jsx              # React entry point
    ├── index.css             # Global CSS with Tailwind + custom properties
    ├── App.css               # App-specific styles
    ├── App.jsx               # Main App component with ScrollProgress
    │
    ├── assets/               # Project assets (SVGs, images)
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    │
    ├── components/           # React components
    │   ├── Navbar.jsx        # Fixed navigation with mobile drawer
    │   ├── Preloader.jsx     # Cinematic intro animation
    │   ├── Home.jsx          # Hero section with particle canvas
    │   ├── About.jsx         # Bio, skills, stats section
    │   ├── Experience.jsx    # Timeline work experience
    │   ├── Projects.jsx      # Filterable project grid
    │   ├── Certifications.jsx # Certifications & workshops tabs
    │   ├── Contact.jsx       # Contact form with Formspree
    │   └── Footer.jsx        # Footer with social links
    │
    ├── context/              # React context providers
    │   └── ThemeContext.jsx  # Dark/Light theme state
    │
    └── data/                 # Data files
        ├── certifications.js # Certification records
        ├── experience.js   # Work experience data
        └── projects.js     # Project portfolio data
```

---

## Design System

### Color Palette

#### Dark Theme (Default)

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-primary` | `#111318` | Main background |
| `--bg-surface` | `#1c2028` | Card/section backgrounds |
| `--accent-cyan` | `#93c5fd` | Primary accent (buttons, links) |
| `--accent-orange` | `#7dd3fc` | Secondary accent (highlights) |
| `--text-primary` | `#f1f5f9` | Main text color |
| `--text-muted` | `#94a3b8` | Secondary/muted text |
| `--border` | `#2e3440` | Border color |

#### Light Theme

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-primary` | `#f8fafc` | Main background |
| `--bg-surface` | `#ffffff` | Card/section backgrounds |
| `--accent-cyan` | `#2563eb` | Primary accent |
| `--accent-orange` | `#0284c7` | Secondary accent |
| `--text-primary` | `#0f172a` | Main text color |
| `--text-muted` | `#64748b` | Secondary text |
| `--border` | `#e1e8f0` | Border color |

#### Component-Specific Variables

```css
/* Home Section */
--card-border: rgba(147,197,253,0.22)
--card-shadow: 0 0 40px rgba(147,197,253,0.07), 0 24px 64px rgba(0,0,0,0.4)
--btn-filled-text: #0f172a
--btn-glow: 0 6px 24px rgba(147,197,253,0.35)
--code-string: #86efac
--cursor-glow: rgba(147,197,253,0.07)
--tilt-glow: rgba(147,197,253,0.12)

/* About Section */
--blob-color: rgba(147, 197, 253, 0.12)
--ring-dashed: rgba(147,197,253,0.45)
--photo-glow: rgba(147,197,253,0.18)
--stat-shadow: rgba(0,0,0,0.25)
```

### Typography

#### Font Families

| Font | Usage | Weights |
|------|-------|---------|
| **Playfair Display** | Headings (H1, H2, Section titles) | 400, 700, italic |
| **Outfit** | Body text, UI elements | 300, 400, 500, 600 |
| **JetBrains Mono** | Code snippets, labels, mono text | 400, 500 |

#### Font URLs (Google Fonts)

```html
https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap
```

#### Typography Scale

| Element | Size | Line Height | Font |
|---------|------|-------------|------|
| H1 (Hero Name) | `clamp(36px, 8vw, 76px)` | 1.1 | Playfair Display |
| H2 (Section Title) | `clamp(32px, 5vw, 52px)` | 1.1 | Playfair Display |
| H3 (Card Title) | `clamp(17px, 2.2vw, 21px)` | 1.25 | Playfair Display |
| Body | `15px - 15.5px` | 1.8-1.9 | Outfit |
| Mono/Code | `11px - 14px` | 2 | JetBrains Mono |
| Labels | `10px - 12px` | 1 | JetBrains Mono |

### Spacing & Layout

- **Container Max Width**: `1200px`
- **Section Padding**: `110px 6%` (vertical horizontal)
- **Card Padding**: `24px - 36px`
- **Grid Gap**: `16px - 72px` depending on section
- **Border Radius Scale**: `10px, 14px, 16px, 20px, 24px`

---

## Component Architecture

### App Structure

```jsx
<ThemeProvider>
  <ScrollProgress />          {/* Top scroll indicator */}
  <Preloader />               {/* Cinematic intro (once per session) */}
  <Navbar />                  {/* Fixed navigation */}
  <main>
    <Home />                  {/* Hero section */}
    <About />                 {/* Bio & skills */}
    <Experience />            {/* Timeline */}
    <Projects />              {/* Project grid */}
    <Certifications />        {/* Certs & workshops */}
    <Contact />               {/* Contact form */}
  </main>
  <Footer />                  {/* Footer */}
</ThemeProvider>
```

### Component Details

#### 1. Navbar (`Navbar.jsx`)

- **Features**: Fixed position, glassmorphism effect, mobile drawer
- **Scroll behavior**: Shrinks height after 80px scroll
- **Links**: Home, About, Experience, Projects, Certifications, Contact
- **Theme Toggle**: Sun/Moon animated icon button

**Animation Variants:**
- `navContainerVariants`: Stagger children 0.07s
- `navItemVariants`: Fade up from -12px
- `drawerVariants`: Height + opacity animation

#### 2. Preloader (`Preloader.jsx`)

- **Duration**: 8.5 seconds total
- **Features**: 
  - Radial gradient background with pulse animation
  - Starfield falling particles (CSS animation)
  - "WELCOME TO PORTFOLIO" text with gradient shift
  - Loading bar with shimmer effect
  - Percentage counter (0-100%)
- **Session Storage**: Skips if `sumofcode_intro_seen` is set
- **Exit**: 2s fade-out with blur and scale

#### 3. Home (`Home.jsx`)

**Features:**
- Canvas-based particle system (300 particles, constellation lines)
- Magnetic cursor glow effect (desktop only)
- Floating gradient blobs
- Decorative rotating rings
- 3D tilt code card
- Typewriter text effect
- Smooth scroll indicator

**Sub-components:**
- `ParticleCanvas`: Canvas animation with mouse repulsion
- `MagneticCursor`: Dual-ring cursor glow following mouse
- `DecorativeRings`: Two counter-rotating dashed rings
- `FloatingBlobs`: Animated gradient orbs
- `TiltCard`: 3D perspective card with mouse tracking
- `CodeCard`: Syntax-highlighted code snippet card
- `CTAButton`: Magnetic button with hover effects

#### 4. About (`About.jsx`)

**Features:**
- Profile photo with animated rings and glow
- "Open to Work" animated badge
- Skill pills grid
- Stats cards (3 items)
- "Currently learning" badge
- Background grid lines + blobs

**Data:**
- 15 Skills listed
- 3 Stats (Semester, Projects, Certifications)
- 4 Bio paragraphs

#### 5. Experience (`Experience.jsx`)

**Features:**
- Vertical timeline with animated fill
- Alternating left/right cards
- Mobile: Single column with left timeline
- Pulse animation on timeline dots
- Connector notches on cards

**Card Features:**
- Type badge (Internship)
- Date range with calendar icon
- Role title (Playfair Display)
- Organization link with location tag
- Bullet points with arrow markers
- Tech tags with hover effects

#### 6. Projects (`Projects.jsx`)

**Features:**
- Filter tabs: All, NLP, Web, ML, Other
- Animated grid layout
- Project cards with:
  - Featured ribbon (orange)
  - Folder icon + GitHub/Demo links
  - 3-line description (clamped)
  - Tech pills

**Responsive Grid:**
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

#### 7. Certifications (`Certifications.jsx`)

**Features:**
- Tab toggle: Certifications vs Workshops
- Platform color coding (6 platforms)
- Stats bar (Total, Certs, Workshops, Platforms)
- Horizontal scroll on mobile
- Avatar with platform-colored initials

**Platform Colors:**
- Internship: `#4A90D9` (Blue)
- AlgoZenith: `#4CAF7D` (Green)
- Disha: `#E07B5A` (Orange)
- AWS: `#E8A020` (Gold)
- SIH: `#64FFDA` (Cyan)
- Other: `#8892a4` (Gray)

#### 8. Contact (`Contact.jsx`)

**Features:**
- Two-column layout (info + form)
- Floating label form inputs
- Form validation
- Formspree integration
- Toast notifications (success/error)
- Availability indicator pill

**Form Fields:**
- Name (required)
- Email (required, validated)
- Subject (required)
- Message (required, min 20 chars)

#### 9. Footer (`Footer.jsx`)

**Features:**
- Back to top floating button
- Logo + tagline
- Navigation grid
- Social icons (GitHub, LinkedIn, Email)
- Availability indicator
- Copyright with heart emoji

---

## Animations & Interactions

### Global Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Page fade | 0.6s | `[0.22, 1, 0.36, 1]` (ease-out-quint) |
| Card hover | 0.25s | `ease` |
| Border color | 0.2s | `ease` |
| Theme transition | 0.3s | `ease` |

### Preloader Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Background | `soc_gradientPulse` | 8s infinite |
| Vignette | `soc_vignetteSweep` | 12s infinite |
| Stars | `soc_starFall` | 2-5s each |
| Title gradient | `soc_gradientShift` | 8s infinite |
| Loading bar | `soc_loadingBarFill` | 3.5s |

### Home Section Animations

| Element | Animation | Details |
|---------|-----------|---------|
| Particle canvas | Canvas loop | 300 particles, constellation lines |
| Magnetic cursor | `useSpring` | Stiffness: 80, Damping: 22 |
| Floating blobs | `y: [0, -18, 0]` | 10s, easeInOut |
| Decorative rings | `rotate: 360` | 22s / 35s linear |
| Typewriter | Typing effect | 90ms typing, 55ms deleting |
| Reveal text | Word-by-word fade | 0.45s per word, blur filter |
| Tilt card | 3D perspective | 14deg max rotation |
| CTA buttons | Magnetic pull | 0.22 factor, spring physics |
| Scroll arrow | `y: [0, 7, 0]` | 1.4s bounce |

### Scroll Animations (Framer Motion)

```jsx
// Stagger children
containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } }
}

// Fade up
fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

// Stagger helper
stagger = (i) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }
})
```

### Hover Effects

| Component | Effect |
|-----------|--------|
| Nav links | Underline scale from left |
| Buttons | Border color + glow |
| Cards | Border accent, lift -4px, shadow |
| Skill pills | Border + text color change |
| Social icons | Scale 1.1, y: -4 |
| Project cards | Glow border, lift -6px |
| Cert cards | Platform-colored border |

---

## Data Structure

### Experience Data

```javascript
{
  id: number,
  role: string,
  org: string,
  orgUrl: string | null,
  type: string,
  dateRange: string,
  location: string,
  bullets: string[],
  tags: string[],
  accent: "cyan" | "orange"
}
```

### Project Data

```javascript
{
  id: number,
  title: string,
  desc: string,
  tags: string[],  // Filter categories
  tech: string[],  // Tech stack
  github: string | null,
  demo: string | null,
  featured: boolean
}
```

### Certification Data

```javascript
{
  id: number,
  name: string,
  org: string,
  platform: string,  // Maps to PLATFORM_META
  date: string,
  credUrl: string | null,
  category: "certification" | "workshop"
}
```

---

## Configuration Files

### Tailwind Config

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: []
}
```

### Vite Config

```javascript
// vite.config.js
export default {
  plugins: [react()],
  server: { host: true }
}
```

### PostCSS Config

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

---

## Environment Variables

### Required

```bash
VITE_FORMSPREE_ID=your_formspree_id_here
```

### Usage

```javascript
const FORMSPREE_URL = `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_ID}`;
```

---

## Features Overview

### Interactive Features

1. **Theme Toggle**: Dark/Light mode with system preference persistence
2. **Smooth Scroll**: All navigation uses smooth scroll behavior
3. **Scroll Progress**: Thin line at top showing scroll percentage
4. **Magnetic Cursor**: Custom cursor following mouse with spring physics
5. **Canvas Particles**: Interactive particle system responding to mouse
6. **3D Tilt Cards**: Cards tilt based on mouse position
7. **Typewriter Effect**: Animated text cycling through roles
8. **Filterable Projects**: Tab-based project filtering
9. **Contact Form**: Functional form with validation and Formspree
10. **Mobile Drawer**: Slide-out navigation on mobile

### Responsive Breakpoints

| Breakpoint | Value | Changes |
|------------|-------|---------|
| Desktop | > 1024px | Full layout, all animations |
| Tablet | 768px - 1024px | 2-column project grid, simplified nav |
| Mobile | < 768px | Single column, mobile drawer, reduced particles |
| Small | < 480px | Compact padding, hidden code card |

### Performance Optimizations

- `willChange: transform` on animated elements
- `pointer-events: none` on decorative elements
- Canvas particles reduced on touch devices (120 vs 300)
- `useInView` for scroll-triggered animations
- Session storage for preloader skip
- `passive: true` on scroll listeners
- Lazy loading via viewport animations

---

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

*Document generated for SumOfCode Portfolio v0.0.0*
*Built with React, Vite, Tailwind CSS, and Framer Motion*
