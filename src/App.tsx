import "./main.css";
import Header from "./components/Header.js";
import {Projects} from "./components/projects/Project.jsx";
import { Leva, useControls } from "leva";
import { useDebug } from "./hooks/useDebug.js";

export type ProjectData = {
id?: number;
name?: string;
description?: string;
thumbnail?: string;
media?: string[]
category?: string;
year?: number
}

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
            ? (dStyles.textContent = "* { border: 1px solid red; }")
            : (dStyles.textContent = dStyles.textContent.replace(
                "* { border: 1px solid red; }",
                ""
              )); //
        },
      },
    },
    { collapsed: true }
  );

  return (
    <>
      <div className="flex flex-col justify-center">
        <Header />

        <Projects /> 
      </div>
      <Leva hidden={!isDebug} collapsed={true}/>
    </>
  );
}
