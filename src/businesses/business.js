import { Vector3, AnimationMixer, LoopOnce, BoxGeometry, Mesh, PlaneBufferGeometry, MeshBasicMaterial } from "three";
import scene from "../scene";
import { getAnimation, toMoneyText, postPlayerData } from "../utils";
import { showHint, hideHint, updateMoney, contextMenu } from "../game";
import loaders from "../loaders";

import shadowTextureFile from "../../shadow.png";
const models = require.context("../../models/business");

function addBusiness(business, type) {
  business.building = {
    floors: [],
    floorCount: 0,
    moneyToBePickedUp: -1,
  };
  let building = business.building;
  loadBuilding(business);
  building.updateClickable = function () {
    if (this.clickable) {
      scene.remove(this.clickable); // make sure this gets called
    }
    let clickable = loadClickable(business);
    clickable.onclick = function () {
      if (building.floorCount == 0) {
        if (global.player.new && type == "eggs") {
          showHint("Hit 'Start selling Eggs'!");
        }
        purchaseBusiness.menu.style.display = "inline-block";
        updatePurchaseMenu(business);
      } else {
        if (building.moneyToBePickedUp != -1) {
          building.pickUp();
        }
        contextMenu.menu.style.display = "inline-block";
        updateContextMenu(business);
      }
    };

    scene.add(clickable);
    building.clickable = clickable;
  };
  building.addBuilding = function () {
    scene.add(building.bottom);
    building.floorCount = 1;
    building.top.position.y += 2;
    scene.add(building.roof);
    building.moneyToBePickedUp = 0;
  };
  building.purchase = function () {
    if (!canAfford(business.purchaseCost)) return;
    subtractMoney(business.purchaseCost);
    purchaseBusiness.menu.style.display = "none";
    this.addBuilding();
    postPlayerData();
  };
  building.pickUp = function () {
    if (building.moneyToBePickedUp > 0) {
      building.pickUpAnim.reset().play();
      setTimeout(() => {
        scene.remove(building.productObj);
        building.manager.idleAnim.stop();
        building.manager.waveAnim.reset().play();
      }, 1000);
      addMoney(building.moneyToBePickedUp);
      business.lastPickupTime = Date.now();
      postPlayerData();
      if (global.player.new && business.type == "eggs") {
        if (global.player.money == 10) {
          showHint("You made $" + building.moneyToBePickedUp + "! Keep clicking to keep selling, or upgrade to make more " + business.type + "!");
        } else if (global.player.money >= 100) {
          showHint("You now have $" + global.player.money + "! Purchase a manager to automatically sell eggs!");
        }
      }
    }
    building.moneyToBePickedUp = -1;
    building.floors.forEach((building) => building.loadingAnim.stop());
    building.floors[building.floors.length - 1].loadingAnim.play();
  };
  building.upgrade = function () {
    if (!canAfford(business.upgradeCost)) return;
    hideHint();
    contextMenu.menu.style.display = "none";
    subtractMoney(business.upgradeCost);
    building.addFloor();
    postPlayerData();
  };
  building.addFloor = function () {
    let middle = building.middleGltf.scene.clone();
    middle.position.y += 2 + (this.floorCount - 1) * 1.2;
    building.roof.position.y = middle.position.y + 1.2;
    building.top.position.copy(building.roof.position);
    scene.add(middle);
    let mixer = new AnimationMixer(middle);
    let loadingAnim = mixer.clipAction(getAnimation(building.middleGltf, "loading.001"));
    loadingAnim.clampWhenFinished = true;
    loadingAnim.loop = LoopOnce;
    loadingAnim.timeScale = business.productionRate;

    this.floors.push({
      loadingAnim: loadingAnim,
    });
    this.floorCount += 1;

    for (let i = this.floors.length - 1; i >= 0; i--) {
      let floor = this.floors[i];
      if (i > 0) {
        let nextLoadingAnim = this.floors[i - 1].loadingAnim;
        let nextLoadingTime = nextLoadingAnim.time;
        if (nextLoadingTime > 0) {
          floor.loadingAnim.time = nextLoadingTime;
          if (nextLoadingTime < nextLoadingAnim.getClip().duration) {
            floor.loadingAnim.play();
          } else if (nextLoadingTime >= nextLoadingAnim.getClip().duration) {
            floor.loadingAnim.play().paused = true;
          }
          nextLoadingAnim.stop();
        }
      } else {
        let prevAnim = this.floors[1].loadingAnim;
        if (prevAnim.time >= prevAnim.getClip().duration) {
          floor.loadingAnim.play();
        }
      }
    }

    this.updateClickable();
    let index = this.floors.length - 1;
    mixer.addEventListener("finished", () => {
      // play the next floors animation in a chain
      this.floors[index - 1].loadingAnim.reset().play();
    });
    scene.animationMixers.push(mixer);
  };
  building.addManager = function () {
    business.hasManager = true;
    scene.add(this.manager);
  };
  building.buyManager = function () {
    if (!canAfford(business.managerCost)) return;
    global.player.new = false;
    hideHint();
    document.getElementById("context-menu").style.display = "none";
    subtractMoney(business.managerCost);
    if (building.moneyToBePickedUp > 0) {
      building.pickUp();
    }
    building.addManager();
  };
  building.updateClickable();

  loaders.gltf.load(getModelOrDefault("manager", type), (gltf) => {
    gltf.scene.position.copy(business.position);
    gltf.scene.position.x -= 2;
    gltf.scene.position.z += 2;
    let mixer = new AnimationMixer(gltf.scene);
    let idleAnim = mixer.clipAction(getAnimation(gltf, "Idle"));
    let waveAnim = mixer.clipAction(getAnimation(gltf, "Wave"));
    mixer.addEventListener("finished", () => {
      idleAnim.play();
    });
    waveAnim.loop = LoopOnce;
    idleAnim.timeScale = 0.5;
    idleAnim.play();
    scene.animationMixers.push(mixer);
    building.manager = gltf.scene;
    building.manager.idleAnim = idleAnim;
    building.manager.waveAnim = waveAnim;
  });

  building.updateClickable();
}

function loadBuilding(business) {
  loadProduct(business);
  loadBottom(business);
  loadMiddle(business);
  loadRoof(business);
}

function loadRoof(business) {
  let building = business.building;
  loaders.gltf.load(getModelOrDefault("building_top", business.type), (gltf) => {
    gltf.scene.position.copy(business.position);
    gltf.scene.position.y += 2;
    building.roof = gltf.scene;
  });
}

function loadMiddle(business) {
  let building = business.building;
  loaders.gltf.load(models("./building_middle.glb"), (gltf) => {
    gltf.scene.position.copy(business.position);
    building.middleGltf = gltf;
  });
}

function loadBottom(business) {
  let building = business.building;
  loaders.gltf.load(models("./building_bottom.glb"), (gltf) => {
    gltf.scene.position.copy(business.position);
    building.bottom = gltf.scene;
    let mixer = new AnimationMixer(gltf.scene);
    let shadow = new Mesh(new PlaneBufferGeometry(5, 5), new MeshBasicMaterial({ color: 0x1c5c48 }));
    shadow.rotateX(-Math.PI / 2);
    shadow.position.set(0, 0.075, 0);
    gltf.scene.add(shadow);
    let loadingAnim = mixer.clipAction(getAnimation(gltf, "loading.001"));
    loadingAnim.timeScale = business.productionRate;
    building.pickUpAnim = mixer.clipAction(getAnimation(gltf, "truck_pickup"));
    building.pickUpAnim.loop = LoopOnce;
    loadingAnim.loop = LoopOnce;
    loadingAnim.clampWhenFinished = true;
    scene.animationMixers.push(mixer);
    building.floors[0] = { loadingAnim: loadingAnim };
    mixer.addEventListener("finished", (e) => {
      if (e.action.getClip().name == "loading.001") {
        building.moneyToBePickedUp = business.profit * building.floorCount;
        scene.add(building.productObj);
        if (business.hasManager) {
          building.pickUp();
        }
        if (global.player.new && business.type == "eggs" && global.player.money == 0) {
          showHint("Click the egg to sell it!");
        }
      }
    });
  });
}

function loadClickable(business) {
  let building = business.building;
  let height = 5 + (building.floorCount - 1) * 1.2;
  let geometry = new BoxGeometry(4, height, 5);
  let clickable = new Mesh(geometry);
  clickable.position.set(business.position.x, height / 2, 0.5);
  clickable.material.visible = false;
  return clickable;
}

function loadProduct(business) {
  let building = business.building;
  loaders.gltf.load(getModelOrDefault("product", business.type), (gltf) => {
    gltf.scene.position.copy(business.position);
    scene.add(gltf.scene);
    loaders.texture.load(shadowTextureFile, (shadowTexture) => {
      let size = business.shadowSize;
      let shadow = new Mesh(
        new PlaneBufferGeometry(size, size),
        new MeshBasicMaterial({
          map: shadowTexture,
          transparent: true,
          depthWrite: false,
        })
      );
      shadow.rotateX(-Math.PI / 2);
      gltf.scene.add(shadow);
      shadow.position.y += 0.8;
    });
    building.top = gltf.scene;
    let mixer = new AnimationMixer(gltf.scene);
    let anim = getAnimation(gltf, "rotate");
    let rotateAnim = mixer.clipAction(anim);
    rotateAnim.play();
    scene.animationMixers.push(mixer);
    building.productObj = gltf.scene.clone();
    building.productObj.position.copy(business.position.clone().setZ(3).setY(-0.5));
    building.productObj.scale.copy(new Vector3(0.65, 0.65, 0.65));
    mixer = new AnimationMixer(building.productObj);
    rotateAnim = mixer.clipAction(anim);
    rotateAnim.play();
    scene.animationMixers.push(mixer);
  });
}

function updatePurchaseMenu(business) {
  if (canAfford(business.purchaseCost)) {
    purchaseBusiness.menu.className = "enabled";
  } else {
    purchaseBusiness.menu.className = "disabled";
  }
  purchaseBusiness.message.innerText = "Start selling " + business.name + ": ";
  purchaseBusiness.cost.innerText = "-" + toMoneyText(business.purchaseCost);
  purchaseBusiness.menu.onclick = (_) => {
    if (global.player.new && business.type == "eggs") {
      showHint("Congrats! Click the building to produce an egg!");
    }
    business.building.purchase();
  };
}

function updateContextMenu(business) {
  if (canAfford(business.upgradeCost)) {
    contextMenu.upgrade.className = "enabled";
  } else {
    contextMenu.upgrade.className = "disabled";
  }
  contextMenu.upgradeCost.innerText = "-" + toMoneyText(business.upgradeCost);
  contextMenu.upgrade.onclick = (_) => {
    business.building.upgrade();
  };
  if (canAfford(business.managerCost) && !business.hasManager) {
    contextMenu.manager.className = "enabled";
  } else {
    contextMenu.manager.className = "disabled";
  }
  contextMenu.managerCost.innerText = "-" + toMoneyText(business.managerCost);
  contextMenu.manager.onclick = (_) => {
    business.building.buyManager();
  };
  contextMenu.businessInfo.info.innerText = business.name + ": " + business.profit + "x" + business.building.floorCount + " = ";
  contextMenu.businessInfo.profit.innerText = "+" + toMoneyText(business.profit * business.building.floorCount);
}

function getModelOrDefault(model, type) {
  try {
    return models("./" + model + "_" + type + ".glb");
  } catch (e) {
    return models("./" + model + ".glb");
  }
}

function subtractMoney(money) {
  global.player.money -= money;
  updateMoney();
}

function addMoney(money) {
  global.player.money += money;
  updateMoney();
}

function canAfford(cost) {
  return global.player.money - cost >= 0;
}

const purchaseBusiness = {
  menu: document.getElementById("purchase-business"),
  message: document.getElementById("purchase-business").querySelector(".message"),
  cost: document.getElementById("purchase-business").querySelector(".cost"),
};

export { addBusiness };
