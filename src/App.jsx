import "./main.css";
import Header from "./Header.jsx";
import Project from "./Project.jsx";
import projects from "./projects.json";
import Debug from "./Debug.jsx";

export default function App() {
  return (
    <div className="flex flex-col gap-4">
      <Debug />
      <Header />
      {/* Projects */}
      <div className="h-fit flex flex-col gap-3">
        {[...Array(projects.length)].map((v, i) => (
          <Project key={i} />
        ))}
      </div>
    </div>
  );
}
