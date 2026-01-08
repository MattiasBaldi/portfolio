import React, { useRef } from "react";
import type { ProjectData } from "../App.js";

export function Thumbnail(props: ProjectData) {
  const title = useRef(null);
  const thumbnail = useRef(null);

  return (
    <div className="thumbnail min-w-full h-full lg:min-w-40">
      {/* Title and category */}
      <div
        ref={title}
        className="lg:hidden flex flex-col absolute p-3 bottom-0 text-grey-0 "
      >
        <p className="h-fit font-bold truncate">{props.name}</p>
        <p className="h-fit truncate">{props.category}</p>
      </div>

      {/* <Title {...props} /> */}

      {/* Thumnail */}
      <img
        ref={thumbnail}
        className="thumbnail w-full lg:w-100"
        src={props.thumbnail}
      />
    </div>
  );
}
