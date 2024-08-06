import React, { useEffect, useRef } from "react";
import AllCheckbox from "./AllCheckbox";

interface ClassificationCheckboxProps {
  classification: string[];
  setClassification: React.Dispatch<React.SetStateAction<string[]>>;
}

const classificationData: Record<string, string[]> = {
  国公立: [
    "東京一工（東京、京都、一橋、東工）",
    "旧帝大（東京、京都、東北、名古屋、大阪、九州）",
    "難関国立10大学（東京、京都、一橋、東工、北海道、東北、名古屋、大阪、九州、神戸）",
    "筑横千首（筑波、横国、千葉、東京都立）",
    "電農名繊（電気通信、東京農工、名古屋工業、京都工芸繊維）",
    "金岡千広（金沢、岡山、千葉、広島）",
    "5S（埼玉、信州、新潟、静岡、滋賀）",
    "STARS（佐賀、鳥取、秋田、琉球、島根）",
    "その他の国立大",
    "その他の公立大",
  ],
  私立: [
    "早慶上理ICU（早稲田、慶応、上智、東京理科、ICU）",
    "私立医大四天王（慶応、東京慈恵会医科、日本医科、順天堂）",
    "SMART（明治、青山、立教、上智、東京理科）",
    "GMARCH（明治、青山、立教、中央、法政、学習院）",
    "関関同立（関西、関西学院、同志社、立命館）",
    "五美大（多摩美術、女子美術、東京造形、日大藝術、武蔵野美術）",
    "成成明学（成蹊、成城、明治学院）",
    "四工大（芝浦工業、東京都市、東京電機、工学院）",
    "日東駒専（日本、東洋、駒澤、専修）",
    "産近甲龍（京都産業、近畿、甲南、龍谷）",
    "愛愛名中+南山（愛知、愛知学院、名城、中京、南山）",
    "大東亜帝国（大東文化、東海、亜細亜、帝京、国士舘）",
    "摂神追桃（摂南、神戸学院、追手門学院、桃山学院）",
    "関東上流江戸桜(関東学院、上武、流通経済、江戸川、桜美林)",
    "その他の私立大",
  ],
};

const ClassificationCheckbox: React.FC<ClassificationCheckboxProps> = ({
  classification,
  setClassification,
}) => {
  const ref = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setClassification((prev) =>
      checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  };

  const handleClassificationToggle = (classificationName: string) => {
    if (
      classificationData[classificationName].every((c) =>
        classification.includes(c)
      )
    ) {
      setClassification((prev) =>
        prev.filter((c) => !classificationData[classificationName].includes(c))
      );
    } else {
      setClassification((prev) => [
        ...prev,
        ...classificationData[classificationName].filter(
          (c) => !prev.includes(c)
        ),
      ]);
    }
  };

  const handleAllChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    classificationName: string
  ) => {
    const { checked } = e.target;
    setClassification((prev) =>
      checked
        ? [...prev, ...classificationData[classificationName]]
        : prev.filter(
            (c) => !classificationData[classificationName].includes(c)
          )
    );
  };

  useEffect(() => {
    if (ref.current) {
      const allChecked = classificationData[
        ref.current.dataset.classificationName!
      ].every((c) => classification.includes(c));
      const someChecked = classificationData[
        ref.current.dataset.classificationName!
      ].some((c) => classification.includes(c));
      ref.current.indeterminate = someChecked && !allChecked;
    }
  }, [classification]);

  const isClassificationDefined = Array.isArray(classification);

  return (
    <div className="mt-2">
      <label className="block text-gray-700 mb-2">分類</label>
      <div className="flex flex-col">
        {/* Container for 横並び */}
        <div className="flex space-x-4">
          {Object.entries(classificationData).map(
            ([classificationName, subItems]) => (
              <div key={classificationName} className="mb-4 flex-1">
                <AllCheckbox
                  allChecked={
                    isClassificationDefined &&
                    subItems.every((c) => classification.includes(c))
                  }
                  indeterminate={
                    isClassificationDefined &&
                    subItems.some((c) => classification.includes(c)) &&
                    !subItems.every((c) => classification.includes(c))
                  }
                  onChange={(e) => handleAllChange(e, classificationName)}
                  label={classificationName}
                />
                <div className="flex flex-wrap ml-4">
                  {subItems.map((subItem) => (
                    <label key={subItem} className="block mr-4">
                      <input
                        type="checkbox"
                        value={subItem}
                        checked={
                          isClassificationDefined &&
                          classification.includes(subItem)
                        }
                        onChange={handleChange}
                        className="mr-2"
                      />
                      {subItem}
                    </label>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassificationCheckbox;
