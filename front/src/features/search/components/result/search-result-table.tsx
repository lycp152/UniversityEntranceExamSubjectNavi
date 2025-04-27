'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ErrorMessage } from '@/components/errors/error-message';
import { Spinner } from '@/components/ui/feedback/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import type { UISubject } from '@/types/university-subject';
import { transformUniversityData } from '@/features/search/utils/university-data-transformer';
import { SectionTitle } from '@/components/ui/section-title';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
          console.error('データが配列ではありません:', typeof data, data);
          throw new Error('無効なレスポンス形式です');
        }

        const transformedData = transformUniversityData(data);
        setSubjects(transformedData);
      } catch (error) {
        console.error('大学データの取得に失敗しました:', error);
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
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (subjects.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card className="p-4">
      <div>
        <SectionTitle>{title}</SectionTitle>
        <div className="mt-2">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className="font-semibold">
                  大学名
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  学部
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  学科
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  日程
                </TableHead>
                <TableHead scope="col" className="font-semibold">
                  募集人員
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject: UISubject) => (
                <TableRow
                  key={`${subject.university.id}-${subject.department.id}-${subject.major.id}-${subject.admissionSchedule.id}`}
                  className="cursor-pointer hover:bg-muted/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset focus:z-10 relative focus:relative"
                  onClick={() =>
                    handleRowClick(
                      subject.examInfo.academicYear,
                      subject.university.id,
                      subject.department.id,
                      subject.major.id,
                      subject.admissionSchedule.id
                    )
                  }
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(
                        subject.examInfo.academicYear,
                        subject.university.id,
                        subject.department.id,
                        subject.major.id,
                        subject.admissionSchedule.id
                      );
                    }
                  }}
                  aria-label={`${subject.university.name} ${subject.department.name} ${subject.major.name} ${subject.admissionSchedule.name} 募集人員${subject.examInfo.enrollment}名`}
                >
                  <TableCell className="relative">{subject.university.name}</TableCell>
                  <TableCell className="relative">{subject.department.name}</TableCell>
                  <TableCell className="relative">{subject.major.name}</TableCell>
                  <TableCell className="relative">{subject.admissionSchedule.name}</TableCell>
                  <TableCell className="relative">{subject.examInfo.enrollment} 名</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default SearchResultTable;
