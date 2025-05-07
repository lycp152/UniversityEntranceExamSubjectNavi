import { FC } from 'react';
import { UISubject } from '@/types/university-subject';
import { ScoreDisplay } from '@/features/charts/components/score-display';
import BasicInfo from '@/features/universities/components/basic-info';
import SubjectScoreTable from '@/features/universities/components/subject-score-table';

interface UniversityLayoutProps {
  subject: UISubject;
}

/**
 * 詳細ページのレイアウトコンポーネント
 * 科目情報、スコア表示、科目別配点テーブルを配置
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject} props.subject - 表示する科目の情報
 * @returns {JSX.Element} 大学ページのレイアウトコンポーネント
 */
const UniversityLayout: FC<UniversityLayoutProps> = ({ subject }) => {
  return (
    <main
      className="container mx-auto px-4 py-8"
      aria-label={`${subject.university.name} ${subject.department.name} ${subject.major.name}の科目情報`}
    >
      {/* メインコンテンツエリア: 科目情報とスコア表示を横並びに配置 */}
      <section className="flex flex-col md:flex-row gap-4" aria-label="科目情報とスコア表示">
        {/* 左側: 基本情報を表示 */}
        <article className="w-full md:w-1/4" aria-label="基本情報">
          <BasicInfo subjectDetail={subject} />
        </article>
        {/* 右側: 科目別配点グラフを配置 */}
        <article className="flex-1 flex bg-transparent" aria-label="スコア表示">
          <ScoreDisplay subject={subject} />
        </article>
      </section>
      {/* 下部: 科目別配点テーブルを表示 */}
      <section className="mt-8" aria-label="科目別配点テーブル">
        <SubjectScoreTable subjectData={subject} />
      </section>
    </main>
  );
};

export default UniversityLayout;
