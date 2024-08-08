import React from "react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import SearchResultTable from "./components/SearchResultTable";

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
