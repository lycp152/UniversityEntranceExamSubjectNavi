import UniversityPage from "@/features/university/components/UniversityPage";
import { UniversityPageParams } from "@/features/university/types/params";

export default function Page({
  params,
}: Readonly<{ params: UniversityPageParams }>) {
  const paramsPromise = Promise.resolve(params);
  return <UniversityPage params={paramsPromise} />;
}
