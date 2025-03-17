export const containerStyles = {
  WebkitTapHighlightColor: "transparent",
} as const;

export const containerClassName = "w-full h-[500px] bg-transparent p-4";

export const pieChartStyles = `
  .recharts-wrapper,
  .recharts-sector,
  .recharts-layer,
  .recharts-surface,
  .recharts-pie,
  .recharts-pie-sector {
    outline: none !important;
  }
  .recharts-wrapper:focus-visible,
  .recharts-sector:focus-visible,
  .recharts-layer:focus-visible,
  .recharts-surface:focus-visible,
  .recharts-pie:focus-visible,
  .recharts-pie-sector:focus-visible {
    outline: 2px solid #2563eb !important;
    outline-offset: 2px;
  }
  .recharts-pie-sector path {
    stroke: white;
    stroke-width: 2;
  }
  .recharts-wrapper {
    background-color: transparent !important;
  }
`;
