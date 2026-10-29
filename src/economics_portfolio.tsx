import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRight, ArrowUpRight, Download, Mail, Linkedin, Github, ChevronUp, Sun, Moon, Menu, X,
} from 'lucide-react';
import { motion, useReducedMotion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import BoardNetworkGraph from './BoardNetworkGraph';  // ← Add this line
=======
import BoardNetworkGraph from './BoardNetworkGraph';
import HeroNetwork from './HeroNetwork';
>>>>>>> 3255076 (	modified:   index.html)

/* ---------- Types ---------- */
type Paper = {
  id: number;
  title: string;
  type: string;
  status: string;
  year: string;
  abstract: string;
  methodology: string[];
  keywords: string[];
  software: string[];
  supervisor?: string;
  pdfLink?: string;
};

type CvItem = {
  title: string;
  institution: string;
  period: string;
  details?: string[];
};

type CvSection = {
  category: string;
  items: CvItem[];
};

const EASE = [0.22, 1, 0.36, 1] as const;

const navigationLinks = [
  { id: 'research', label: 'Research' },
  { id: 'visualization', label: 'Network' },
  { id: 'about', label: 'About' },
  { id: 'cv', label: 'CV' },
  { id: 'contact', label: 'Contact' },
] as const;

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024] as const;
type YearType = (typeof YEARS)[number];

/* ---------- Helpers ---------- */

/** Scroll reveals are skipped for reduced motion, print, automation (screenshots,
 *  crawlers) and browsers without IntersectionObserver — content is never left hidden. */
const skipReveal = () =>
  typeof window === 'undefined' ||
  typeof IntersectionObserver === 'undefined' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  window.matchMedia('print').matches ||
  (navigator as Navigator & { webdriver?: boolean }).webdriver === true;

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; y?: number; className?: string }> = ({
  children,
  delay = 0,
  y = 28,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState<boolean>(skipReveal);

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.85, ease: EASE, delay: shown ? delay : 0 }}
    >
      {children}
    </motion.div>
  );
};

const localTime = () =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Tehran' }).format(
    new Date()
  );

const useLocalTime = () => {
  const [t, setT] = useState(localTime);
  useEffect(() => {
    const id = window.setInterval(() => setT(localTime()), 20000);
    return () => window.clearInterval(id);
  }, []);
  return t;
};

const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-accent"
    />
  );
};

<<<<<<< HEAD
/*
 * Section entrance animation, made reliable.
 *
 * Content is NEVER allowed to stay hidden just because a scroll event /
 * IntersectionObserver never fired. The hidden state lasts at most
 * REVEAL_FAILSAFE_MS after mount, and is skipped entirely when the user
 * prefers reduced motion or IntersectionObserver is unavailable (printing,
 * full-page screenshots, crawler rendering, old browsers).
 */
const REVEAL_FAILSAFE_MS = 1500;

const AnimatedSection: React.FC<{ id?: string; className?: string; children: React.ReactNode }> = ({ id, className, children }) => {
  const ref = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reduceMotion) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }
    // Failsafe: reveal even if the section never enters the viewport.
    const failsafe = window.setTimeout(() => setRevealed(true), REVEAL_FAILSAFE_MS);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
          window.clearTimeout(failsafe);
        }
      },
      { rootMargin: '0px 0px -80px 0px' }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [reduceMotion]);

  const hidden = !revealed && !reduceMotion;
  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y: 28 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
};
=======
/** Masked line rise for the hero headline */
const HeadLine: React.FC<{ i: number; children: React.ReactNode; reduce: boolean | null }> = ({ i, children, reduce }) => (
  <span className="block overflow-hidden pb-[0.1em] pr-[0.12em] -mb-[0.1em] lg:whitespace-nowrap">
    <motion.span
      className="block"
      initial={reduce ? false : { y: '112%' }}
      animate={{ y: 0 }}
      transition={{ duration: 1.05, ease: EASE, delay: 0.32 + i * 0.13 }}
    >
      {children}
    </motion.span>
  </span>
);
>>>>>>> 3255076 (	modified:   index.html)

const SectionHead: React.FC<{
  index: string;
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}> = ({ index, label, title, children }) => (
  <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="label flex items-center gap-3">
        <span aria-hidden className="h-px w-8 bg-accent" />
        {index} <span className="opacity-50">/</span> {label}
      </p>
      <h2 className="h-section mt-6 max-w-[18ch]">{title}</h2>
    </div>
    {children}
  </div>
);

const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <em className="italic text-fg/55">{children}</em>
);

/* ---------- Modal ---------- */
const Modal: React.FC<{ paper: Paper | null; onClose: () => void }> = ({ paper, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = paper ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [paper]);

  if (!paper) return null;
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={modalRef}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] bg-bg text-fg shadow-2xl ring-1 ring-fg/15"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.45, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paper-title"
        aria-describedby="paper-abstract"
      >
        <div className="sticky top-0 z-10 border-b hairline bg-bg/90 p-6 backdrop-blur sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="glass rounded-full px-3 py-1 text-[12px]">{paper.type}</span>
                <span className="glass rounded-full px-3 py-1 text-[12px]">{paper.status}</span>
                <span className="glass rounded-full px-3 py-1 text-[12px]">{paper.year}</span>
              </div>
              <h3 id="paper-title" className="mt-4 text-[clamp(1.5rem,3vw,2.1rem)] leading-[1.12] tracking-[-0.015em]">
                {paper.title}
              </h3>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="glass grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:bg-fg/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-8 p-6 sm:p-8">
          <div>
            <p className="label">Abstract</p>
            <p id="paper-abstract" className="mt-3 text-[16px] leading-[1.7] text-fg/80">
              {paper.abstract}
            </p>
          </div>
          <div>
            <p className="label">Methodology</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {paper.methodology.map((m) => (
                <span key={m} className="rounded-full border border-accent/40 px-3.5 py-1.5 text-[13px] text-accent">
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="label">Keywords</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {paper.keywords.map((k) => (
                <span key={k} className="glass rounded-full px-3.5 py-1.5 text-[13px] text-fg/80">
                  {k}
                </span>
              ))}
            </div>
          </div>
          {paper.pdfLink && (
            <div className="border-t hairline pt-6">
              <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Download paper
                <span className="btn-disc">
                  <Download className="h-4 w-4" />
                </span>
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ---------- Main ---------- */
const EconomicsPortfolio: React.FC = () => {
  const reduce = useReducedMotion();
  const time = useLocalTime();

  const [isDark, setIsDark] = useState<boolean>(() => document.documentElement.classList.contains('dark'));
  const [scrolled, setScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>('');
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [graphH, setGraphH] = useState<number>(() => (window.innerWidth < 640 ? 460 : 620));
  const [stats, setStats] = useState<{ n: number; l: number } | null>(null);
  const themeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setGraphH(window.innerWidth < 640 ? 460 : 620);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => document.documentElement.classList.remove('no-transitions'));
  }, []);

  /* hash deep-linking */
  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  /* scroll state: nav material, back-to-top, active section */
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled(window.scrollY > 40);
      setShowBackTop(window.scrollY > 700);
      let current = '';
      for (const { id } of navigationLinks) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = id;
      }
      setActive(current);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* mobile menu: lock scroll, close on Esc / resize */
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    const onResize = () => window.innerWidth >= 768 && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    if (themeTimer.current) window.clearTimeout(themeTimer.current);
    root.classList.add('theme-animating');
    const next = !root.classList.contains('dark');
    root.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      /* private mode */
    }
    setIsDark(next);
    themeTimer.current = window.setTimeout(() => root.classList.remove('theme-animating'), 450);
  }, []);

  useEffect(
    () => () => {
      if (themeTimer.current) window.clearTimeout(themeTimer.current);
    },
    []
  );

  const goTo = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 24, behavior: 'smooth' });
  }, []);

  /* network year, synced to ?year= */
  const [year, setYear] = useState<YearType>(2024);
  useEffect(() => {
    try {
      const yNum = parseInt(new URLSearchParams(window.location.search).get('year') ?? '', 10);
      if ((YEARS as readonly number[]).includes(yNum)) setYear(yNum as YearType);
    } catch {
      /* ignore */
    }
  }, []);
  const setYearAndURL = (y: YearType) => {
    setYear(y);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('year', String(y));
      window.history.replaceState(null, '', url.toString());
    } catch {
      /* ignore */
    }
  };

  /* ---------- Data ---------- */
  const papers: Paper[] = [
    {
      id: 1,
      title: 'The Effect of Board of Directors Network on Firm Performance: Evidence from Tehran Stock Exchange',
      type: "Master's Thesis",
      status: 'In progress (journal paper)',
      year: '2025',
      abstract:
        'Investigates how board network structure affects firm performance using comprehensive data from Tehran Stock Exchange (2016-2024). Employs network centrality measures and dynamic panel methods to identify causal effects, finding that director connections improve performance primarily in firms with dispersed ownership. Provides new evidence on corporate governance mechanisms in emerging markets.',
      methodology: ['Network Analysis', 'Panel Data', 'System GMM'],
      keywords: ['Corporate Governance', 'Board Networks', 'Firm Performance', 'Tehran Stock Exchange', 'Emerging Markets'],
      software: ['Python', 'Stata', 'NetworkX'],
      supervisor: 'Dr. Farshad Fatemi Ardestani',
    },
  ];

  const cv: CvSection[] = [
    {
      category: 'Education',
      items: [
        {
          title: 'M.Sc. in Economics',
          institution: 'Sharif University of Technology',
          period: 'Sep 2022 – Mar 2025',
          details: [
            'Thesis: The Effect of Board of Directors Network on Firm Performance. Supervisor: Dr. Farshad Fatemi Ardestani',
            'Selected coursework: Microeconomic Theory I, Econometrics I, Applied Econometrics, Industrial Organization, Macroeconomic Theory I, Corporate Finance I-II, Environmental Economics',
          ],
        },
        {
          title: 'B.Sc. in Electrical Engineering (Control)',
          institution: 'Isfahan University of Technology',
          period: 'Oct 2017 – Sep 2021',
          details: [
            'Final project: Bitcoin Price Prediction by LSTM Neural Network. Advisor: Dr. Maryam Zekri',
            'Selected coursework: Calculus I-II, Linear Algebra, Probability & Statistics, Regression Analysis, Partial Differential Equations, Engineering Mathematics',
          ],
        },
      ],
    },
    {
      category: 'Research experience',
      items: [
        {
          title: 'Research Assistant',
          institution: 'Research Center of Islamic Legislative Assembly, Tehran, Iran',
          period: '2023',
          details: [
            'Conducted empirical analysis of Iranian labor market data to inform minimum wage policy recommendations for national legislative body',
            'Analyzed household expenditure surveys and employment statistics using panel data methods to estimate poverty thresholds and cost-of-living adjustments',
          ],
        },
      ],
    },
    {
      category: 'Teaching experience',
      items: [
        {
          title: 'Teaching Assistant, Introductory Econometrics (Undergraduate)',
          institution: 'Sharif University of Technology',
          period: 'Spring 2025',
          details: [
            'Assisted in Undergraduate Econometrics',
            'Held weekly tutorial sessions on Stata and regression analysis',
            'Graded assignments and provided feedback to students',
          ],
        },
      ],
    },
    {
      category: 'Honors',
      items: [
        {
          title: 'Ranked 22nd out of 5,000 (top 0.4%)',
          institution: 'Iranian National Graduate Entrance Exam',
          period: 'May 2022',
        },
        {
          title: 'Merit-based full-tuition scholarship',
          institution: 'Sharif University of Technology',
          period: 'Sep 2022 – Mar 2025',
        },
      ],
    },
  ];

  const skills: Record<string, string[]> = {
    'Econometric software': ['Stata (Advanced)', 'Python (Pandas, NumPy, Statsmodels)', 'R (Basic)', 'EViews'],
    'Data analysis & visualization': [
      'Network Analysis (NetworkX, igraph)',
      'Data Cleaning & Wrangling',
      'Statistical Modeling',
      'Visualization (Matplotlib, Seaborn)',
    ],
    'Research methods': ['Panel Data Analysis', 'Time Series Analysis', 'Social Network Analysis', 'Causal Inference (DID, IV)'],
  };

  const interests = ['Corporate Governance', 'Industrial Organizations', 'Social Network Analysis', 'Applied Econometrics'];

  const paper = papers[0];
  const rise = (d: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, ease: EASE, delay: d },
        };

  return (
    <div className="relative">
      <ScrollProgress />

      {/* ------------------------------ Navigation ------------------------------ */}
      <motion.nav
        aria-label="Primary"
        className="fixed inset-x-0 top-0 z-[60] px-3 pt-3 sm:px-6 sm:pt-4"
        initial={reduce ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
      >
        <div className="mx-auto flex max-w-[75rem] items-center justify-between gap-3">
          <a
            href="#home"
            onClick={(e) => {
              goTo(e, 'home');
              setMenuOpen(false);
            }}
            className={`glass flex h-12 items-center gap-3 rounded-full pl-1.5 pr-1.5 transition-colors duration-300 lg:pr-5 ${
              scrolled ? '[background:hsl(var(--bg)/0.72)]' : ''
            }`}
            aria-label="Mohammad Mehdi Pakravan — home"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-[20px] italic leading-none text-on-accent">
              mp
            </span>
            <span className="hidden whitespace-nowrap text-[13.5px] font-medium tracking-[-0.01em] lg:inline">Mohammad Mehdi Pakravan</span>
          </a>

          <div
            className={`glass hidden h-12 items-center gap-0.5 rounded-full px-1.5 transition-colors duration-300 md:flex ${
              scrolled ? '[background:hsl(var(--bg)/0.72)]' : ''
            }`}
          >
            {navigationLinks.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => goTo(e, id)}
                aria-current={active === id ? 'true' : undefined}
                className={`rounded-full px-4 py-2 text-[13.5px] transition-colors duration-300 ${
                  active === id ? 'bg-fg/10 text-fg' : 'text-fg/60 hover:text-fg'
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`glass grid h-12 w-12 place-items-center rounded-full transition-colors duration-300 hover:bg-fg/10 ${
                scrolled ? '[background:hsl(var(--bg)/0.72)]' : ''
              }`}
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <a
              href="#contact"
              onClick={(e) => goTo(e, 'contact')}
              className="hidden h-12 items-center rounded-full bg-fg px-6 text-[13.5px] font-medium text-bg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97] lg:inline-flex"
            >
              Get in touch
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              className={`glass grid h-12 w-12 place-items-center rounded-full md:hidden ${
                scrolled || menuOpen ? '[background:hsl(var(--bg)/0.72)]' : ''
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-navigation"
            className="fixed inset-0 z-[55] flex flex-col justify-center bg-bg/95 px-8 backdrop-blur-xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="space-y-1">
              {navigationLinks.map(({ id, label }, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.08 + i * 0.05 }}
                >
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      goTo(e, id);
                      setMenuOpen(false);
                    }}
                    className="flex items-baseline gap-4 border-b hairline py-4 font-display text-[2.6rem] leading-none tracking-[-0.02em]"
                  >
                    <span className="label w-6">0{i + 1}</span>
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* -------------------------------- Hero -------------------------------- */}
        <header id="home" className="relative isolate min-h-[100dvh] overflow-hidden">
          <HeroNetwork dataUrl="/data/board_network_2024_no_isolates.json" className="absolute inset-0 -z-20" />
          {/* protect the headline column; fade into the next section */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 hidden lg:block bg-[linear-gradient(90deg,hsl(var(--bg)/0.82)_0%,hsl(var(--bg)/0.4)_38%,transparent_64%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 lg:hidden bg-[linear-gradient(180deg,hsl(var(--bg)/0.35)_0%,hsl(var(--bg)/0.88)_58%)]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-bg to-transparent" />

          <div className="container-x relative flex min-h-[100dvh] flex-col pb-8 pt-28 sm:pt-32 [@media(max-height:760px)]:pt-24">
            <div className="grid flex-1 items-center gap-12 py-8 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-7">
                <motion.div {...rise(0.2)}>
                  <p className="glass inline-flex h-9 items-center gap-2.5 rounded-full px-4 text-[12.5px] text-fg/85">
                    <span aria-hidden className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
                    Open to PhD opportunities in Economics &amp; Finance
                  </p>
                </motion.div>

                <h1 className="mt-7 text-[clamp(3.1rem,min(8.4vw,12.5vh),6.25rem)] leading-[0.95] tracking-[-0.028em] [@media(max-height:760px)]:mt-5">
                  <HeadLine i={0} reduce={reduce}>
                    Who sits on
                  </HeadLine>
                  <HeadLine i={1} reduce={reduce}>
                    the board
                  </HeadLine>
                  <HeadLine i={2} reduce={reduce}>
                    <em className="italic text-fg/55">shapes the firm.</em>
                  </HeadLine>
                </h1>

                <motion.p
                  {...rise(0.85)}
                  className="mt-7 max-w-[32rem] text-[16.5px] leading-[1.6] text-fg/65 [@media(max-height:760px)]:mt-5"
                >
                  I’m Mohammad Mehdi Pakravan, an economist (M.Sc., Sharif University of Technology) studying how
                  board-of-director networks shape firm performance in emerging markets.
                </motion.p>

                <motion.div {...rise(1.0)} className="mt-9 flex flex-wrap items-center gap-3 [@media(max-height:760px)]:mt-6">
                  <a href="#research" onClick={(e) => goTo(e, 'research')} className="btn btn-primary">
                    Read the research
                    <span className="btn-disc">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </a>
                  <a href="/assets/cv_main.pdf" className="btn btn-ghost">
                    <Download className="h-4 w-4" />
                    Download CV
                  </a>
                  <a
                    href="mailto:pakravanmohammad.eco@gmail.com"
                    aria-label="Email Mohammad"
                    className="btn btn-ghost !w-12 !px-0"
                  >
                    <Mail className="h-[18px] w-[18px]" />
                  </a>
                </motion.div>
              </div>

              {/* Portrait */}
              <div className="lg:col-span-5 lg:justify-self-end">
                <motion.figure
                  className="relative mx-auto w-[min(68vw,300px)] lg:mx-0 lg:w-[min(100%,360px)] [@media(max-height:760px)]:lg:w-[300px]"
                  initial={reduce ? false : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border border-accent/45 sm:translate-x-4 sm:translate-y-4"
                  />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-surface shadow-[0_30px_70px_-28px_rgba(0,0,0,0.65)] ring-1 ring-fg/15">
                    <motion.img
                      src="/assets/images/portrait-960.jpg"
                      srcSet="/assets/images/portrait-640.jpg 640w, /assets/images/portrait-960.jpg 960w"
                      sizes="(min-width: 1024px) 360px, 68vw"
                      alt="Portrait of Mohammad Mehdi Pakravan"
                      width={960}
                      height={1280}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="h-full w-full object-cover object-[50%_18%]"
                      initial={reduce ? false : { scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.8, ease: EASE }}
                    />
                    <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 to-transparent" />
                    <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-2 text-[12px] text-[#f1ede3]">
                      <span className="rounded-full bg-black/35 px-3 py-1.5 ring-1 ring-white/20 backdrop-blur">Isfahan, Iran</span>
                      <span className="rounded-full bg-black/35 px-3 py-1.5 tabular-nums ring-1 ring-white/20 backdrop-blur">
                        {time} local
                      </span>
                    </figcaption>
                  </div>
                </motion.figure>
              </div>
            </div>

            {/* Key facts strip */}
            <motion.dl
              {...rise(1.25)}
              className="grid border-t hairline pt-6 sm:grid-cols-3 sm:pt-7 [&>div]:py-3 sm:[&>div]:py-0"
            >
              {[
                ['Top 0.4%', 'Iranian National Graduate Entrance Exam, rank 22 of 5,000'],
                ['2016–2024', 'Tehran Stock Exchange board data behind the thesis'],
                ["M.Sc. ’25", 'Economics, Sharif University of Technology'],
              ].map(([k, v], i) => (
                <div
                  key={k}
                  className={`flex items-baseline gap-4 sm:block ${i > 0 ? 'sm:border-l hairline sm:pl-8' : ''} ${
                    i < 2 ? 'sm:pr-8' : ''
                  }`}
                >
                  <dt className="shrink-0 font-display text-[2rem] leading-none tracking-[-0.02em] sm:text-[2.6rem]">{k}</dt>
                  <dd className="text-[12.5px] leading-snug text-fg/62 sm:mt-2.5 sm:max-w-[27ch]">{v}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
        </header>

        {/* ------------------------------ Research ------------------------------ */}
        <section id="research" className="section-y scroll-mt-6" aria-labelledby="research-title">
          <div className="container-x">
            <Reveal>
              <SectionHead
                index="01"
                label="Research"
                title={
                  <span id="research-title">
                    Boards, networks, <Em>performance.</Em>
                  </span>
                }
              />
            </Reveal>

            <Reveal delay={0.1} className="mt-14 md:mt-20">
              <article
                className="group relative grid cursor-pointer gap-10 rounded-[32px] border hairline bg-surface/60 p-6 transition-colors duration-500 hover:border-accent/50 sm:p-10 lg:grid-cols-12 lg:gap-14 lg:p-14"
                onClick={() => setSelectedPaper(paper)}
                role="button"
                tabIndex={0}
                aria-label={`Open details: ${paper.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPaper(paper);
                  }
                }}
              >
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
                    <span className="glass rounded-full px-3.5 py-1.5">{paper.type}</span>
                    <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5">
                      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {paper.status}
                    </span>
                    <span className="glass rounded-full px-3.5 py-1.5 tabular-nums">{paper.year}</span>
                  </div>
                  <h3 className="mt-7 text-[clamp(1.95rem,3.6vw,3.15rem)] leading-[1.06] tracking-[-0.022em]">{paper.title}</h3>
                  <p className="mt-7 max-w-[38rem] text-[16px] leading-[1.7] text-fg/70">{paper.abstract}</p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <span className="btn btn-ghost">
                      Read full details
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>

<<<<<<< HEAD
          {/* Skills */}
          <AnimatedSection id="skills" className="scroll-mt-24 max-w-6xl mx-auto px-4 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-bold">Technical Skills</h2>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              {Object.entries({
                "Econometric Software": ["Stata (Advanced)", "Python (Pandas, NumPy, Statsmodels)", "R (Basic)", "EViews"],
                "Data Analysis & Visualization": ["Network Analysis (NetworkX, igraph)", "Data Cleaning & Wrangling", "Statistical Modeling", "Visualization (Matplotlib, Seaborn)"],
                "Research Methods": ["Panel Data Analysis", "Time Series Analysis", "Social Network Analysis", "Causal Inference (DID, IV)"]
              }).map(([category, items]) => (
                <div
                  key={category}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/90 dark:bg-slate-900/80"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">{category}</h3>
                  <ul className="mt-3 space-y-2 text-slate-700 dark:text-slate-300">
                    {(items as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-sky-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AnimatedSection>
=======
                <div className="flex flex-col justify-between gap-10 lg:col-span-5 lg:border-l lg:pl-12 hairline">
                  <figure>
                    <p className="label">Key finding</p>
                    <blockquote className="mt-5 font-display text-[clamp(1.6rem,2.5vw,2.2rem)] italic leading-[1.18] tracking-[-0.015em]">
                      Director connections improve performance primarily in firms with dispersed ownership.
                    </blockquote>
                    <figcaption className="mt-4 text-[12.5px] text-fg/62">From the abstract · Tehran Stock Exchange, 2016–2024</figcaption>
                  </figure>

                  <dl className="divide-y divide-fg/10 border-y hairline text-[14px]">
                    {[
                      ['Methods', paper.methodology.join(' · ')],
                      ['Software', paper.software.join(' · ')],
                      ['Supervisor', paper.supervisor ?? ''],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-4 py-3.5">
                        <dt className="label pt-0.5">{k}</dt>
                        <dd className="text-fg/80">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            </Reveal>
          </div>
        </section>
>>>>>>> 3255076 (	modified:   index.html)

        {/* ------------------------------ Network ------------------------------ */}
        <section
          id="visualization"
          className="scope-night relative mx-2 scroll-mt-6 overflow-hidden rounded-[32px] bg-surface text-fg ring-1 ring-white/10 sm:mx-4 lg:mx-6 lg:rounded-[48px]"
          aria-labelledby="network-title"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,hsl(var(--fg)/0.05),transparent_70%)]"
          />
          <div className="container-x section-y relative">
            <Reveal>
              <SectionHead
                index="02"
                label="Network"
                title={
                  <span id="network-title">
                    The network, <Em>drawn from the data.</Em>
                  </span>
                }
              />
            </Reveal>

            <Reveal delay={0.1} className="mt-12 md:mt-16">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="label flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums">
                  <span>{year}</span>
                  {stats && (
                    <>
                      <span aria-hidden className="opacity-40">/</span>
                      <span>{stats.n} firms</span>
                      <span aria-hidden className="opacity-40">/</span>
                      <span>{stats.l} board interlocks</span>
                    </>
                  )}
                </p>
                <div
                  role="radiogroup"
                  aria-label="Year"
                  className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-1"
                >
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      role="radio"
                      aria-checked={year === y}
                      onClick={() => setYearAndURL(y)}
                      className={`h-10 shrink-0 rounded-full px-4 text-[13px] tabular-nums transition-colors duration-300 ${
                        year === y ? 'bg-accent font-medium text-on-accent' : 'glass text-fg/70 hover:text-fg'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={year}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <BoardNetworkGraph
                    dataUrl={`/data/board_network_${year}_no_isolates.json`}
                    height={graphH}
                    minRadius={3.5}
                    maxRadius={14}
                    onStats={(n, l) => setStats({ n, l })}
                  />
                </motion.div>
              </AnimatePresence>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <div className="grid gap-8 border-t hairline pt-8 text-[14px] md:grid-cols-3 md:gap-12">
                {[
<<<<<<< HEAD
                  ...timeline
                ].map((section, idx) => (
                  <div key={idx} className="mb-8">
                    <div className="sticky top-20 z-10 mb-4 py-2 px-4 -ml-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-full inline-block">
                      <h3 className="text-sm font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                        {section.category}
                      </h3>
                    </div>
                    <div className="space-y-6 border-l-2 border-slate-200 dark:border-slate-700 pl-6 ml-2">
                      {section.items.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={i}
                            className="relative"
                          >
                            <div className={`absolute -left-[1.875rem] w-9 h-9 rounded-full ${dotColor[item.color]} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-4">
                              <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.institution}</p>
                              <p className="text-xs text-slate-500 mt-1">{item.period}</p>
                              {item.details && (
                                <ul className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                  {item.details.map((detail, j) => (
                                    <li key={j} className="flex items-start gap-2">
                                      <span className="text-sky-500 mt-1">•</span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
=======
                  ['Explore', 'Drag nodes to reposition, scroll to zoom, hover a firm to isolate its neighbours and read its details.'],
                  ['Read the graph', 'Node size shows board connections, line weight shows shared directors, and colour marks firm category.'],
                  ['Source', 'Tehran Stock Exchange board composition data, with network analysis metrics computed per year.'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="label">{k}</p>
                    <p className="mt-3 max-w-[30ch] leading-[1.6] text-fg/65">{v}</p>
>>>>>>> 3255076 (	modified:   index.html)
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* -------------------------------- About -------------------------------- */}
        <section id="about" className="section-y scroll-mt-6" aria-labelledby="about-title">
          <div className="container-x">
            <Reveal>
              <SectionHead
                index="03"
                label="About"
                title={
                  <span id="about-title">
                    Interested in <Em>economics.</Em>
                  </span>
                }
              />
            </Reveal>

            <div className="mt-14 grid gap-14 md:mt-20 lg:grid-cols-12 lg:gap-12">
              <Reveal className="lg:col-span-7">
                <p className="font-display text-[clamp(1.55rem,2.5vw,2.15rem)] leading-[1.28] tracking-[-0.012em]">
                  I recently completed my Master’s degree in Economics at Sharif University of Technology, where I
                  specialized in corporate governance and network analysis. My thesis examines how board of directors’
                  network structures influence firm performance in the Tehran Stock Exchange.
                </p>
                <div className="mt-9 max-w-[36rem] space-y-5 text-[16.5px] leading-[1.7] text-fg/65">
                  <p>
                    My research interests lie at the intersection of corporate finance, network economics, and applied
                    econometrics. I am particularly interested in understanding how social networks and relationships
                    between corporate decision-makers affect economic outcomes in emerging markets.
                  </p>
                  <p>
                    I am currently preparing my thesis for journal publication and exploring opportunities for PhD
                    studies in Economics, Finance, or related fields.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.12} className="lg:col-span-5">
                <p className="label">Research interests</p>
                <ul className="mt-5 divide-y divide-fg/10 border-y hairline">
                  {interests.map((it, i) => (
                    <li key={it} className="group flex items-baseline gap-5 py-4">
                      <span className="label w-6 tabular-nums">0{i + 1}</span>
                      <span className="font-display text-[1.65rem] leading-tight tracking-[-0.015em] transition-colors duration-300 group-hover:text-accent">
                        {it}
                      </span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-8 grid grid-cols-[6.5rem_1fr] gap-y-3 text-[14px]">
                  <dt className="label pt-0.5">Languages</dt>
                  <dd className="text-fg/80">Persian (native), English (fluent)</dd>
                  <dt className="label pt-0.5">Location</dt>
                  <dd className="text-fg/80">Isfahan, Iran · open to relocation</dd>
                </dl>
              </Reveal>
            </div>

            {/* Toolkit */}
            <div id="skills" className="mt-24 scroll-mt-6 md:mt-32">
              <Reveal>
                <p className="label flex items-center gap-3">
                  <span aria-hidden className="h-px w-8 bg-accent" />
                  Technical skills
                </p>
              </Reveal>
              <div className="mt-8 grid gap-x-12 gap-y-12 md:grid-cols-3">
                {Object.entries(skills).map(([category, items], i) => (
                  <Reveal key={category} delay={i * 0.1}>
                    <h3 className="border-t hairline pt-5 font-display text-[1.7rem] leading-tight tracking-[-0.015em]">{category}</h3>
                    <ul className="mt-5 space-y-2.5 text-[15px] text-fg/70">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-accent" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------- CV --------------------------------- */}
        <section id="cv" className="section-y scroll-mt-6 pt-0" aria-labelledby="cv-title">
          <div className="container-x">
            <Reveal>
              <SectionHead
                index="04"
                label="Curriculum vitae"
                title={
                  <span id="cv-title">
                    Education, research <Em>&amp; teaching.</Em>
                  </span>
                }
              >
                <a href="/assets/cv_main.pdf" target="_blank" rel="noopener noreferrer" className="btn btn-primary self-start md:self-end">
                  Download CV (PDF)
                  <span className="btn-disc">
                    <Download className="h-4 w-4" />
                  </span>
                </a>
              </SectionHead>
            </Reveal>

            <div className="mt-14 md:mt-20">
              {cv.map((section) => (
                <Reveal key={section.category}>
                  <div className="grid gap-8 border-t hairline py-10 md:grid-cols-12 md:gap-10 md:py-14">
                    <h3 className="label md:sticky md:top-28 md:col-span-2 md:self-start">{section.category}</h3>
                    <div className="space-y-12 md:col-span-10">
                      {section.items.map((item) => (
                        <div key={item.title} className="grid gap-x-10 gap-y-3 sm:grid-cols-[9.5rem_1fr]">
                          <p className="pt-1.5 text-[13px] tabular-nums text-fg/62">{item.period}</p>
                          <div>
                            <h4 className="font-display text-[clamp(1.5rem,2.3vw,1.95rem)] leading-[1.12] tracking-[-0.018em]">{item.title}</h4>
                            <p className="mt-1.5 text-[15px] text-fg/60">{item.institution}</p>
                            {item.details && (
                              <ul className="mt-5 space-y-3 text-[15px] leading-[1.6] text-fg/75">
                                {item.details.map((d) => (
                                  <li key={d} className="flex items-start gap-3.5">
                                    <span aria-hidden className="mt-[0.78em] h-px w-3 shrink-0 bg-accent" />
                                    <span>{d}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------- Contact ------------------------------- */}
        <section id="contact" className="scroll-mt-6 border-t hairline" aria-labelledby="contact-title">
          <div className="container-x section-y pb-16 md:pb-24">
            <Reveal>
              <p className="label flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-accent" />
                05 <span className="opacity-50">/</span> Contact
              </p>
              <h2
                id="contact-title"
                className="mt-7 text-[clamp(3.2rem,11.5vw,9.5rem)] leading-[0.92] tracking-[-0.03em]"
              >
                Let’s talk <Em>research.</Em>
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12">
              <Reveal delay={0.1} className="lg:col-span-7">
                <a
                  href="mailto:pakravanmohammad.eco@gmail.com"
                  className="link-u break-all font-display text-[clamp(1.5rem,3.6vw,2.9rem)] leading-tight tracking-[-0.02em]"
                >
                  pakravanmohammad.eco@gmail.com
                </a>
              </Reveal>
              <Reveal delay={0.2} className="lg:col-span-5">
                <p className="max-w-[28rem] text-[16.5px] leading-[1.7] text-fg/65">
                  I am actively seeking PhD opportunities in Economics, Finance, or related fields. Feel free to reach out
                  for research collaboration or academic discussions.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="mailto:pakravanmohammad.eco@gmail.com" className="btn btn-ghost">
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                  <a href="https://www.linkedin.com/in/mohammad-pak/" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <a href="https://github.com/mohapak" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t hairline">
        <div className="container-x flex flex-col items-start justify-between gap-4 py-8 text-[13px] text-fg/62 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Mohammad Mehdi Pakravan. All rights reserved.</p>
          <p>Isfahan, Iran</p>
          <a href="#home" onClick={(e) => goTo(e, 'home')} className="link-u inline-flex items-center gap-2 text-fg/80">
            Back to top <ChevronUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </footer>

      {/* floating back-to-top */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            title="Back to top"
            className="glass fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full [background:hsl(var(--bg)/0.75)] transition-colors hover:bg-fg/10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPaper && <Modal key="research-modal" paper={selectedPaper} onClose={() => setSelectedPaper(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default EconomicsPortfolio;
