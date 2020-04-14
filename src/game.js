import { Clock, Raycaster, Vector2, Vector3 } from 'three'
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
    document.addEventListener('wheel', updateCamera);
    document.getElementById("upgrade-button").onclick = (() => {
        scene.upgradeBusiness();
    })
}

function updateCamera() {
    let dist = -event.deltaY * 0.005
    let dir = new Vector3();
    camera.getWorldDirection(dir);
    let nextPos = camera.position.clone().add(dir.normalize().multiplyScalar(dist))
    camera.updatePosition(nextPos)
}

function onMouseMove(e) {
    if (mouseDown) {
        let scalar = 0.001 * camera.position.length()
        let dir = new Vector3(-e.movementX*scalar, e.movementY*scalar, 0)
        let nextPos = camera.localToWorld(dir)
        camera.updatePosition(nextPos)
    }
}

var mouseDown = false;
var mouseTarget;
function onMouseDown(e) {
    mouseDown = true;
    mouseTarget = objectClicked(e);
}

function onMouseUp(e) {
    mouseDown = false;
    let object = objectClicked(e);
    if (mouseTarget && object && object.position.equals(mouseTarget.position) && object.onclick) {
        object.onclick();
    }
}

function objectClicked(e) {
    var raycaster = new Raycaster();
    raycaster.setFromCamera(new Vector2(( e.clientX / window.innerWidth ) * 2 - 1, - ( e.clientY / window.innerHeight ) * 2 + 1), camera);
    var collisions = raycaster.intersectObjects(scene.clickables);
    if (collisions.length > 0 && collisions[0].object.onclick) {
        return collisions[0].object;
    }
}

export {start}