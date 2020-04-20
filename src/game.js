import { Clock, Raycaster, Vector2, Vector3 } from "three";
import scene from "./scene";
import camera from "./camera";
import { renderer } from "./renderer";
import { toMoneyText } from "./utils";
import businesses from "./businesses/businesses";

const clock = new Clock();

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

function start() {
  updateMoney(global.player.money);
  document.getElementById("splash").remove();

  if (global.player.new) {
    showHint("Click on the egg to start an egg business!");
  }
  if (global.player.businessData) {
    businesses.loadBusinessData(global.player.businessData);
  }

  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("wheel", updateCamera);
}

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

var purchaseBusinessMenu = document.getElementById("purchase-business");
function hideMenus() {
  contextMenu.menu.style.display = "none";
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

const contextMenu = {
  menu: document.getElementById("context-menu"),
  upgrade: document.getElementById("upgrade-button"),
  upgradeCost: document.getElementById("upgrade-button").querySelector(".cost"),
  manager: document.getElementById("manager-button"),
  managerCost: document.getElementById("manager-button").querySelector(".cost"),
  businessInfo: {
    info: document.getElementById("business-info").querySelector(".info"),
    profit: document.getElementById("business-info").querySelector(".cost"),
  },
};

const hint = {
  element: document.getElementById("hint"),
  message: document.getElementById("hint").querySelector(".message"),
  close: document.getElementById("hint").querySelector(".close"),
};
hint.close.onclick = (_) => hideHint();

export { start, load, showHint, hideHint, updateMoney, contextMenu };
