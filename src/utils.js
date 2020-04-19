function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function toMoneyText(money) {
    return "$" + money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

export { toMoneyText, uuid, getAnimation}
