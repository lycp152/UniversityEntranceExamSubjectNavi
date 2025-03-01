import { FC } from "react";
import { TooltipProps } from "recharts";

const CustomTooltip: FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-2 rounded shadow">
      <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
    </div>
  );
};

export default CustomTooltip;
