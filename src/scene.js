import { Scene, PlaneGeometry, MeshBasicMaterial, BoxGeometry, Mesh, PlaneBufferGeometry, DirectionalLight, HemisphereLight, DoubleSide, AnimationMixer, Color, LoopOnce} from 'three'

import {colors} from './constants'

var scene = new Scene();
scene.clickables = [];

scene.add(new HemisphereLight( 0xffffbb, 0x38761D, 0.75));
scene.add(new DirectionalLight(colors.sunLightColor));

let geometry = new PlaneGeometry(10000, 10000);
let material = new MeshBasicMaterial( {color: colors.groundGreen} );
let mesh = new Mesh( geometry, material );
// mesh.position.copy(new Vector3(0, -5, -5));
mesh.rotateX(-Math.PI/2);
scene.add(mesh);

scene.animate = function(delta) {
    this.animationMixers.forEach(mixer => {
        mixer.update(delta);
    });
}

scene.animationMixers = []
scene.clickables = []
scene.money = 1000;

export default scene