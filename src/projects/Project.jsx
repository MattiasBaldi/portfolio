import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Title from "./Title";
import MarqueeLoop from "./MarqueeLoop";

export default function Projects(props) {
  const project = useRef();
  const preview = useRef();
  const content = useRef();
  const dateIndex = useRef();
  const border = useRef();
  const thumbnail = useRef();
  const images = useRef();

  ///
  const title = useRef();

  useGSAP((context, contextSafe) => {
    let tl = gsap.timeline({ paused: true });

    tl.to(border.current, { y: 200, opacity: 0, duration: 1 }, "<");
    tl.to(thumbnail.current, { y: 200, opacity: 0, duration: 1 }, "<");
    tl.to(dateIndex.current, { y: 200, duration: 1 }, "<");
    tl.to(title.current, { x: -75, color: "black", duration: 1 }, "<");
    tl.to(content.current, { height: "400px", duration: 1 }, "<");

    // start reversed so first click plays forward
    tl.reverse();

    const onClick = contextSafe(() => {
      tl.reversed(!tl.reversed());
    });

    preview.current.addEventListener("click", onClick);

    return () => {
      preview.current.removeEventListener("click", onClick);
    };
  });

  return (
    <div ref={project} className="project relative flex flex-col gap-3">
      <div
        ref={preview}
        className="preview cursor-pointer relative flex justify-between w-full h-40 gap-3 overflow-hidden"
      >
        {/* Date and Index */}
        <div
          ref={dateIndex}
          className="date-index flex flex-col min-h-full h-full w-30 justify-between items-stretch"
        >
          <p>{props.year}</p>
          <p>[{props.id}]</p>
        </div>

        {/* <Title
          {...props}
          className="lg:hidden flex flex-col absolute p-3 bottom-0 text-grey-0"
        /> */}

        {/* Title and category */}
        <div ref={title} className="hidden lg:flex flex-col ">
          <p className="h-fit font-bold truncate">{props.name}</p>
          <p className="h-fit truncate">{props.category}</p>
        </div>

        <div ref={border} className="border border-r-1 border-gray-500"></div>

        <div className="min-w-full h-full lg:min-w-40">
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
      </div>

      {/* Content */}
      <div className="h-0 overflow-hidden" ref={content}>
        {/* <div ref={images} className="flex overflow-x-auto">
          {props.media.map((v, i) => (
            <img className="" key={i} src={v} />
          ))}
        </div> */}
        <MarqueeLoop media={props.media} />

        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Et eveniet,
          culpa possimus voluptas voluptatem illo amet, temporibus velit
          architecto dicta, dolorum vero sit est qui esse ipsum distinctio
          consequatur vel.
        </p>
      </div>
      <hr className="border-gray-500" />
    </div>
  );
}
