import { Clock, Raycaster, Vector2 } from 'three'
import scene from './scene'
import camera from './camera'
import { renderer } from './renderer'
import { getRandom } from './utils'
import { adjectives, nouns } from './constants'

var clock = new Clock();

window.addEventListener('resize', resize);



function animate() {
    requestAnimationFrame( animate );
    var delta = clock.getDelta();
    if (process.env.NODE_ENV == 'development') {
        document.getElementById("fps").innerHTML = Math.round(1/delta)
    }
    scene.animate(delta)
    renderer.render(scene, camera);
}

function resize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function start(playerNameInput) {
    if (playerNameInput.length > 0 && playerNameInput.length < 50) {
        global.playerName = playerNameInput
    } else {
        global.playerName = getRandom(adjectives) + ' ' + getRandom(nouns)
    }
    document.getElementById("splash").remove();
    document.body.appendChild(renderer.domElement)
    animate();

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.getElementById("upgrade-button").onclick = (() => {
        scene.upgradeBusiness();
    })
}

function onMouseMove(e) {
    if (mouseDown) {
        camera.pan(e.movementX, e.movementY);
    }
}

var mouseDown = false;
function onMouseDown(e) {
    mouseDown = true;
    var raycaster = new Raycaster();
    raycaster.setFromCamera(new Vector2(( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1), camera);
    var collisions = raycaster.intersectObjects(scene.clickables);
    if (collisions.length > 0 && collisions[0].object.onclick) {
        collisions[0].object.onclick();
    }
}

function onMouseUp() {
    mouseDown = false;
}

export {start}