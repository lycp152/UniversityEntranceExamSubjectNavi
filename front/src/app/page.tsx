import SearchForm from "@/components/features/search/form/SearchForm";
import SearchResultTable from "@/components/features/search/result/SearchResultTable";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <SearchForm />
        <SearchResultTable />
      </div>
    </main>
  );
}
