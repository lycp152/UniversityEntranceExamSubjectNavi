import Link from "next/link";
import { Button } from "@/components/ui/buttons/button";

interface ErrorStateProps {
  title: string;
  message: string;
  showReload?: boolean;
}

export const ErrorState = ({
  title,
  message,
  showReload = false,
}: ErrorStateProps) => {
  return (
    <div className="text-center p-4">
      <h2 className="text-xl font-bold text-red-600 mb-2">{title}</h2>
      <p className="text-gray-600">{message}</p>
      <div className="space-x-4 mt-4">
        {showReload && (
          <Button onClick={() => window.location.reload()}>再読み込み</Button>
        )}
        <Link href={{ pathname: "/" }}>
          <Button variant="outline">トップに戻る</Button>
        </Link>
      </div>
    </div>
  );
};
