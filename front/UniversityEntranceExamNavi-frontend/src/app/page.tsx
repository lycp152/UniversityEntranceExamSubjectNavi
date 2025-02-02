import Header from '../components/layout/Header';
import SearchForm from '../features/search/components/SearchForm';
import SearchResultTable from '../features/search/components/SearchResultTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <SearchForm />
        <SearchResultTable />
      </div>
    </main>
  );
}
