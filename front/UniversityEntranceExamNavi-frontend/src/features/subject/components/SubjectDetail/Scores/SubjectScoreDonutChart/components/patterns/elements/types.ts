export interface StrokeProps {
  stroke?: string;
  strokeWidth?: string;
  strokeOpacity?: string;
}

export interface FillProps {
  fill?: string;
  fillOpacity?: string;
}

export interface SVGElementProps extends StrokeProps, FillProps {
  d?: string;
  cx?: number;
  cy?: number;
  r?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}
