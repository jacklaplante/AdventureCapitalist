import {Vector3, AnimationMixer, LoopOnce, BoxGeometry, Mesh, PlaneBufferGeometry, MeshBasicMaterial} from 'three'
import scene from '../scene'
import {getAnimation} from '../utils'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

var loader = new GLTFLoader();
const models = require.context("../../models");

function addBusiness(business) {
  business.building = {}
  let building = business.building
  loader.load(models("./building_bottom.glb"), (gltf) => {
    gltf.scene.position.copy(business.position);
    scene.add(gltf.scene);
    let mixer = new AnimationMixer(gltf.scene);
    let loadingAnim = mixer.clipAction(getAnimation(gltf, "loading.001"));
    loadingAnim.loop = LoopOnce;
    loadingAnim.clampWhenFinished = true;
    scene.animationMixers.push(mixer);
    loader.load(models("./building_top.glb"), (gltf) => {
      gltf.scene.position.copy(business.position);
      scene.add(gltf.scene);
      gltf.scene.position.y += 2;
      building.floors = [{loadingAnim: loadingAnim}];
      building.top = gltf.scene
      building.moneyToBePickedUp = 0
      building.updateClickable = function() {
        if (this.clickable) {
          scene.remove(this.clickable) // make sure this gets called
        }
        let height = 2 + (this.floors.length-1) * 1.2;
        let geometry = new BoxGeometry( 4, height, 4 );
        let clickable = new Mesh(geometry);
        clickable.position.x = business.position.x;
        clickable.position.y = height/2;
        clickable.material.visible = false;

        clickable.onclick = function() {
          contextMenu.menu.style.display = "block";
          contextMenu.upgrade.innerText = "UPGRADE";
          contextMenu.upgrade.onclick = _ => {
            building.upgrade();
          }
          if (building.moneyToBePickedUp == -1) return;
          if (building.moneyToBePickedUp > 0) {
            addMoney(building.moneyToBePickedUp);
          }
          building.moneyToBePickedUp = -1;
          building.floors.forEach((building) => building.loadingAnim.stop());
          building.floors[building.floors.length-1].loadingAnim.play();
        }

        scene.add(clickable);
        building.clickable = clickable;
      }
      building.upgrade = function() {
        if ((scene.money - business.upgradeCost) <= 0) return;
        subtractMoney(business.upgradeCost);
        loader.load(models("./building_middle.glb"), (gltf) => {
          gltf.scene.position.copy(business.position);
          gltf.scene.position.y += (2 + (this.floors.length-1) * 1.2);
          building.top.position.y = gltf.scene.position.y + 1.2;
          scene.add(gltf.scene);
          let mixer = new AnimationMixer(gltf.scene);
          let loadingAnim = mixer.clipAction(getAnimation(gltf, "loading.001"))
          loadingAnim.clampWhenFinished = true;
          loadingAnim.loop = LoopOnce;

          this.floors.push({
            loadingAnim: loadingAnim
          });

          this.updateClickable();
          let index = this.floors.length - 1;
          mixer.addEventListener('finished', () => { // play the next floors animation in a chain
            this.floors[index-1].loadingAnim.reset().play()
          });
          scene.animationMixers.push(mixer);
        });
      }
      building.updateClickable();

      mixer.addEventListener('finished', () => {
          building.moneyToBePickedUp = business.profit * (building.floors.length);
      });

      let shadow = new Mesh(new PlaneBufferGeometry(5, 5), new MeshBasicMaterial({color:0x1c5c48}));
      shadow.rotateX(-Math.PI/2);
      shadow.position.set(business.position.x, 0.1,0)
      scene.add(shadow);
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
  upgrade: document.getElementById('upgrade-button')
}

export {addBusiness}