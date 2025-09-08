import { useRef } from "react";

export default function Title(props, className) {
  const title = useRef();

  return (
    <div
      ref={title}
      style={className}
      className="lg:hidden flex flex-col absolute p-3 bottom-0 text-grey-0 "
    >
      <p className="h-fit font-bold truncate">{props.name}</p>
      <p className="h-fit truncate">{props.category}</p>
    </div>
  );
}
