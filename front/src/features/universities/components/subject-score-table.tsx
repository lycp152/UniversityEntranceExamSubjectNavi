/**
 * 科目別配点と割合を表示するテーブルコンポーネント
 * 共通テストと二次試験の配点、割合を科目ごとに表示
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject} props.subjectData - 表示する科目の情報
 * @returns {JSX.Element} 科目別配点テーブルコンポーネント
 */
import { FC, useMemo } from 'react';
import { UISubject } from '@/types/university-subject';
import { calculateTotalScores } from '@/features/universities/utils/calculate-scores';
import TableRow from '@/features/universities/components/table-row';
import { SectionTitle } from '@/components/ui/section-title';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow as UITableRow,
} from '@/components/ui/table';

/**
 * テーブルのスタイル定義
 * セル、ヘッダー、行のスタイルを定義
 * Tailwind CSSのクラスを使用
 */
const tableStyles = {
  headerCell:
    'whitespace-nowrap border-b border-b-transparent p-3 text-base text-center bg-muted/100 dark:bg-muted/50 font-semibold',
  scoreCell: 'whitespace-nowrap border-b border-b-transparent p-3 text-base text-center',
} as const;

interface SubjectScoreTableProps {
  subjectData: UISubject;
}

const SubjectScoreTable: FC<SubjectScoreTableProps> = ({ subjectData }) => {
  // 科目ごとの配点情報を取得
  const subjects = subjectData.subjects;
  // 合計点を計算
  const totals = useMemo(() => calculateTotalScores(subjects), [subjects]);

  // 科目名の配列をメモ化
  const subjectNames = useMemo(() => Object.keys(subjects), [subjects]);

  return (
    <div className="mt-4">
      {/* テーブルのタイトル */}
      <SectionTitle>科目別配点と割合</SectionTitle>
      <Table>
        <TableHeader>
          <UITableRow>
            {/* ヘッダー行: 項目名と科目名を表示 */}
            <TableHead className={tableStyles.headerCell} scope="col">
              項目
            </TableHead>
            {subjectNames.map(subject => (
              <TableHead key={subject} className={tableStyles.headerCell} scope="col">
                {subject}
              </TableHead>
            ))}
            <TableHead className={tableStyles.headerCell} scope="col">
              合計
            </TableHead>
          </UITableRow>
        </TableHeader>
        <TableBody>
          {/* 共通テストの配点と割合を表示 */}
          <TableRow subjects={subjects} totals={totals} type="commonTest" showRatio />
          {/* 二次試験の配点と割合を表示 */}
          <TableRow subjects={subjects} totals={totals} type="secondTest" showRatio />
          {/* 総合の配点と割合を表示 */}
          <TableRow subjects={subjects} totals={totals} type="total" showRatio />
        </TableBody>
      </Table>
    </div>
  );
};

export default SubjectScoreTable;
