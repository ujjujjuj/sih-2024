"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface Node {
  id: string;
  type: string;
}

export interface Link {
  source: string;
  target: string;
}
const a1 = Math.random();
const b1 = Math.random();
const c1 = Math.random();
const d1 = Math.random();
const DirectedGraph = ({
  nodes,
  links,
  onNodeClick,
}: {
  nodes: Node[];
  links: Link[];
  onNodeClick: (nodeId: string) => void;
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [_nodesData, setNodesData] = useState<Node[]>(nodes);
  const [_linksData, setLinksData] = useState<Link[]>(links);

  useEffect(() => {
    setNodesData(nodes);
  }, [nodes]);

  useEffect(() => {
    setLinksData(links);
  }, [links]);

  useEffect(() => {
    if (_nodesData.length === 0 || _linksData.length === 0 || !svgRef.current)
      return;

    const width = 1000;
    const height = 600;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid #ccc");

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    const simulation = d3
      .forceSimulation(_nodesData as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(_linksData)
          .id((d: any) => d.id)
          .distance(300)
      )
      .force("charge", d3.forceManyBody().strength(-1500))
      .force("center", d3.forceCenter(width / 2, height / 2));

    simulation.force(
      "x",
      d3
        .forceX<d3.SimulationNodeDatum>()
        .x((d: any) => {
          if (d.type === "input") return width * 0.2;
          if (d.type === "output") return width * 0.8;
          return width / 2;
        })
        .strength(0.7)
    );

    const linkArc = (d: any) => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy);

      const controlPoint1 = {
        x: d.source.x + dx / 3 + (a1 - 0.5) * 100,
        y: d.source.y + dy / 3 + (b1 - 0.5) * 100,
      };
      const controlPoint2 = {
        x: d.source.x + (2 * dx) / 3 + (c1 - 0.5) * 100,
        y: d.source.y + (2 * dy) / 3 + (d1 - 0.5) * 100,
      };

      return `M${d.source.x},${d.source.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${d.target.x},${d.target.y}`;
    };

    const link = g
      .append("g")
      .selectAll("path")
      .data(_linksData)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .style("opacity", "0.5");

    const arrowsGroup = g.append("g");

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(["input", "output", "master"])
      .range(["#DC143C", "#B22222", "#800000"]);

    // const tooltip = d3
    //   .select(containerRef.current)
    //   .append("div")
    //   .style("opacity", 0)
    //   .attr("class", "tooltip")
    //   .style("background-color", "white")
    //   .style("border", "solid")
    //   .style("border-width", "2px")
    //   .style("border-radius", "5px")
    //   .style("padding", "5px")
    //   .style("postion", "absolute");

    // const mouseover = function (d) {
    //   tooltip.style("opacity", 1);
    //   d3.select(this).style("stroke", "black").style("opacity", 1);
    // };
    // const mousemove = function (event) {
    //   console.log(event.pageX, event.pageY);
    //   tooltip
    //     .html("The exact value of<br>this cell is: ")
    //     .style("left", event.pageX + 70 + "px")
    //     .style("top", event.pageY + "px");
    // };
    // const mouseleave = function (d) {
    //   tooltip.style("opacity", 0);
    //   d3.select(this).style("stroke", "none").style("opacity", 0.8);
    // };

    const node = g
      .append("g")
      .selectAll("circle")
      .data(_nodesData)
      .join("circle")
      .attr("r", (d) => (d.type === "master" ? 40 : 25))
      .attr("fill", (d) => colorScale(d.type))
      .on("click", (event, d: Node) => {
        console.log("clicked account is : ", d.id);
        onNodeClick(d.id);
      });
    // .on("mouseover", mouseover)
    // .on("mousemove", mousemove)
    // .on("mouseleave", mouseleave);

    const text = g
      .append("g")
      .selectAll("text")
      .data(_nodesData)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .text((d) => d.id)
      .style("fill", "#fff")
      .style("font-size", (d) => (d.type === "master" ? "14px" : "10px"));

    const drag = d3
      .drag<SVGCircleElement, Node>()
      .on("start", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    // const updateMovingArrows = () => {
    //   arrowsGroup.selectAll("circle").remove();

    //   link.each((d: any, i, nodes) => {
    //     const path = nodes[i] as SVGPathElement;
    //     const length = path.getTotalLength();
    //     const numArrows = Math.floor(length / 60);

    //     for (let j = 0; j < numArrows; j++) {
    //       const t = (j / numArrows + Date.now() / 3000) % 2;
    //       const point = path.getPointAtLength(t * length);

    //       arrowsGroup
    //         .append("circle")
    //         .attr("cx", point.x)
    //         .attr("cy", point.y)
    //         .attr("r", 3)
    //         .attr("fill", "#999");
    //     }
    //   });
    // };

    simulation.on("tick", () => {
      link.attr("d", linkArc);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      text.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

      // updateMovingArrows();
    });

    function animate() {
      // updateMovingArrows();
      requestAnimationFrame(animate);
    }

    animate();
  }, [_nodesData, _linksData, onNodeClick]);

  return (
    <div ref={containerRef}>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};

export default DirectedGraph;
