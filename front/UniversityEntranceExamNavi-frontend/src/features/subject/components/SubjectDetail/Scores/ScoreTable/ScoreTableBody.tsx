import { FC } from 'react';
import { Subject } from '@/lib/types';
import ScoreTableRow from './ScoreTableRow';

const ScoreTableBody: FC<{ scores: Subject['subjects'] }> = ({ scores }) => (
  <tbody>
    <ScoreTableRow label="共通テスト 配点" keyName="commonTest" scores={scores} />
    <ScoreTableRow label="二次試験 配点" keyName="secondTest" scores={scores} />
  </tbody>
);

export default ScoreTableBody;
