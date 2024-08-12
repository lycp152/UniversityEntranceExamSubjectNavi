const PieChart = () => {
  return (
    <div className="flex flex-wrap justify-center items-center">
      <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-64 lg:h-64 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96">
        {/* 外側の円 */}
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(#2589d0_60%,#5ba9f7_60%_85%,#ff5722_85%_100%)]"></div>
        {/* 内側の円 */}
        <div className="absolute inset-6 sm:inset-8 md:inset-10 lg:inset-8 xl:inset-10 2xl:inset-12 rounded-full bg-[conic-gradient(#ffc107_50%,#ffeb3b_50%_75%,#4caf50_75%_100%)]"></div>
      </div>
      <ol className="list-none ml-4 space-y-2">
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">外側項目1</span>
          <span>60%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#2589d0" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">外側項目2</span>
          <span>25%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#5ba9f7" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">外側項目3</span>
          <span>15%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ff5722" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">内側項目1</span>
          <span>50%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ffc107" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">内側項目2</span>
          <span>25%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ffeb3b" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">内側項目3</span>
          <span>25%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#4caf50" }}
          ></span>
        </li>
      </ol>
    </div>
  );
};

export default PieChart;
