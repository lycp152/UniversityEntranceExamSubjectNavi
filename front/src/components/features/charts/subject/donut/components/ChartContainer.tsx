import { FC, ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';
import { containerStyles, containerClassName, pieChartStyles } from '../styles';

interface Props {
  children: ReactElement;
}

const ChartContainer: FC<Props> = ({ children }) => (
  <div className={containerClassName} style={containerStyles}>
    <style>{pieChartStyles}</style>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

export default ChartContainer;
