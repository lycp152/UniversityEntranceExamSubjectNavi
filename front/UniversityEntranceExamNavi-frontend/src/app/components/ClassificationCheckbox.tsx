import React from "react";
import CheckboxGroup from "./CheckboxGroup";

const classificationData: Record<string, string[]> = {
  国公立: [
    "東京一工",
    "旧帝大",
    "筑横千首",
    "金岡千広",
    "電農名繊",
    "5S",
    "STARS",
    "その他の国立",
    "その他の公立",
  ],
  私立: [
    "早慶上理",
    "SMART",
    "GMARCH+ICU",
    "関関同立",
    "成成明学",
    "四工大",
    "五美大",
    "日東駒専",
    "産近甲龍",
    "愛愛名中+南山",
    "大東亜帝国",
    "摂神追桃",
    "関東上流江戸桜",
    "その他の私立大学",
  ],
};

interface ClassificationCheckboxProps {
  classification: string[];
  setClassification: React.Dispatch<React.SetStateAction<string[]>>;
}

const ClassificationCheckbox: React.FC<ClassificationCheckboxProps> = ({
  classification,
  setClassification,
}) => {
  return (
    <CheckboxGroup
      items={classificationData}
      selectedItems={classification}
      setSelectedItems={setClassification}
      allLabel="すべて"
      itemLabel={(item) => item}
      checkboxType="classification"
    />
  );
};

export default ClassificationCheckbox;
