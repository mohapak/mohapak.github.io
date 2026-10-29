import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { ZoomBehavior } from 'd3-zoom';
import type { D3DragEvent } from 'd3-drag';

type NodeDatum = {
  id: string;
  label?: string;
  size?: number;
  color?: string;
  title?: string;
  x?: number; y?: number; vx?: number; vy?: number;
  fx?: number | null; fy?: number | null;
};

type LinkDatum = { source: string | NodeDatum; target: string | NodeDatum; weight?: number };
type GraphData = { nodes: NodeDatum[]; links: LinkDatum[] };

interface Props {
  dataUrl: string;
  height?: number;
  minRadius?: number;
  maxRadius?: number;
  /** Reports node / link counts once data is loaded (for the stats line). */
  onStats?: (nodes: number, links: number) => void;
}

/* The panel is always "night", so the graph uses one fixed, restrained palette.
   Firm categories from the data are mapped (by frequency) onto these tones. */
const PALETTE = [
  '#d9b86c', // gold
  '#5fb7ad', // teal
  '#8da7dc', // steel blue
  '#ece6d6', // ivory
  '#cf946f', // clay
  '#a3c487', // sage
  '#b793cc', // heather
  '#7f93a8', // slate
];
const NODE_STROKE = '#0f1730';
const LINK = 'rgba(214, 223, 245, 0.30)';
const LINK_DIM = 'rgba(214, 223, 245, 0.07)';
const LINK_ON = 'rgba(217, 184, 108, 0.9)';

const getNodeDescription = (node: NodeDatum) => {
  const fallback = node.label ?? node.id;
  if (!node.title) return fallback;
  return (
    node.title
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .trim() || fallback
  );
};

const BoardNetworkGraph: React.FC<Props> = ({
  dataUrl,
  height = 620,
  minRadius = 3,
  maxRadius = 12,
  onStats,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const fitRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const onStatsRef = useRef(onStats);
  onStatsRef.current = onStats;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [accessibleNodes, setAccessibleNodes] = useState<NodeDatum[]>([]);

  useEffect(() => {
    let isMounted = true;
    let cleanup: (() => void) | undefined;
    setLoading(true);

    (async () => {
      try {
        const resp = await fetch(dataUrl);
        if (!resp.ok) throw new Error(`Failed to load ${dataUrl}`);
        const data: GraphData = await resp.json();
        if (!isMounted) return;
        setAccessibleNodes(data.nodes);
        onStatsRef.current?.(data.nodes.length, data.links.length);

        const container = wrapRef.current!;
        const frame = frameRef.current!;
        const svgEl = svgRef.current!;
        if (!container || !frame || !svgEl) return;

        d3.select(container).style('position', 'relative');

        const svg = d3.select(svgEl);
        svg.selectAll('*').remove();

        const width = frame.clientWidth;
        svg
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('preserveAspectRatio', 'xMidYMid meet')
          .classed('select-none', true)
          .style('width', '100%')
          .style('height', `${height}px`)
          .style('background', 'transparent')
          .style('display', 'block');

        /* category colour → palette tone (most common category gets gold) */
        const freq = d3.rollup(data.nodes, (v) => v.length, (d) => d.color ?? '');
        const ranked = [...freq.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
        const tone = (c?: string) => PALETTE[Math.max(0, ranked.indexOf(c ?? '')) % PALETTE.length];

        /* neighbour lookup for hover focus */
        const neighbours = new Map<string, Set<string>>();
        const idOf = (v: string | NodeDatum) => (typeof v === 'string' ? v : v.id);
        data.links.forEach((l) => {
          const a = idOf(l.source);
          const b = idOf(l.target);
          if (!neighbours.has(a)) neighbours.set(a, new Set());
          if (!neighbours.has(b)) neighbours.set(b, new Set());
          neighbours.get(a)!.add(b);
          neighbours.get(b)!.add(a);
        });

        const tooltip = d3
          .select(container)
          .append('div')
          .attr(
            'class',
            [
              'pointer-events-none absolute z-20 max-w-[16rem]',
              'rounded-xl px-3 py-2 text-[12px] leading-snug shadow-2xl backdrop-blur',
              'bg-[#0a1020]/95 text-[#ece6d6] ring-1 ring-white/15',
              'text-right whitespace-pre-line',
            ].join(' ')
          )
          .attr('dir', 'auto')
          .style('opacity', '0')
          .style('transform', 'translate(-50%, -120%)');

        const g = svg.append('g');

        let fitK = 1;
        const zoom = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 8])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
            // labels appear once the person zooms in beyond the fitted view
            labels.attr('opacity', event.transform.k > fitK * 1.7 ? 0.9 : 0);
          });

        svg.call(zoom);
        zoomRef.current = zoom;
        svg.on('wheel.zoom', null as any);

        svg.on('wheel.smooth', (event: any) => {
          event.preventDefault();
          const we = event as WheelEvent;
          const p = d3.pointer(event, svgEl);
          const LINE_HEIGHT = 16;
          const deltaY =
            we.deltaMode === 1 ? we.deltaY * LINE_HEIGHT : we.deltaMode === 2 ? we.deltaY * LINE_HEIGHT * 24 : we.deltaY;
          const intensity = we.ctrlKey ? 0.0012 : 0.0022;
          const k = Math.pow(2, -deltaY * intensity);
          svg.interrupt();
          svg.transition().duration(180).ease(d3.easeCubicOut).call(zoom.scaleBy as any, k, p);
        });

        svg.on('dblclick.zoom', (event: any) => {
          const p = d3.pointer(event, svgEl);
          const t = d3.zoomTransform(svgEl);
          const factor = event.shiftKey ? 1 / 1.6 : 1.6;
          const newK = Math.max(0.1, Math.min(8, t.k * factor));
          const newTransform = d3.zoomIdentity.translate(p[0], p[1]).scale(newK).translate(-p[0], -p[1]);
          svg.transition().duration(240).ease(d3.easeCubicOut).call(zoom.transform, newTransform);
        });

        const sizes = data.nodes.map((n) => n.size ?? 8);
        const sMin = Math.max(1, d3.min(sizes) ?? 1);
        const sMax = Math.max(sMin + 1, d3.max(sizes) ?? 20);
        const r = d3.scaleSqrt().domain([sMin, sMax]).range([minRadius, maxRadius]);

        const link = g
          .append('g')
          .attr('stroke-linecap', 'round')
          .selectAll('line.link')
          .data(data.links)
          .join('line')
          .attr('class', 'link')
          .attr('stroke', LINK)
          .attr('vector-effect', 'non-scaling-stroke')
          .style('pointer-events', 'none')
          .style('transition', 'stroke 0.2s')
          .attr('stroke-width', (l) => Math.max(0.8, Math.min(3, (l.weight ?? 1) * 0.6)));

        const node = g
          .append('g')
          .selectAll<SVGGElement, NodeDatum>('g.node')
          .data(data.nodes)
          .join('g')
          .attr('class', 'node')
          .attr('tabindex', 0)
          .attr('role', 'img')
          .style('cursor', 'grab')
          .attr('aria-label', (d) => getNodeDescription(d))
          .call(
            d3
              .drag<SVGGElement, NodeDatum>()
              .on('start', (_event: D3DragEvent<SVGGElement, NodeDatum, unknown>, d) => {
                sim.alpha(0.6).restart();
                d.fx = d.x;
                d.fy = d.y;
              })
              .on('drag', (event: D3DragEvent<SVGGElement, NodeDatum, unknown>, d) => {
                d.fx = event.x;
                d.fy = event.y;
              })
              .on('end', (_event: D3DragEvent<SVGGElement, NodeDatum, unknown>, d) => {
                d.fx = null;
                d.fy = null;
              })
          );

        node.append('title').text((d) => getNodeDescription(d));
        const circles = node
          .append('circle')
          .attr('r', (d) => r(d.size ?? 8))
          .attr('fill', (d) => tone(d.color))
          .attr('stroke', NODE_STROKE)
          .attr('stroke-width', 1.4)
          .style('transition', 'opacity 0.2s');

        const labels = node
          .append('text')
          .text((d) => d.label ?? d.id)
          .attr('x', (d) => r(d.size ?? 8) + 3)
          .attr('y', 3)
          .attr('font-size', 8)
          .attr('opacity', 0)
          .attr('fill', '#ece6d6')
          .attr('paint-order', 'stroke')
          .attr('stroke', NODE_STROKE)
          .attr('stroke-width', 3);

        /* hover focus: dim everything except the node and its neighbours */
        const focus = (id: string | null) => {
          if (id === null) {
            circles.attr('opacity', 1);
            link.attr('stroke', LINK);
            return;
          }
          const nb = neighbours.get(id) ?? new Set<string>();
          circles.attr('opacity', (d) => (d.id === id || nb.has(d.id) ? 1 : 0.18));
          link.attr('stroke', (l) =>
            idOf(l.source) === id || idOf(l.target) === id ? LINK_ON : LINK_DIM
          );
        };

        let raf = 0;
        const showTooltip = (nodeDatum: NodeDatum, x: number, y: number) => {
          tooltip.text(getNodeDescription(nodeDatum)).style('left', `${x}px`).style('top', `${y - 16}px`).style('opacity', '1');
        };

        node
          .on('mouseenter', (event, d) => {
            const [x, y] = d3.pointer(event, container);
            showTooltip(d, x, y);
            focus(d.id);
          })
          .on('mousemove', (event) => {
            if (raf) return;
            raf = requestAnimationFrame(() => {
              const [x, y] = d3.pointer(event, container);
              tooltip.style('left', `${x}px`).style('top', `${y - 16}px`);
              raf = 0;
            });
          })
          .on('focus', (_event, d) => {
            showTooltip(d, width / 2, 48);
            focus(d.id);
          })
          .on('mouseleave', () => {
            if (raf) cancelAnimationFrame(raf), (raf = 0);
            tooltip.style('opacity', '0');
            focus(null);
          })
          .on('blur', () => {
            tooltip.style('opacity', '0');
            focus(null);
          });

        const sim = d3
          .forceSimulation<NodeDatum>(data.nodes)
          .alpha(1)
          .alphaMin(0.03)
          .alphaDecay(0.06)
          .velocityDecay(0.35)
          .force('link', d3.forceLink<NodeDatum, LinkDatum>(data.links).id((d) => d.id).distance(54).strength(0.55))
          .force('charge', d3.forceManyBody<NodeDatum>().strength(-62).theta(0.9).distanceMax(260))
          .force('x', d3.forceX<NodeDatum>(width / 2).strength(0.035))
          .force('y', d3.forceY<NodeDatum>(height / 2).strength(0.05))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide<NodeDatum>().radius((d) => r(d.size ?? 8) + 2));

        /* fit the settled layout to the frame (and re-fit on resize) */
        const fit = (animate: boolean) => {
          const xs = data.nodes.map((n) => n.x ?? 0);
          const ys = data.nodes.map((n) => n.y ?? 0);
          const x0 = d3.min(xs) ?? 0;
          const y0 = d3.min(ys) ?? 0;
          const bw = Math.max(1, (d3.max(xs) ?? 1) - x0);
          const bh = Math.max(1, (d3.max(ys) ?? 1) - y0);
          const w = frame.clientWidth;
          const pad = 48;
          const k = Math.min((w - pad * 2) / bw, (height - pad * 2) / bh, 1.7);
          const t = d3.zoomIdentity.translate(w / 2 - k * (x0 + bw / 2), height / 2 - k * (y0 + bh / 2)).scale(k);
          fitK = k;
          fitRef.current = t;
          if (animate) svg.transition().duration(900).ease(d3.easeCubicOut).call(zoom.transform, t);
          else svg.call(zoom.transform, t);
        };
        sim.on('end', () => fit(true));

        sim.on('tick', () => {
          link
            .attr('x1', (d) => (d.source as NodeDatum).x ?? 0)
            .attr('y1', (d) => (d.source as NodeDatum).y ?? 0)
            .attr('x2', (d) => (d.target as NodeDatum).x ?? 0)
            .attr('y2', (d) => (d.target as NodeDatum).y ?? 0);
          node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
        });

        const ro = new ResizeObserver(([entry]) => {
          const w = entry.contentRect.width;
          svg.attr('viewBox', `0 0 ${w} ${height}`);
          sim.force('center', d3.forceCenter(w / 2, height / 2) as any).alpha(0.2).restart();
          fit(false);
        });
        ro.observe(frame);

        setLoading(false);

        cleanup = () => {
          ro.disconnect();
          sim.stop();
          tooltip.remove();
          svg.selectAll('*').remove();
        };
      } catch (e: any) {
        if (isMounted) {
          setErr(e?.message || 'Failed to load network');
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
      cleanup?.();
    };
  }, [dataUrl, height, minRadius, maxRadius]);

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(450).ease(d3.easeCubicOut).call(zoomRef.current.transform, fitRef.current);
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative overflow-hidden rounded-[24px] bg-[#070c19] ring-1 ring-white/10">
        <div ref={frameRef} className="relative overflow-hidden">
          {/* soft vignette so nodes never touch the frame edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(8,13,26,0.65) 100%)' }}
          />
          <svg ref={svgRef} style={{ touchAction: 'none', display: 'block' }} />
          {loading && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-[#070c19]/80 text-[13px] text-[#ece6d6]/70 backdrop-blur-sm">
              Loading network…
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          title="Reset view"
          aria-label="Reset network view"
          className="absolute right-4 top-4 z-30 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-[#ece6d6] ring-1 ring-white/15 backdrop-blur transition hover:bg-white/20"
        >
          Reset view
        </button>

        {err && (
          <div className="p-4 text-sm text-red-300" role="alert">
            {err}
          </div>
        )}
        {!err && accessibleNodes.length > 0 && (
          <details className="border-t border-white/10 p-4 text-sm">
            <summary className="cursor-pointer text-[13px] font-medium text-[#ece6d6]/80">View network data as text</summary>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {accessibleNodes.map((n) => (
                <li key={n.id} className="whitespace-pre-line rounded-lg bg-white/5 p-3 text-[13px] text-[#ece6d6]/80" dir="auto">
                  {getNodeDescription(n)}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
};

export default BoardNetworkGraph;
