import { FC } from 'react';
import { Pie, Cell } from 'recharts';
import { SUBJECT_CATEGORIES } from '@/constants/subjects';
import CustomLabel from './CustomLabel';
import { DetailedPieData, PIE_COMMON_PROPS } from '../types';
import { getSubjectBaseCategory } from '@/utils/validation/subject-type-validator';

interface Props {
  data: DetailedPieData[];
}

const InnerPie: FC<Props> = ({ data }) => (
  <Pie {...PIE_COMMON_PROPS} data={data} innerRadius={0} outerRadius={150} label={CustomLabel}>
    {data.map(entry => (
      <Cell
        key={`cell-${entry.name}`}
        fill={
          entry.name.includes('共通')
            ? SUBJECT_CATEGORIES[getSubjectBaseCategory(entry.category)].color
            : `url(#pattern-${entry.category})`
        }
      />
    ))}
  </Pie>
);

export default InnerPie;
