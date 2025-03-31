import UniversityPage from "@/features/universities/components/UniversityPage";
import { UniversityPageParams } from "@/features/universities/types/params";

interface PageProps {
  readonly params: Promise<UniversityPageParams>;
}

export default function Page({ params }: PageProps) {
  return <UniversityPage params={params} />;
}
