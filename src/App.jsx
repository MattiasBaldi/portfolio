import "./main.css";
import data from "./data.json";
import Header from "./Header.jsx";
import Project from "./projects/Project.jsx";
import Debug from "./Debug.jsx";

export default function App() {
  return (
    <div className="flex flex-col gap-4">
      <Debug />
      <Header />
      {/* Projects */}
      <div className="container h-fit flex flex-col gap-3">
        {[...Array(data.length)].map((v, i) => (
          <Project key={i} {...data[i]} />
        ))}
      </div>
    </div>
  );
}
