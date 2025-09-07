import { useState } from "react";
import { gsap } from "gsap";
import { useGsap } from "@gsap/react";

console.log(gsap, useGsap);

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState(false);
  const toggle = (index) => setOpenIndex(openIndex === index ? false : index);

  return (
    <>
      <button onClick={toggle}></button>

      {/* content */}
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi sapiente
        suscipit explicabo at voluptatum quae esse id, consectetur quam magnam
        nobis earum. Porro quo odit reprehenderit, quisquam ut enim veritatis!
      </div>
    </>
  );
}
