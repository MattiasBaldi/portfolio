import { useState } from "react";
import MarqueeLoop from "./MarqueeLoop.js";
import type { ProjectData } from "../../App.js";

export function Content(props: ProjectData) {
  const [viewMore, setViewMore] = useState<boolean>(false);

  const maxLength = 100;
  const description = props.description ?? "";
  const isLong = description.length > maxLength;
  const abbreviated = description.slice(0, maxLength);

  return (
    <div className="content h-0 left-200 flex flex-col top-10 gap-10 overflow-hidden">
      <MarqueeLoop media={props.media ?? []} />
      <p>
        {viewMore || !isLong ? (
          description
        ) : (
          <>
            {abbreviated}...{" "}
            <span
              onClick={(e) => {
                e.stopPropagation();
                setViewMore(true);
              }}
              className="underline cursor-pointer"
            >
              view more
            </span>
          </>
        )}
      </p>
    </div>
  );
}
