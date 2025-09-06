import R3F from "./R3F/R3F.jsx";

export default function Header() {
  return (
    // Overall
    <div className="flex flex-col gap-2">
      {/* Name */}
      <div className="flex lg:flex-row-reverse h-30 items-center justify-between">
        <R3F />
        <div className="w-fit flex flex-col h-full min-h-full gap-5">
          <p className="lg:text-5xl lg:font-extralight">Mattias Baldi</p>
          <p className="text-xs w-30">
            Crafting Immersive experiences that matter
          </p>
        </div>
      </div>

      {/* Links */}
      <div className="border-1 flex h-8 justify-between items-center px-5">
        <button className="cursor-pointer"> Info </button>
        {/* links */}
        <hr className="w-[0.2px] h-full bg-gray-500 border-0" />
        <ul className="flex gap-6 justify-between">
          <a href="https://github.com/MattiasBaldi">
            <img src="./src/assets/github.svg" className="icon" />
          </a>
          <a href="https://www.instagram.com/mb_labs/?hl=da">
            <img src="./src/assets/instagram.svg" className="icon" />
          </a>
          <a href="https://www.linkedin.com/in/mattias-baldi-6359b0168/">
            <img src="./src/assets/linkedin.svg" className="icon" />
          </a>
        </ul>
        {/* message */}
        <hr className="w-[0.2px] h-full bg-gray-500 border-0" />
        <a href="mailto:mattiasbaldi@gmail.com">
          <img src="./src/assets/message.svg" className="icon" />
        </a>
      </div>
      <div className="hidden">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia at odio
        voluptas, similique quis illo quia, dolore doloremque ipsum hic aliquid
        accusantium? Labore quod similique veniam, iure error officia tempora.
      </div>
    </div>
  );
}
