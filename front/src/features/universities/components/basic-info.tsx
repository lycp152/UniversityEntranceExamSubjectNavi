/**
 * 大学の基本情報を表示するコンポーネント
 * 大学名、学部名、学科名、入試日程、募集人数などの基本情報を表示
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {UISubject} props.subjectDetail - 表示する科目の詳細情報
 * @returns {JSX.Element} 科目情報を表示するコンポーネント
 */
import type { UISubject } from '@/types/university-subject';

/**
 * 大学情報の各項目を表示するコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.value - 項目の値
 * @returns {JSX.Element} 情報項目コンポーネント
 */
const InfoItem = ({ value }: { value: string }) => <li className="mb-2">{value}</li>;

const BasicInfo = ({ subjectDetail }: { subjectDetail: UISubject }) => {
  return (
    <section aria-labelledby="university-info-title">
      <h1 id="university-info-title" className="text-xl font-bold mb-4">
        {subjectDetail.university.name}
      </h1>
      <ul className="list-none">
        <InfoItem value={subjectDetail.department.name} />
        <InfoItem value={subjectDetail.major.name} />
        <InfoItem value={`${subjectDetail.admissionSchedule.name}期`} />
        <InfoItem value={`${subjectDetail.examInfo.enrollment} 名`} />
      </ul>
    </section>
  );
};

export default BasicInfo;
