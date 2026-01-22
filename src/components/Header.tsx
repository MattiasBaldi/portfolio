import { useState, useEffect, useRef, forwardRef } from "react";
import type { ReactNode } from "react";
import { CloseButton, TextLink } from "./ui";


// ---------- Main Header ----------
export default function Header() {
  const accordionRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [maxHeight, setMaxHeight] = useState<string>("0px");

  useEffect(() => {
    if (!accordionRef.current) return;

    const updateHeight = () => setMaxHeight(open ? `${accordionRef.current!.scrollHeight}px` : "0px");

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(accordionRef.current);

    return () => observer.disconnect();
  }, [open]);

  return (
    <div className={`group hover:cursor-pointer z-10 bg-grey-100 w-fit h-fit flex flex-col`}>


      
      {/* Header */}
      <h1
        onClick={() => setOpen((prev) => !prev)}
        className="hover:cursor-pointer lg:text-8xl lg:font-semibold"
      >
        Mattias Baldi
        <span className="text-xl font-normal">/</span>
        <span
          className={`text-xl group-hover:underline ${
            open ? "opacity-100 font-bold" : "font-normal opacity-50"
          }`}
        >
          info
        </span>
      </h1>

      {/* Accordion */}
      <Accordion
        maxHeight={maxHeight}
        onClick={() => setOpen(false)}
      >
        <div ref={accordionRef} className="overflow-hidden transition-all duration-500 ease-in-out w-full" style={{ maxHeight }}>


          {/* all */}
          <div className={`flex flex-col justify-start items-start py-5 md:py-5 lg:pt-20 gap-10 w-full`}>
            <div className="flex flex-col md:flex-row-reverse gap-10 md:gap-20 lg:gap-60 w-full">

              {/* text */}
         <div className="flex flex-col gap-10 max-w-175">
            <p >
               I create immersive digital experiences that deliver real impact for brands and businesses. With a background in design and technology from Copenhagen School of Design and Technology, I work across the digital landscape, specializing in 3D web experiences with WebGL, WebGPU, and Three.js.
            </p>

            <p>
            I’ve worked with most modern web stacks and focus on clean software design, selecting frameworks, languages, and architectures based on each project’s needs, grounded in solid computer science and software engineering. My primary tools are TypeScript, Three.js, React, and React Three Fiber, and I also use AI-assisted development (Claude Code) as an assitant and to optimize workflow.
            </p>



          </div>


              <Links />
            </div>

            {/* Close button */}
            <CloseButton
              onClick={() => setOpen(false)}
              className="self-start mt-2 group-hover:underline"
            />
          </div>
        </div>
      </Accordion>
    </div>
  );
}

// ---------- Accordion ----------
interface AccordionProps {
  maxHeight: string;
  children: ReactNode;
  onClick?: () => void;
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ maxHeight, children, onClick }, ref) => (
    <div
      ref={ref}
      className="hover:cursor-pointer overflow-hidden w-full flex flex-col transition-all duration-800 ease-in-out"
      style={{ maxHeight }}
      onClick={onClick}
    >
      {children}
    </div>
  )
);

Accordion.displayName = "Accordion";

// ---------- Links Component ----------
function Links() {
  return (
    <div className="links flex flex-col gap-20">
      <div className="flex flex-col gap-3">
        <TextLink url="https://github.com/MattiasBaldi" label="GITHUB" />
        {/* <TextLink url="https://www.instagram.com/mb_labs/?hl=da" label="INSTAGRAM" /> */}
        <TextLink url="https://www.linkedin.com/in/mattias-baldi-6359b0168" label="LINKEDIN" />
      </div>

      <div className="font-medium flex flex-col gap-3">
        <TextLink url="tel:+4545521789" label="+45 45 521789" />
        <TextLink url="mailto:mattiasbaldi@gmail.com" label="mattiasbaldi@gmail.com" />
      </div>
    </div>
  );
}
