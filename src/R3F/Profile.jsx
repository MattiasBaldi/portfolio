import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";

export default function Profile() {
  const cube = useRef();

  useFrame((state, delta) => {
    cube.current.rotation.x += delta * 0.7;
    cube.current.rotation.y += delta * 0.7;
    cube.current.rotation.z += delta * 0.7;
  });

  /*
     Depreceated - Device Orientation Controls
  // https://github.com/mrdoob/three.js/blob/r133/examples/jsm/controls/DeviceOrientationControls.js
  */

  return (
    <mesh ref={cube}>
      <boxGeometry />
      <meshBasicMaterial color="black" wireframe />
    </mesh>
  );
}
