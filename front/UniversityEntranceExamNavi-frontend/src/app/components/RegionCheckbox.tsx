import React, { useEffect, useRef } from "react";
import AllCheckbox from "./AllCheckbox";

interface RegionCheckboxProps {
  region: string[];
  setRegion: React.Dispatch<React.SetStateAction<string[]>>;
}

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

export default function RegionCheckbox({
  region,
  setRegion,
}: Readonly<RegionCheckboxProps>) {
  const ref = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setRegion([...region, value]);
    } else {
      setRegion(region.filter((r) => r !== value));
    }
  };

  const handleRegionToggle = (regionName: string) => {
    if (region.every((r) => regionData[regionName].includes(r))) {
      setRegion(region.filter((r) => !regionData[regionName].includes(r)));
    } else {
      setRegion([...region, ...regionData[regionName]]);
    }
  };

  const handleAllChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    regionName: string
  ) => {
    const { checked } = e.target;
    setRegion(
      checked
        ? [...region, ...regionData[regionName]]
        : region.filter((r) => !regionData[regionName].includes(r))
    );
  };

  useEffect(() => {
    if (ref.current) {
      const allChecked = regionData[ref.current.dataset.regionName!].every(
        (pref) => region.includes(pref)
      );
      const someChecked = regionData[ref.current.dataset.regionName!].some(
        (pref) => region.includes(pref)
      );
      ref.current.indeterminate = someChecked && !allChecked;
    }
  }, [region]);

  return (
    <div className="mt-2">
      <label htmlFor="region" className="block text-gray-700 mb-2">
        地域・都道府県
      </label>
      {/* すべてチェックボックスを一番上に配置 */}
      <div className="flex flex-wrap">
        <AllCheckbox
          allChecked={Object.values(regionData)
            .flat()
            .every((pref) => region.includes(pref))}
          indeterminate={
            Object.values(regionData)
              .flat()
              .some((pref) => region.includes(pref)) &&
            !Object.values(regionData)
              .flat()
              .every((pref) => region.includes(pref))
          }
          onChange={(e) => {
            const { checked } = e.target;
            setRegion(checked ? Object.values(regionData).flat() : []);
          }}
          label="すべて"
        />
      </div>
      {/* 親項目と子項目の配置 */}
      <div className="flex flex-wrap">
        {Object.entries(regionData).map(([regionName, prefectures]) => (
          <div key={regionName} className="mb-4">
            <AllCheckbox
              allChecked={prefectures.every((pref) => region.includes(pref))}
              indeterminate={
                prefectures.some((pref) => region.includes(pref)) &&
                !prefectures.every((pref) => region.includes(pref))
              }
              onChange={(e) => handleAllChange(e, regionName)}
              label={regionName}
            />
            <div className="ml-4">
              {prefectures.map((pref) => (
                <label key={pref} className="block">
                  <input
                    type="checkbox"
                    value={pref}
                    checked={region.includes(pref)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {pref}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
