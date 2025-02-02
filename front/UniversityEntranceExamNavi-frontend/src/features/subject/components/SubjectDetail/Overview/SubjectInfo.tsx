import DetailSection from './DetailSection';
import { Subject } from '@/lib/types';

const SubjectInfo = ({ subjectDetail }: { subjectDetail: Subject }) => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{subjectDetail.universityName}</h1>
      <DetailSection value={subjectDetail.department} />
      <DetailSection value={subjectDetail.major} />
      <DetailSection value={`${subjectDetail.schedule}期`} />
      <DetailSection value={`${subjectDetail.enrollment} 名`} />
    </div>
  );
};

export default SubjectInfo;
