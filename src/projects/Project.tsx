import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import MarqueeLoop from "./MarqueeLoop.jsx";
import { Thumbnail } from "./Thumbnail.js";
import { DateIndex } from "./Date&Index.js";
import { useControls, button } from "leva";
import { Content } from "./Content.js";
import { TitleDescription } from "./TitleDescription.js";
import type { Data, ProjectData } from "../App.js";
import { useToggle } from "../hooks/useAnimations.js";

gsap.registerPlugin(useGSAP);

export default function Projects(props: ProjectData) {
  const container = useRef(null);
  const { contextSafe } = useGSAP({ scope: container });
  const toggle = useToggle(contextSafe);

  return (
    <>
      <div
        onClick={() => toggle()}
        ref={container}
        className="project flex flex-col gap-3"
      >
        <div
          className="preview cursor-pointer relative flex justify-between w-full h-40 gap-3 overflow-hidden" //prettier-ignore
        >
          <DateIndex {...props} />
          <TitleDescription {...props} />
          <Thumbnail {...props} />
        </div>
        
        <Content {...props} />
        <hr className="border-gray-500" />
      </div>
    </>
  );
}
