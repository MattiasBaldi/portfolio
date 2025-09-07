import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Profile from "./Profile.jsx";

export default function R3F() {
  return (
    <>
      <Canvas
        className="r3f-canvas fake-border"
        camera={{ position: [0, 0, 2] }}
      >
        <OrbitControls />

        <Profile />
      </Canvas>
    </>
  );
}
