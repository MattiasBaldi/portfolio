import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";

export default function Profile() {
  const cube = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!cube.current) return;
    cube.current.rotation.x += delta * 0.7;
    cube.current.rotation.y += delta * 0.7;
    cube.current.rotation.z += delta * 0.7;
  });

  return (
    <mesh ref={cube}>
      <boxGeometry />
      <meshBasicMaterial color="black" wireframe />
    </mesh>
  );
}
