import React from "react";
import type { Data, ProjectData } from "../App.js";

export function DateIndex(props: ProjectData) {
  return (
    <div className="date-index  flex w-">
      <div
        //   ref={dateIndex}
        className="flex flex-col min-h-full h-full w-20 pr-5 justify-between items-stretch border-gray-200 border-l"
      >
        <p>{props.year}</p>
        <p>[{props.id}]</p>
      </div>
      <div className="border-r-1 w-1 h-full border-gray-500"></div>
    </div>
  );
}
