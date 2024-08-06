import Header from "./components/Header";
import SubjectSearchForm from "./components/SearchForm";
import SubjectList from "./components/SubjectList";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <SubjectSearchForm />
        <SubjectList />
      </div>
    </main>
  );
}
