import { useState, useEffect, useRef, forwardRef } from "react";
import type { ReactNode } from "react";

const gap = 30; 

// ---------- Main Header ----------
export default function Header() {
  const accordionRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [maxHeight, setMaxHeight] = useState<string>("0px");

  useEffect(() => {
    if (!accordionRef.current) return;

    const updateHeight = () =>
      setMaxHeight(open ? `${accordionRef.current!.scrollHeight}px` : "0px");

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(accordionRef.current);

    return () => observer.disconnect();
  }, [open]);

  return (
    <div className="container z-10 bg-grey-100 w-fit h-fit flex flex-col gap-10">
      {/* Header */}
      <h1
        onClick={() => setOpen((prev) => !prev)}
        className="hover:cursor-pointer lg:text-8xl lg:font-semibold"
      >
        Mattias Baldi
        <span className="text-xl font-normal">/</span>
        <span
          className={`text-xl hover:underline ${
            open ? "opacity-[1] font-bold  " : " font-normal  opacity-[0.5]"
          }`}
        >
          info
        </span>
      </h1>

      {/* Accordion */}
      <Accordion maxHeight={maxHeight}>
        <div ref={accordionRef} className="overflow-hidden transition-all duration-500 ease-in-out" style={{ maxHeight }}>

          {/* all */}
          <div className={`flex flex-col justify-start items-start gap-${gap}`}>
            <div className={`flex flex-col md:flex-row-reverse gap-${gap} gap-30 lg:gap-100 `}>

              {/* text */}
              <p className="py-2 max-w-150 h-fit ">
                I create immersive digital experiences that deliver real impact
                for brands and businesses. I have a background in design &
                technology from the Copenhagen School of Design and Technology,
                I specialize in experiences for the 3d web particularly related to WebGL and
                Three.js.
              </p>

              <Links />
            </div>

            {/* Close button */}
            <button className="hover:cursor-pointer hover:underline self-start mt-2" onClick={(e) => { e.stopPropagation(); setOpen(false)}}>Close</button>
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
}

const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  ({ maxHeight, children }, ref) => (
    <div
      ref={ref}
      className="overflow-hidden w-full flex flex-col transition-all duration-800 ease-in-out"
      style={{ maxHeight }}
    >
      {children}
    </div>
  )
);

Accordion.displayName = "Accordion";

// ---------- Links Component ----------
function Links() {
  return (
    <div className={`links flex flex-col gap-${gap}`}>
      <div className="flex flex-col gap-3">
        <TextLink url="https://github.com/MattiasBaldi" label="GITHUB" />
        <TextLink url="https://www.instagram.com/mb_labs/?hl=da" label="INSTAGRAM" />
        <TextLink url="https://www.linkedin.com/in/mattias-baldi-6359b0168" label="LINKEDIN" />
      </div>

      <div className="font-medium flex flex-col gap-3">
        <TextLink url="tel:+4545521789" label="+45 45 521789" />
        <TextLink url="mailto:mattiasbaldi@gmail.com" label="mattiasbaldi@gmail.com" />
      </div>
    </div>
  );
}

// ---------- Reusable Link Components ----------
interface TextLinkProps {
  url: string;
  label: string;
}

function TextLink({ url, label }: TextLinkProps) {
  return (
    <p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold hover:underline"
        onClick={(e) => e.stopPropagation()} // prevent parent toggle
      >
        {label}
      </a>
    </p>
  );
}
