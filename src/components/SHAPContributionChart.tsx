import { useEffect, useRef } from "react";
import { TopFeature } from "../types";

interface SHAPContributionChartProps {
  features: TopFeature[];
}

export function SHAPContributionChart({ features }: SHAPContributionChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the container exists and Plotly is loaded on the window
    if (!containerRef.current || !(window as any).Plotly) {
      return;
    }

    // Sort features: standard horizontal bar plots render from bottom to top.
    // We want the most impactful positive contribution at the top, so we reverse for presentation.
    const sortedFeatures = [...features].reverse();

    // Prepare x and y vectors for Plotly
    const xData = sortedFeatures.map((f) => f.shapVal);
    const yData = sortedFeatures.map((f) => f.name);

    // Dynamic color coding:
    // Red (#EF4444) for positive (increased anemia risk contribution)
    // Emerald (#10B981) for negative (decreased anemia risk contribution)
    const markerColors = sortedFeatures.map((f) =>
      f.shapVal >= 0 ? "rgb(239, 68, 68)" : "rgb(16, 185, 129)"
    );

    // Formatted text values displayed on the bars
    const textLabels = sortedFeatures.map(
      (f) => `${f.shapVal > 0 ? "+" : ""}${f.shapVal.toFixed(3)}`
    );

    const trace = {
      type: "bar",
      x: xData,
      y: yData,
      orientation: "h",
      text: textLabels,
      textposition: "auto",
      marker: {
        color: markerColors,
        line: {
          color: "rgba(255, 255, 255, 0.4)",
          width: 1,
        },
      },
      // Hover custom cards
      hoverinfo: "text",
      hovertext: sortedFeatures.map(
        (f) =>
          `<b>${f.name}</b><br>` +
          `Patient Value: <b>${f.formattedVal}</b><br>` +
          `SHAP Contribution: <b>${f.shapVal > 0 ? "+" : ""}${f.shapVal.toFixed(4)}</b><br>` +
          `${f.shapVal >= 0 ? "🔴 Increases Anemia Risk" : "🟢 Decreases Anemia Risk"}`
      ),
    };

    const layout = {
      margin: { l: 210, r: 25, t: 30, b: 40 },
      xaxis: {
        title: {
          text: "SHAP Value (Decision Impact)",
          font: {
            family: "Plus Jakarta Sans, Inter, sans-serif",
            size: 11,
            color: "#64748B",
            weight: "600",
          },
        },
        gridcolor: "#E2E8F0",
        zerolinecolor: "#475569",
        zerolinewidth: 2,
        tickfont: {
          family: "JetBrains Mono, monospace",
          size: 10,
          color: "#64748B",
        },
      },
      yaxis: {
        tickfont: {
          family: "Plus Jakarta Sans, Inter, sans-serif",
          size: 11,
          color: "#1E293B",
          weight: "700",
        },
        gridcolor: "#F1F5F9",
      },
      paper_bgcolor: "rgba(0, 0, 0, 0)",
      plot_bgcolor: "rgba(0, 0, 0, 0)",
      showlegend: false,
      autosize: true,
      height: 300,
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    // Draw the plot
    (window as any).Plotly.newPlot(containerRef.current, [trace], layout, config);

    // Resize handler to make Plotly dynamically responsive inside flex grids
    const handleResize = () => {
      if (containerRef.current) {
        (window as any).Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener("resize", handleResize);

    // Purge on unmount/cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        (window as any).Plotly.purge(containerRef.current);
      }
    };
  }, [features]);

  return (
    <div className="w-full relative overflow-hidden">
      {/* Dynamic container where Plotly will attach the SVG */}
      <div ref={containerRef} className="w-full h-[300px]" />
    </div>
  );
}
