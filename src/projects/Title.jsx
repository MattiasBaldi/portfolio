import { useRef } from "react";

export default function Title(props) {
  const title = useRef();

  return (
    // Title and category
    <div
      ref={title}
      className="lg:hidden flex flex-col absolute p-3 bottom-0 text-grey-0 "
    >
      <p className="h-fit font-bold truncate">{props.name}</p>
      <p className="h-fit truncate">{props.category}</p>
    </div>
  );
}
