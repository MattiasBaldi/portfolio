import React, { useEffect } from "react";
import MarqueeLoop from "./MarqueeLoop.js";
import { useControls } from "leva";
import type { Data, ProjectData } from "../App.js";

export function Content(props: ProjectData) {
  const controls = useControls(
    "Content",
    {
      height: { value: 100, min: 0, max: 1000, step: 1 },
    },
    [props]
  );

  return (
    <div className={`content h-0 left-200 top-10 overflow-hidden`}>
      <MarqueeLoop media={props.media} />
      <p>{props.description}</p>
    </div>
  );
}
