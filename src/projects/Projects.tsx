import { useEffect, useState } from "react";
import Project from "./Project.jsx";

export default function Projects({ data }) {
  return (
    <div className="container h-fit flex flex-col gap-3">
      {[...Array(data.length)].map((v, i) => (
        <Project key={i} {...data[i]} />
      ))}
    </div>
  );
}
