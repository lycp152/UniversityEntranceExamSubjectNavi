/**
 * 大学の基本情報を表示するコンポーネント
 * 大学名、学部名、学科名、入試日程、募集人数などの基本情報を表示
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject} props.subjectDetail - 表示する科目の詳細情報
 * @returns {JSX.Element} 科目情報を表示するコンポーネント
 */
import type { UISubject } from '@/types/university-subject';

const UniversityInfo = ({ subjectDetail }: { subjectDetail: UISubject }) => {
  return (
    <div>
      {/* 大学名: 大学の正式名称を表示 */}
      <h1 className="text-xl font-bold mb-4">{subjectDetail.university.name}</h1>
      {/* 学部名: 学部の正式名称を表示 */}
      <p className="mb-2">{subjectDetail.department.name}</p>
      {/* 学科名: 学科の正式名称を表示 */}
      <p className="mb-2">{subjectDetail.major.name}</p>
      {/* 入試日程: 入試の実施時期を表示 */}
      <p className="mb-2">{subjectDetail.admissionSchedule.name}</p>
      {/* 募集人数: 募集定員を表示 */}
      <p className="mb-2">{`${subjectDetail.examInfo.enrollment} 名`}</p>
    </div>
  );
};

export default UniversityInfo;
