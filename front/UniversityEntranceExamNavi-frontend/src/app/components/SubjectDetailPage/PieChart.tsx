const PieChart = () => {
  return (
    <div className="flex flex-wrap justify-center items-center">
      <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-64 lg:h-64 xl:w-80 xl:h-80 2xl:w-96 2xl:h-96 rounded-full bg-[conic-gradient(#2589d0_70%,#5ba9f7_70%_90%,#f2f2f2_90%_100%)]"></div>
      <ol className="list-none ml-4 space-y-2">
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">項目1</span>
          <span>70%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#2589d0" }}
          ></span>
        </li>
        <li className="flex items-center text-xs">
          <span className="mr-2 font-semibold">項目2</span>
          <span>20%</span>
          <span
            className="block w-6 h-4 ml-2"
            style={{ backgroundColor: "#5ba9f7" }}
          ></span>
        </li>
      </ol>
    </div>
  );
};

export default PieChart;
