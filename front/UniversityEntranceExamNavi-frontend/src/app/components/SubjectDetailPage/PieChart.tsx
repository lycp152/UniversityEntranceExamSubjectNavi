const PieChart = () => {
  return (
    <div className="flex flex-wrap justify-center items-center">
      <div className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-64 lg:h-64 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96">
        {/* 外側の円 */}
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(#2589d0_27.78%,#5ba9f7_27.78%_55.56%,#ff5722_55.56%_66.67%,#ffeb3b_66.67%_88.89%,#4caf50_88.89%_100%)]"></div>
        {/* 内側の円 */}
        <div className="absolute inset-6 sm:inset-8 md:inset-10 lg:inset-8 xl:inset-10 2xl:inset-12 rounded-full bg-[conic-gradient(#ffc107_5.56%,#ffeb3b_5.56%_11.12%,#4caf50_11.12%_27.79%,#ff9800_27.79%_38.90%,#9c27b0_38.90%_55.57%,#3f51b5_55.57%_66.68%,#00bcd4_66.68%_88.90%,#8bc34a_88.90%_94.46%,#607d8b_94.46%_100%)]"></div>
      </div>
      <ol className="list-none ml-4 space-y-2">
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">英語R + L</span>
          <span>27.78%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#2589d0" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">数学</span>
          <span>27.78%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#5ba9f7" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">国語</span>
          <span>11.11%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ff5722" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">理科</span>
          <span>22.22%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ffeb3b" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">地歴公</span>
          <span>5.56%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#4caf50" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">英語R共通</span>
          <span>5.56%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ffc107" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">英語L共通</span>
          <span>5.56%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ffeb3b" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">英語R二次</span>
          <span>16.67%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#4caf50" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">数学共通</span>
          <span>11.11%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#ff9800" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">数学二次</span>
          <span>16.67%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#9c27b0" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">国語共通</span>
          <span>11.11%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#3f51b5" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">理科共通</span>
          <span>22.22%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#00bcd4" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">地歴公共通</span>
          <span>5.56%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#8bc34a" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">二次面接</span>
          <span>5.56%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#607d8b" }}
          ></span>
        </li>
      </ol>
    </div>
  );
};

export default PieChart;
