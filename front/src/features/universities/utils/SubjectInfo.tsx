import DetailSection from "@/components/DetailSection";
import type { UISubject } from "@/types/universities/subjects";

const SubjectInfo = ({ subjectDetail }: { subjectDetail: UISubject }) => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">
        {subjectDetail.university.name}
      </h1>
      <DetailSection value={subjectDetail.department.name} />
      <DetailSection value={subjectDetail.major.name} />
      <DetailSection value={subjectDetail.admissionSchedule.name} />
      <DetailSection value={`${subjectDetail.examInfo.enrollment} 名`} />
    </div>
  );
};

export default SubjectInfo;
