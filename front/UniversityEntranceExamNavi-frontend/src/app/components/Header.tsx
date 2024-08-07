export default function Header() {
  return (
    <header>
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap justify-between items-center max-w-screen-xl mx-auto">
          <a href="/" className="flex items-center">
            <span className="text-xl font-semibold text-gray-800">
              受験科目navi
            </span>
          </a>
          <div className="flex items-center">
            <a
              href="/"
              className="bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
            >
              ログイン・新規登録
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
