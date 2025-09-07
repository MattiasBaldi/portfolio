import { useRef, useEffect, useState } from "react";
import R3F from "./R3F/R3F.jsx";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function Header() {
  const accordion = useRef();
  const [open, setOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");

  useEffect(() => {
    if (!accordion.current) return;

    const updateHeight = () => {
      setMaxHeight(open ? `${accordion.current.scrollHeight}px` : "0px");
    };

    updateHeight(); // initial

    const observer = new window.ResizeObserver(updateHeight);
    observer.observe(accordion.current);

    return () => observer.disconnect();
  }, [open]);

  const setAccordion = () => setOpen((prev) => !prev);

  return (
    // Overall
    <div className="container w-full flex flex-col gap-2 lg:gap-5">
      {/* Experience, name and brief description */}
      <div className="flex lg:flex-row-reverse h-30 items-center justify-between gap-5 lg:border-b-1 border-gray-500">
        <R3F />

        <div className="max-w-40 md:max-w-none flex flex-col h-full min-h-full gap-5 lg:gap-1">
          <h1 className="lg:text-8xl lg:font-extralight">Mattias Baldi</h1>
          <p className="text-xs italic">
            Crafting Immersive experiences - that matter
          </p>
        </div>
      </div>

      {/* Links */}
      <div className="border-1 border-grey-500 lg:border-0 lg:border-b-1 flex h-8 justify-between items-center px-5">
        <button className="cursor-pointer" onClick={setAccordion}>
          Info
        </button>
        <hr className="w-[1px] h-full bg-gray-500" />
        <ul className="flex gap-6 justify-between">
          <a
            href="https://github.com/MattiasBaldi"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./src/assets/github.svg" className="icon" />
          </a>
          <a
            href="https://www.instagram.com/mb_labs/?hl=da"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./src/assets/instagram.svg" className="icon" />
          </a>
          <a
            href="https://www.linkedin.com/in/mattias-baldi-6359b0168/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="./src/assets/linkedin.svg" className="icon" />
          </a>
        </ul>
        {/* message */}
        <hr className="w-[1px] h-full bg-gray-500" />
        <a href="mailto:mattiasbaldi@gmail.com" target="_blank">
          <img src="./src/assets/message.svg" className="icon" />
        </a>
      </div>

      {/* accordion */}
      <div
        ref={accordion}
        className="overflow-hidden min-w-full w-full  max-w-full flex flex-col lg:flex-row justify-between transition-all duration-800 ease-in-out"
        style={{ maxHeight }}
      >
        <p className="py-2 max-w-150">
          I specialize in crafting immersive experiences for brands and
          businesses that results in real impact. I initially come from a
          background of design from Copenhagen School of design and Technology,
          and later complimented that through further technical expertise as I
          through time became an autodidact developer with the help of courses
          such as Harvard’s CS50 Computer Science, Three.js Journey and real
          world experience
        </p>

        <div className="font-medium">
          <p>
            <a href="tel:+4545521789" className="">
              +45 45 521789
            </a>
          </p>
          <p>
            <a href="mailto:mattiasbaldi@gmail.com" className="">
              mattiasbaldi@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
