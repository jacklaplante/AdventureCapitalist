function toMoneyText(money) {
  return "$" + money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getAnimation(gltf, name) {
  var result;
  gltf.animations.forEach((animation) => {
    if (animation.name === name) {
      result = animation;
      return;
    }
  });
  if (result == null) {
    console.error("animation: " + name + " cannot be found!");
  }
  return result;
}

export { toMoneyText, getAnimation };
