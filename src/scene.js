import { Scene, PlaneGeometry, MeshBasicMaterial, BoxGeometry, Mesh, LoopRepeat, DirectionalLight, HemisphereLight, DoubleSide, AnimationMixer, Color, LoopOnce} from 'three'

import {createTextMesh} from './utils'
import {colors} from './constants'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const models = require.context("../models");

var scene = new Scene();
scene.clickables = [];

scene.add(new HemisphereLight( 0xffffbb, 0x38761D, 0.75));
scene.add(new DirectionalLight(colors.sunLightColor));

let geometry = new PlaneGeometry(10000, 10000);
let material = new MeshBasicMaterial( {color: colors.groundGreen, side: DoubleSide} );
let mesh = new Mesh( geometry, material );
// mesh.position.copy(new Vector3(0, -5, -5));
mesh.rotateX(Math.PI/2);
scene.add(mesh);

scene.animate = function(delta) {
    animationMixers.forEach(mixer => {
        mixer.update(delta);
    });
}

var loader = new GLTFLoader();
var animationMixers = []
var money = 0;

var building = {}
loader.load(models("./building_bottom.glb"), (gltf) => {
    scene.add(gltf.scene);
    let mixer = new AnimationMixer(gltf.scene);
    let loadingAnim = mixer.clipAction(getAnimation(gltf, "loading.001"));
    loadingAnim.loop = LoopOnce;
    loadingAnim.clampWhenFinished = true;
    animationMixers.push(mixer);
    loader.load(models("./building_top.glb"), (gltf) => {
        scene.add(gltf.scene);
        gltf.scene.position.y += 2;
        building = {
            floors: [{
                loadingAnim: loadingAnim
            }],
            top: gltf.scene,
            moneyToBePickedUp: 0,
            updateClickable: function() {
                if (this.clickable) {
                    scene.remove(this.clickable)
                }
                let height = 2 + (this.floors.length-1) * 1.2;
                let geometry = new BoxGeometry( 4, height, 4 );
                this.clickable = new Mesh(geometry);
                this.clickable.position.y = height/2;
                this.clickable.material.visible = false;
    
                this.clickable.onclick = function() {
                    if (building.moneyToBePickedUp == -1) return;
                    if (building.moneyToBePickedUp > 0) {
                        money += building.moneyToBePickedUp;
                        document.getElementById("money").innerText = money + "$"
                    }
                    building.moneyToBePickedUp = -1;
                    building.floors.forEach((building) => building.loadingAnim.stop());
                    building.floors[building.floors.length-1].loadingAnim.play();
                }
    
                scene.add(this.clickable);
                scene.clickables = [this.clickable]
            },
            addFloor: function() {
                loader.load(models("./building_middle.glb"), (gltf) => {
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
                    animationMixers.push(mixer);
                });
            }
        }
        building.updateClickable();

        mixer.addEventListener('finished', () => {
            building.moneyToBePickedUp = 10 * (building.floors.length);
        });
    
        scene.upgradeBusiness = function() {
            building.addFloor();
        }
    })
})

function getAnimation(gltf, name){
    var result;
    gltf.animations.forEach((animation) => {
        if (animation.name===name) {
            result = animation
            return
        }
    })
    if (result == null) {
        console.error("animation: "+name+" cannot be found!")
    }
    return result
}

export default scene