import "@/styles/main.css";
import Header from "../components/Header.js";
import {Projects} from "../components/projects/Project.jsx";
import { Leva, useControls } from "leva";
import { useDebug } from "../hooks/useDebug.js";
import { useEffect, useMemo } from "react";

export default function Home() {
  const isDebug = useDebug();
  const dStyles = useMemo(() => {
    const style = document.head.appendChild(document.createElement("style"));
    return style;
  }, []);

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
              ));
        },
      },
    },
    { collapsed: true }
  );

  return (
    <>
      <main className="flex container flex-col gap-2 md:gap-3 lg:gap-7 lg:mt-5 justify-center overflow-auto overflow-x-hidden">
        <Header />
        <hr className="w-[200vw] relative left-[-50vw] lg:w-full lg:left-0" />
        <Projects />
      </main>
      <Leva hidden={!isDebug} collapsed={true} />
    </>
  );
}
