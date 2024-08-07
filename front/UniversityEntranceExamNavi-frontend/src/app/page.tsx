import React from "react";
import Header from "./components/Header";
import SubjectSearchForm from "./components/SearchForm";
import SubjectTable from "./components/SubjectTable";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto p-4">
        <SubjectSearchForm />
        <SubjectTable />
      </div>
    </main>
  );
}
