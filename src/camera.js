import { PerspectiveCamera, AudioListener, Vector3 } from "three";

var width = window.innerWidth;
var height = window.innerHeight;
var camera = new PerspectiveCamera(50, width / height, 0.1, 10000);
camera.listener = new AudioListener();
camera.add(camera.listener);
camera.position.copy(new Vector3(0, 10, 20));
camera.rotateOnAxis(new Vector3(1, 0, 0), -0.5);

const speed = 0.01;
camera.pan = function (x, y) {
  camera.position.x -= x * speed;
  camera.position.z -= y * speed;
};

camera.updatePosition = function (nextPos) {
  if (nextPos.z > 4 && nextPos.z < 100 && nextPos.y > 1) {
    camera.position.copy(nextPos);
  }
};

export default camera;
