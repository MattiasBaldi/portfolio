import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function Profile() {
  const cube = useRef();

  useFrame((state, delta) => {
    cube.current.rotation.y += delta;
  });

  return (
    <mesh ref={cube}>
      <boxGeometry />
      <meshBasicMaterial color="green" />
    </mesh>
  );
}
