import {Vector3, AnimationMixer, LoopOnce, BoxGeometry, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from 'three'
import scene from '../scene'
import {getAnimation} from '../utils'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

var loader = new GLTFLoader();
const models = require.context("../../models");

function addBusiness(business, type) {
  business.building = {}
  let building = business.building
  loader.load(models("./building_bottom.glb"), (gltf) => {
    gltf.scene.position.copy(business.position);
    scene.add(gltf.scene);
    let mixer = new AnimationMixer(gltf.scene);
    let loadingAnim = mixer.clipAction(getAnimation(gltf, "loading.001"));
    building.pickUpAnim = mixer.clipAction(getAnimation(gltf, "truck_pickup"));
    building.pickUpAnim.loop = LoopOnce;
    loadingAnim.loop = LoopOnce;
    loadingAnim.clampWhenFinished = true;
    scene.animationMixers.push(mixer);
    loader.load(models("./building_top.glb"), (gltf) => {
      gltf.scene.position.copy(business.position);
      scene.add(gltf.scene);
      gltf.scene.position.y += 2;
      building.floors = [{
        loadingAnim: loadingAnim,
        floorObj: gltf.scene
      }];
      building.top = gltf.scene
      building.moneyToBePickedUp = 0
      loader.load(models("./eggs.glb"), (g) => {
        gltf.scene.add(g.scene);
        let mixer = new AnimationMixer(g.scene);
        let anim = getAnimation(g, "rotate")
        let loadingAnim = mixer.clipAction(anim);
        loadingAnim.play();
        scene.animationMixers.push(mixer);
        building.productObj = g.scene.clone();
        building.productObj.position.copy(business.position.clone().setZ(3).setY(-0.5));
        building.productObj.scale.copy(new Vector3(0.65, 0.65, 0.65))
        mixer = new AnimationMixer(building.productObj);
        loadingAnim = mixer.clipAction(anim)
        loadingAnim.play()
        scene.animationMixers.push(mixer)
      })
      building.updateClickable = function() {
        if (this.clickable) {
          scene.remove(this.clickable) // make sure this gets called
        }
        let height = 3 + (this.floors.length-1) * 1.2;
        let geometry = new BoxGeometry(4, height, 5);
        let clickable = new Mesh(geometry);
        clickable.position.set(business.position.x, height/2, 0.5);
        clickable.material.visible = false;

        clickable.onclick = function() {
          contextMenu.menu.style.display = "block";
          contextMenu.upgrade.innerText = "UPGRADE";
          contextMenu.upgrade.onclick = _ => {
            building.upgrade();
          }
          contextMenu.manager.innerText = "BUY MANAGER";
          contextMenu.manager.onclick = _ => {
            building.buyManager();
          }
          if (building.moneyToBePickedUp == -1) return;
          building.pickUp()
        }

        scene.add(clickable);
        building.clickable = clickable;
      }
      building.pickUp = function() {
        if (building.moneyToBePickedUp > 0) {
          building.pickUpAnim.reset().play()
          setTimeout(() => {
            scene.remove(building.productObj)
            building.manager.idleAnim.stop()
            building.manager.waveAnim.reset().play()
          }, 1000);
          addMoney(building.moneyToBePickedUp);
        }
        building.moneyToBePickedUp = -1;
        building.floors.forEach((building) => building.loadingAnim.stop());
        building.floors[building.floors.length-1].loadingAnim.play();
      }
      building.upgrade = function() {
        if ((scene.money - business.upgradeCost) < 0) return;
        subtractMoney(business.upgradeCost);
        loader.load(models("./building_middle.glb"), (gltf) => {
          gltf.scene.position.copy(business.position);
          gltf.scene.position.y += 2;
          scene.add(gltf.scene);

          let mixer = new AnimationMixer(gltf.scene);
          let loadingAnim = mixer.clipAction(getAnimation(gltf, "loading.001"))
          loadingAnim.clampWhenFinished = true;
          loadingAnim.loop = LoopOnce;
          if (building.moneyToBePickedUp > 0) { // when the product is ready, make sure the new floor is green
            loadingAnim.play()
            loadingAnim.time = 2;
            loadingAnim.paused = true
          }

          let newFloor = {
            loadingAnim: loadingAnim,
            floorObj: gltf.scene,
            next: this.floors[0]
          }
          
          if (this.floors.length >= 2) {
            this.floors.splice(1, 0, newFloor)
            for (let i = 2; i < this.floors.length; i++) {
              let floor = this.floors[i];
              floor.next = this.floors[i-1]
              let floorObj = floor.floorObj;
              floorObj.position.copy(business.position)
              floorObj.position.y += (2 + (i-1) * 1.2);
            }
          } else {
            this.floors.push(newFloor);
          }

          this.updateClickable();
          building.top.position.y = (2 + (this.floors.length-1) * 1.2);
          mixer.addEventListener('finished', () => { // play the next floors animation in a chain
            newFloor.next.loadingAnim.reset().play()
          });
          scene.animationMixers.push(mixer);
        });
      }
      building.buyManager = function() {
        if ((scene.money - business.managerCost) < 0) return;
        subtractMoney(business.managerCost)
        business.hasManager = true;
        scene.add(this.manager)
      }
      building.updateClickable();

      mixer.addEventListener('finished', (e) => {
        if (e.action.getClip().name == "loading.001") {
          building.moneyToBePickedUp = business.profit * (building.floors.length);
          scene.add(building.productObj)
          if (business.hasManager) {
            building.pickUp()
          }
        }
      });

      let shadow = new Mesh(new PlaneBufferGeometry(5, 5), new MeshBasicMaterial({color:0x1c5c48}));
      shadow.rotateX(-Math.PI/2);
      shadow.position.set(business.position.x, 0.075,0)
      scene.add(shadow);
    })
    loader.load(models('./eggs_manager.glb'), (gltf) => {
      gltf.scene.position.copy(business.position);
      gltf.scene.position.x -= 2
      gltf.scene.position.z += 2
      let mixer = new AnimationMixer(gltf.scene);
      let idleAnim = mixer.clipAction(getAnimation(gltf, "Idle"));
      let waveAnim = mixer.clipAction(getAnimation(gltf, "Wave"));
      mixer.addEventListener('finished', () => {
        idleAnim.play();
      });
      waveAnim.loop = LoopOnce
      idleAnim.timeScale = 0.5;
      idleAnim.play();
      scene.animationMixers.push(mixer);
      building.manager = gltf.scene;
      building.manager.idleAnim = idleAnim;
      building.manager.waveAnim = waveAnim;
    })
  })
}

function subtractMoney(money) {
  scene.money -= money;
  updateMoney()
}

function addMoney(money) {
  scene.money += money;
  updateMoney()
}

function updateMoney() {
  document.getElementById("money").innerText = scene.money + "$"
}

var contextMenu = {
  menu: document.getElementById('context-menu'),
  upgrade: document.getElementById('upgrade-button'),
  manager: document.getElementById('manager-button')
}

export {addBusiness}