import CategoryCheckboxGroup from '@/components/ui/forms/checkbox/category-checkbox-group';

const classificationData: Record<string, string[]> = {
  国公立: [
    '東京一工（東京、京都、一橋、東工）',
    '旧帝大（東京、京都、東北、名古屋、大阪、九州）',
    '難関国立10大学（東京、京都、一橋、東工、北海道、東北、名古屋、大阪、九州、神戸）',
    '筑横千首（筑波、横国、千葉、東京都立）',
    '電農名繊（電気通信、東京農工、名古屋工業、京都工芸繊維）',
    '金岡千広（金沢、岡山、千葉、広島）',
    '5S（埼玉、信州、新潟、静岡、滋賀）',
    'STARS（佐賀、鳥取、秋田、琉球、島根）',
    'その他の国立大',
    'その他の公立大',
  ],
  私立: [
    '早慶上理ICU（早稲田、慶応、上智、東京理科、ICU）',
    '私立医大四天王（慶応、東京慈恵会医科、日本医科、順天堂）',
    'SMART（明治、青山、立教、上智、東京理科）',
    'GMARCH（明治、青山、立教、中央、法政、学習院）',
    '関関同立（関西、関西学院、同志社、立命館）',
    '五美大（多摩美術、女子美術、東京造形、日大藝術、武蔵野美術）',
    '成成明学（成蹊、成城、明治学院）',
    '四工大（芝浦工業、東京都市、東京電機、工学院）',
    '日東駒専（日本、東洋、駒澤、専修）',
    '産近甲龍（京都産業、近畿、甲南、龍谷）',
    '愛愛名中+南山（愛知、愛知学院、名城、中京、南山）',
    '大東亜帝国（大東文化、東海、亜細亜、帝京、国士舘）',
    '摂神追桃（摂南、神戸学院、追手門学院、桃山学院）',
    '関東上流江戸桜(関東学院、上武、流通経済、江戸川、桜美林)',
    'その他の私立大',
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
    <CategoryCheckboxGroup
      categories={classificationData}
      selectedItems={classification}
      setSelectedItems={setClassification}
      label="設置区分"
      itemLabel={item => item}
    />
  );
};

export default ClassificationCheckbox;
