import GenericCheckboxGroup from "./Checkbox/SimpleCheckboxGroup";

interface AcademicFieldCheckboxProps {
  academicField: string[];
  setAcademicField: React.Dispatch<React.SetStateAction<string[]>>;
}

const academicFields = [
  "文学",
  "心理学",
  "哲学",
  "史学・人類学",
  "社会・社会福祉・観光学",
  "語学",
  "法学・政治学",
  "経済・経営・商学",
  "教員養成・教育学",
  "理学",
  "工学",
  "農・林・水産・獣医学",
  "医学",
  "看護・保健・衛生学",
  "歯学",
  "薬学",
  "生活科学",
  "芸術学",
  "体育学",
  "人間・情報科学・総合科学",
];

const AcademicFieldCheckbox: React.FC<AcademicFieldCheckboxProps> = ({
  academicField,
  setAcademicField,
}) => (
  <GenericCheckboxGroup
    items={academicFields}
    selectedItems={academicField}
    setSelectedItems={setAcademicField}
    label="学問系統"
  />
);

export default AcademicFieldCheckbox;
