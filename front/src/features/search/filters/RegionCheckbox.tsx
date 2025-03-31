import CategoryCheckboxGroup from "@/components/ui/forms/checkbox/category-checkbox-group";

const regionData: Record<string, string[]> = {
  北海道: ["北海道"],
  東北: ["青森", "秋田", "岩手", "山形", "宮城", "福島"],
  北関東: ["群馬", "栃木", "茨城"],
  南関東: ["東京", "神奈川", "千葉", "埼玉"],
  甲信越: ["新潟", "長野", "山梨"],
  北陸: ["富山", "石川", "福井"],
  東海: ["静岡", "愛知", "岐阜", "三重"],
  関西: ["大阪", "京都", "兵庫", "滋賀", "奈良", "和歌山"],
  中国: ["広島", "岡山", "山口", "鳥取", "島根"],
  四国: ["香川", "徳島", "愛媛", "高知"],
  九州: ["福岡", "佐賀", "長崎", "熊本", "大分", "宮崎", "鹿児島", "沖縄"],
};

interface RegionCheckboxProps {
  region: string[];
  setRegion: React.Dispatch<React.SetStateAction<string[]>>;
}

const RegionCheckbox: React.FC<RegionCheckboxProps> = ({
  region,
  setRegion,
}) => {
  return (
    <CategoryCheckboxGroup
      categories={regionData}
      selectedItems={region}
      setSelectedItems={setRegion}
      label="地域・都道府県"
      itemLabel={(item) => item}
    />
  );
};

export default RegionCheckbox;
