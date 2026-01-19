import "./main.css";
import Header from "./components/Header.js";
import {Projects} from "./components/projects/Project.jsx";
import { Leva, useControls } from "leva";
import { useDebug } from "./hooks/useDebug.js";

export type MediaItem = {
  src: string;
  title: string;
  description: string;
};

export type ProjectData = {
  id?: number;
  name?: string;
  description?: string;
  disclaimer?: string;
  links?: Array<{ label: string; url: string }>;
  thumbnail?: string;
  thumbnailPosition?: string;
  media?: MediaItem[];
  category?: string;
  year?: number;
};

export type Data = ProjectData[]

export default function App() {
  const isDebug = useDebug();
  let dStyles = document.head.appendChild(document.createElement("style"));

  // debug
  useControls(
    "debug",
    {
      borders: {
        value: false,
        onChange: (v) => {
          v
            ? (dStyles.textContent = "*:not([class*='leva']):not([class*='leva'] *) { border: 1px solid red; }")
            : (dStyles.textContent = dStyles.textContent.replace(
                "*:not([class*='leva']):not([class*='leva'] *) { border: 1px solid red; }",
                ""
              )); //
        },
      },
    },
    { collapsed: true }
  );

  return (
    <>
      <div className="flex container flex-col gap-5 lg:gap-20 justify-center overflow-auto overflow-x-hidden">
        <Header />
          <hr className="w-[200vw] relative left-[-50vw] lg:w-full lg:left-0" />
        <Projects /> 
      </div>
      <Leva hidden={!isDebug} collapsed={true}/>
    </>
  );
}
