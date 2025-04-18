import { FC } from 'react';
import { UISubject } from '@/types/university-subjects';
import { ScoreDisplay } from '@/features/charts/components/score-display';
import UniversityInfo from '@/features/universities/components/university-info';
import SubjectScoreTable from '@/features/universities/components/subject-score-table';

interface UniversityLayoutProps {
  subject: UISubject;
}

/**
 * 大学ページのレイアウトコンポーネント
 * 科目情報、スコア表示、科目別配点テーブルを配置
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject} props.subject - 表示する科目の情報
 * @returns {JSX.Element} 大学ページのレイアウトコンポーネント
 */
const UniversityLayout: FC<UniversityLayoutProps> = ({ subject }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* メインコンテンツエリア: 科目情報とスコア表示を横並びに配置 */}
      <div className="flex flex-col lg:flex-row">
        {/* 左側: 科目情報を表示 */}
        <div className="lg:w-1/4 lg:pr-4">
          <UniversityInfo subjectDetail={subject} />
        </div>
        {/* 右側: 科目別配点グラフを配置 */}
        <div className="flex-1 flex bg-transparent">
          <ScoreDisplay subject={subject} />
        </div>
      </div>
      {/* 下部: 科目別配点テーブルを表示 */}
      <div>
        <SubjectScoreTable subjectData={subject} />
      </div>
    </div>
  );
};

export default UniversityLayout;
