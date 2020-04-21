import { TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const loaders = {
  gltf: new GLTFLoader(),
  texture: new TextureLoader(),
};

export default loaders;
