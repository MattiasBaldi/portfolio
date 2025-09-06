export default function Projects() {
  return (
    <div className="flex flex-col gap-3">
      <div className="cursor-pointer relative flex justify-between w-full h-40 gap-3 overflow-hidden">
        {/* Date and Index */}
        <div className="flex flex-col min-h-full h-full w-30 justify-between items-stretch">
          <p>2024</p>
          <p>[1]</p>
        </div>

        <div className="w-full hidden lg:block">
          <p className="h-fit font-bold truncate">Simone Juice</p>
          <p className="h-fit truncate">Web design, web development</p>
        </div>
        <div className="border-r-[0.2px]"></div>

        {/* Images */}
        <div className="min-w-full h-full lg:min-w-40">
          <div className="lg:hidden flex flex-col absolute p-3 bottom-0 text-grey-0 ">
            <p className="h-fit font-bold truncate">Simone Juice</p>
            <p className="h-fit truncate">Web design, web development </p>
          </div>
          <img className="w-full" src="./src/assets/simone-juice.png" />
        </div>
      </div>
      <hr />
    </div>
  );
}
