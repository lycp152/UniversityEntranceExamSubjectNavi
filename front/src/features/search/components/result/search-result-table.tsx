'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/errors/error-message';
import { LoadingSpinner } from '@/components/ui/feedback/spinner';
import type { UISubject } from '@/types/university-subject';
import { transformUniversityData } from '@/features/search/utils/university-data-transformer';

/**
 * 検索結果テーブルコンポーネント
 *
 * 大学の検索結果を表示するテーブルコンポーネントです。
 * 大学名、学部、学科、日程、募集人員を表示し、行をクリックすると詳細ページに遷移します。
 *
 * @component
 * @example
 * ```tsx
 * <SearchResultTable />
 * ```
 *
 * @returns {JSX.Element} 検索結果テーブルコンポーネント
 */
const SearchResultTable = () => {
  /** 検索結果の科目データ */
  const [subjects, setSubjects] = useState<UISubject[]>([]);
  /** データ読み込み中の状態 */
  const [loading, setLoading] = useState(true);
  /** エラーメッセージ */
  const [error, setError] = useState<string | null>(null);

  /**
   * 大学データの取得と変換
   *
   * APIから大学データを取得し、表示用の形式に変換します。
   * エラーが発生した場合はエラーメッセージを表示します。
   */
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/universities`);
        const responseData = await response.json();
        const data = responseData.data ?? responseData;

        if (!Array.isArray(data)) {
          console.error('Data is not an array:', typeof data, data);
          throw new Error('Invalid response format');
        }

        const transformedData = transformUniversityData(data);
        setSubjects(transformedData);
      } catch (error) {
        console.error('Failed to fetch universities:', error);
        setError('データの取得に失敗しました。サーバーが起動しているか確認してください。');
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  /** テーブルのタイトル */
  const title = `大学入試科目の配点比率`;

  /**
   * 行クリック時のハンドラ
   *
   * @param academicYear - 年度
   * @param universityId - 大学ID
   * @param departmentId - 学部ID
   * @param majorId - 学科ID
   * @param admissionScheduleId - 入試日程ID
   */
  const handleRowClick = (
    academicYear: number,
    universityId: number,
    departmentId: number,
    majorId: number,
    admissionScheduleId: number
  ) => {
    const url = `/universities/${academicYear}/${universityId}/${departmentId}/${majorId}/${admissionScheduleId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (subjects.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-xl text-gray-600">データが見つかりませんでした。</p>
        <p className="mt-2 text-gray-500">現在、データベースに大学情報が登録されていません。</p>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-700">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-left whitespace-nowrap">
                大学名
              </th>
              <th className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-left whitespace-nowrap">
                学部
              </th>
              <th className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-left whitespace-nowrap">
                学科
              </th>
              <th className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-left whitespace-nowrap">
                日程
              </th>
              <th className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 text-left whitespace-nowrap">
                募集人員
              </th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject: UISubject) => (
              <tr
                key={`${subject.university.id}-${subject.department.id}-${subject.major.id}-${subject.admissionSchedule.id}`}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900"
                onClick={() =>
                  handleRowClick(
                    subject.examInfo.academicYear,
                    subject.university.id,
                    subject.department.id,
                    subject.major.id,
                    subject.admissionSchedule.id
                  )
                }
              >
                <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap">
                  {subject.university.name}
                </td>
                <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap">
                  {subject.department.name}
                </td>
                <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap">
                  {subject.major.name}
                </td>
                <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap">
                  {subject.admissionSchedule.name}
                </td>
                <td className="py-2 px-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap">
                  {subject.examInfo.enrollment} 名
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SearchResultTable;
