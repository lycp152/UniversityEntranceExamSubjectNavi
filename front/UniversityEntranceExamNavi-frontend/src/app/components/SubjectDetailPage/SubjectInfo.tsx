import DetailSection from "./DetailSection";
import { Subject } from "../SearchResultTable/SubjectData";

const SubjectInfo = ({ subjectDetail }: { subjectDetail: Subject }) => {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{subjectDetail.universityName}</h1>
      <DetailSection label="学部・募集枠" value={subjectDetail.department} />
      <DetailSection label="学科・専攻" value={subjectDetail.major} />
      <DetailSection label="日程" value={`${subjectDetail.schedule}期`} />
      <DetailSection
        label="募集人員"
        value={`${subjectDetail.enrollment} 名`}
      />
    </div>
  );
};

export default SubjectInfo;
