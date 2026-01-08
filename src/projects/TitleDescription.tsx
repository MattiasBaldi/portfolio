import React, { useState } from "react";
import type { Data, ProjectData } from "../App.js";

export function TitleDescription(props: ProjectData) {
  return (
    <div className={`title-description hidden lg:flex flex-col`}>
      <p className="h-fit font-bold truncate">{props.name}</p>
      <p className="h-fit truncate">{props.category}</p>
    </div>
  );
}
