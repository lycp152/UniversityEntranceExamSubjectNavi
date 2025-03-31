import { Payload } from 'recharts/types/component/DefaultTooltipContent';

export type TooltipPayload = Payload<number, string>;

export const ChartTooltip = (value: number, name: string, entry: TooltipPayload) => {
  const percentage = entry?.payload?.percentage ? ` (${entry.payload.percentage.toFixed(1)}%)` : '';
  return [`${value}点${percentage}`, name];
};
