import { Clock, Raycaster, Vector2, Vector3 } from "three";
import scene from "./scene";
import camera from "./camera";
import { renderer } from "./renderer";
import { toMoneyText } from "./utils";
import { adjectives, nouns } from "./constants";
import businesses from "./businesses/businesses";

var clock = new Clock();

window.addEventListener("resize", resize);

function animate() {
  requestAnimationFrame(animate);
  var delta = clock.getDelta();
  if (process.env.NODE_ENV == "development") {
    document.getElementById("fps").innerHTML = Math.round(1 / delta);
  }
  scene.animate(delta);
  renderer.render(scene, camera);
}

function resize() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function load() {
  document.body.appendChild(renderer.domElement);
  animate();
}

function start(playerNameInput) {
  global.player = {
    name: playerNameInput,
    new: true,
    money: 50,
  };
  updateMoney(global.player.money);
  document.getElementById("splash").remove();

  showHint("Click on the egg to start an egg business!");

  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("wheel", updateCamera);
}

var hint = {
  element: document.getElementById("hint"),
  message: document.getElementById("hint").querySelector(".message"),
  close: document.getElementById("hint").querySelector(".close"),
};
hint.close.onclick = (_) => hideHint();
function showHint(message) {
  hint.element.style.display = "inline-block";
  hint.message.innerText = message;
}

function hideHint() {
  hint.element.style.display = "none";
}

function updateMoney() {
  document.getElementById("money").innerText = toMoneyText(global.player.money);
}

function updateCamera() {
  let dist = -event.deltaY * 0.005;
  let dir = new Vector3();
  camera.getWorldDirection(dir);
  let nextPos = camera.position.clone().add(dir.normalize().multiplyScalar(dist));
  camera.updatePosition(nextPos);
}

function onMouseMove(e) {
  if (mouseDown) {
    let scalar = 0.001 * camera.position.length();
    let dir = new Vector3(-e.movementX * scalar, e.movementY * scalar, 0);
    let nextPos = camera.localToWorld(dir);
    camera.updatePosition(nextPos);
  }
}

var mouseDown = false;
var mouseTarget;
function onMouseDown(e) {
  if (e.target.tagName != "CANVAS") return;
  mouseDown = true;
  let object = objectClicked(e);
  if (!(mouseTarget && object && object.position.equals(mouseTarget.position))) {
    hideMenus();
  }
  mouseTarget = object;
}

var contextMenu = document.getElementById("context-menu");
var purchaseBusinessMenu = document.getElementById("purchase-business");
function hideMenus() {
  contextMenu.style.display = "none";
  purchaseBusinessMenu.style.display = "none";
}

function onMouseUp(e) {
  mouseDown = false;
  let object = objectClicked(e);
  if (mouseTarget && object && object.position.equals(mouseTarget.position) && object.onclick) {
    object.onclick(e.pageX, e.pageY);
  }
}

function objectClicked(e) {
  var raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1), camera);
  var collisions = raycaster.intersectObjects(businesses.getClickables());
  if (collisions.length > 0 && collisions[0].object.onclick) {
    return collisions[0].object;
  }
}

export { start, load, showHint, hideHint, updateMoney };
