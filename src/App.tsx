import "./main.css";
import data from "./data/data.json" with { type: "json" };
import Header from "./components/Header.js";
import Project from "./projects/Project.jsx";
import { Leva, useControls } from "leva";
import { useDebug } from "./hooks/useDebug.js";


export type ProjectData = {
id: number; 
name: string;
description: string; 
thumbnail: string; 
media: string[]
category: string; 
year: number
}

export type Data = ProjectData[]


export default function App() {
  const isDebug = useDebug();
  let dStyles = document.head.appendChild(document.createElement("style"));

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
    { collapsed: false }
  );

  return (
    <>
      <Leva hidden={!isDebug} />
      <div className="flex flex-col gap-4">
        <Header />

        <div className="container h-fit flex flex-col gap-3">
          <hr className="border-t-1"></hr>
          {[...Array(data.length)].map((v, i) => (
            <Project key={i} {...data[i]} />
          ))}
        </div>
      </div>
    </>
  );
}
