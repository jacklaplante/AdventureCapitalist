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

const request = new XMLHttpRequest();
function postPlayerData() {
  request.open("POST", "https://k5qf9mar6h.execute-api.us-east-1.amazonaws.com/test/user?userName=" + global.player.name);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(
    JSON.stringify({
      money: global.player.money,
      businesses: getBusinessData(),
    })
  );
}

function getBusinessData() {
  // only gets the information that needs to be saved to the database
  let businessData = {};
  Object.keys(businesses).forEach((key) => {
    let business = businesses[key];
    if (business.building) {
      businessData[key] = {
        floors: business.building.floorCount,
        hasManager: business.hasManager,
        lastPickupTime: business.lastPickupTime,
      };
    }
  });
  return JSON.stringify(businessData);
}

export { toMoneyText, getAnimation, postPlayerData };
