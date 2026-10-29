import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

/**
 * Signature element: the actual Tehran Stock Exchange board-interlock network
 * (same JSON the interactive graph uses) drawn as a quiet canvas behind the hero.
 *
 *  - Layout is solved once (d3-force, 320 ticks) — no continuous simulation cost.
 *  - Nodes drift a few px on slow sine waves; the cursor lights up the
 *    neighbourhood in the accent colour (lerped, .1).
 *  - Pauses when off-screen / tab hidden. Static frame for reduced motion.
 *  - Touch devices: no pointer effect, drift only.
 */

type SimNode = d3.SimulationNodeDatum & {
  id: string;
  size?: number;
  r: number;
  hub: boolean;
  ph: number;
  lit: number; // 0..1 pointer highlight, lerped
};
type SimLink = d3.SimulationLinkDatum<SimNode> & { weight?: number };

interface Props {
  dataUrl: string;
  className?: string;
}

const readTriplet = (name: string): [number, number, number] => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = raw.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])] : [0, 0, 50];
};
const hsla = (t: [number, number, number], a: number) => `hsla(${t[0]},${t[1]}%,${t[2]}%,${a})`;

const HeroNetwork: React.FC<Props> = ({ dataUrl, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const host = canvas.parentElement as HTMLElement;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let raf = 0;
    let alive = true;
    let onScreen = true;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let nodes: SimNode[] = [];
    let links: { s: SimNode; t: SimNode; w: number }[] = [];
    // layout in unit space, mapped to the canvas on resize
    let bbox = { x0: 0, y0: 0, w: 1, h: 1 };
    let fg: [number, number, number] = [42, 34, 91];
    let accent: [number, number, number] = [40, 58, 63];
    const ptr = { x: -9999, y: -9999 };

    const readColors = () => {
      fg = readTriplet('--fg');
      accent = readTriplet('--accent');
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Map unit-space node → canvas px. The graph is centred right of centre so
    // the headline column on the left stays calm.
    const project = (n: SimNode, t: number) => {
      const wide = W >= 900;
      const boxW = wide ? W * 0.7 : W * 1.05;
      const boxH = H * (wide ? 0.98 : 0.78);
      const s = Math.min(boxW / bbox.w, boxH / bbox.h);
      const cx = wide ? W * 0.67 : W * 0.5;
      const cy = wide ? H * 0.52 : H * 0.62;
      const dx = reduce ? 0 : Math.sin(t * 0.00028 + n.ph) * 3.2;
      const dy = reduce ? 0 : Math.cos(t * 0.00023 + n.ph * 1.3) * 3.2;
      return {
        x: cx + ((n.x ?? 0) - (bbox.x0 + bbox.w / 2)) * s + dx,
        y: cy + ((n.y ?? 0) - (bbox.y0 + bbox.h / 2)) * s + dy,
      };
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const pos = new Map<SimNode, { x: number; y: number }>();
      for (const n of nodes) pos.set(n, project(n, t));

      // pointer proximity → lit (lerped)
      const R = 190;
      for (const n of nodes) {
        const p = pos.get(n)!;
        const d = Math.hypot(p.x - ptr.x, p.y - ptr.y);
        const target = finePointer && !reduce ? Math.max(0, 1 - d / R) : 0;
        n.lit += (target - n.lit) * 0.1;
      }

      ctx.lineCap = 'round';
      for (const l of links) {
        const a = pos.get(l.s)!;
        const b = pos.get(l.t)!;
        const lit = Math.max(l.s.lit, l.t.lit);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = lit > 0.02 ? hsla(accent, 0.14 + lit * 0.7) : hsla(fg, 0.24);
        ctx.lineWidth = 0.8 + lit * 1.1 + Math.min(l.w, 4) * 0.14;
        ctx.stroke();
      }

      for (const n of nodes) {
        const p = pos.get(n)!;
        const rad = n.r * (1 + n.lit * 0.5);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        if (n.hub || n.lit > 0.05) {
          ctx.fillStyle = hsla(accent, n.hub ? 0.8 + n.lit * 0.2 : 0.3 + n.lit * 0.7);
        } else {
          ctx.fillStyle = hsla(fg, 0.55);
        }
        ctx.fill();
        if (n.hub) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad + 4 + n.lit * 4, 0, Math.PI * 2);
          ctx.strokeStyle = hsla(accent, 0.3 + n.lit * 0.4);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    };

    const loop = (t: number) => {
      if (!alive) return;
      if (onScreen && !document.hidden) draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
    };
    const onLeave = () => {
      ptr.x = -9999;
      ptr.y = -9999;
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      resize();
      if (nodes.length && reduce) draw(0);
    });
    ro.observe(host);

    const mo = new MutationObserver(() => {
      readColors();
      if (reduce && nodes.length) draw(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    (async () => {
      try {
        const res = await fetch(dataUrl);
        if (!res.ok) return;
        const data: { nodes: { id: string; size?: number }[]; links: SimLink[] } = await res.json();
        if (!alive) return;

        const sizes = data.nodes.map((n) => n.size ?? 8);
        const sMin = d3.min(sizes) ?? 1;
        const sMax = d3.max(sizes) ?? 20;
        const rScale = d3.scaleSqrt().domain([sMin, Math.max(sMin + 1, sMax)]).range([1.6, 5.2]);
        const hubCut = d3.quantile([...sizes].sort(d3.ascending), 0.92) ?? sMax;

        nodes = data.nodes.map((n, i) => ({
          id: n.id,
          size: n.size,
          r: rScale(n.size ?? 8),
          hub: (n.size ?? 0) >= hubCut,
          ph: (i * 2.399963) % (Math.PI * 2), // golden-angle phase spread
          lit: 0,
        }));
        const simLinks: SimLink[] = data.links.map((l) => ({ ...l }));

        const sim = d3
          .forceSimulation<SimNode>(nodes)
          .force('link', d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(30).strength(0.8))
          .force('charge', d3.forceManyBody<SimNode>().strength(-34).distanceMax(200))
          .force('x', d3.forceX(0).strength(0.11))
          .force('y', d3.forceY(0).strength(0.13))
          .force('collide', d3.forceCollide<SimNode>().radius((d) => d.r + 4))
          .stop();
        sim.tick(320);

        const byId = new Map(nodes.map((n) => [n.id, n]));
        links = simLinks
          .map((l) => ({
            s: (typeof l.source === 'object' ? l.source : byId.get(String(l.source))) as SimNode,
            t: (typeof l.target === 'object' ? l.target : byId.get(String(l.target))) as SimNode,
            w: l.weight ?? 1,
          }))
          .filter((l) => l.s && l.t);

        const xs = nodes.map((n) => n.x ?? 0).sort(d3.ascending);
        const ys = nodes.map((n) => n.y ?? 0).sort(d3.ascending);
        const x0 = d3.quantile(xs, 0.03) ?? 0;
        const y0 = d3.quantile(ys, 0.03) ?? 0;
        bbox = {
          x0,
          y0,
          w: Math.max(1, (d3.quantile(xs, 0.97) ?? 1) - x0),
          h: Math.max(1, (d3.quantile(ys, 0.97) ?? 1) - y0),
        };

        readColors();
        resize();
        draw(0);
        canvas.style.opacity = '1';
        if (!reduce) raf = requestAnimationFrame(loop);
      } catch {
        /* decorative only — fail silently */
      }
    })();

    if (finePointer) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
    }

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [dataUrl]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ opacity: 0, transition: 'opacity 1.6s cubic-bezier(0.22,1,0.36,1)' }}
    />
  );
};

export default HeroNetwork;
