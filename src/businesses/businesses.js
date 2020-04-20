import { Vector3 } from "three";
import { addBusiness } from "./business";
import { getAnimation } from "../utils";
import { updateMoney } from "../game";

// these will be used to create the initial values of each business, and increase them incrementally
var pointers = {
  position: new Vector3(-3, 0, 0),
  profit: 10,
  productionRate: 1,
  upgradeCost: 10,
  managerCost: 100,
  purchaseCost: 50,
  shadowSize: 2, // (HACK) coincidentally the products get bigger as they get more expensive so I will use this to roughly scale the shadow size as well
};

const types = ["eggs", "waffles", "coffeeMugs", "soccerBalls", "topHats"];
global.businesses = {};
const businesses = global.businesses;
types.forEach((type) => {
  businesses[type] = createBusiness(type);
});

function createBusiness(type) {
  let name = type.replace(/([A-Z])/g, " $1");
  name = name.charAt(0).toUpperCase() + name.slice(1);
  let business = {
    position: pointers.position.clone(),
    profit: pointers.profit,
    productionRate: pointers.productionRate,
    upgradeCost: pointers.upgradeCost,
    managerCost: pointers.managerCost,
    hasManager: false,
    type: type,
    name: name,
    purchaseCost: pointers.purchaseCost,
    shadowSize: pointers.shadowSize,
  };
  addBusiness(business, type);
  pointers.position.x += 7;
  pointers.profit *= 5;
  pointers.productionRate *= 0.5;
  pointers.upgradeCost *= 5;
  pointers.managerCost *= 5;
  pointers.purchaseCost *= 5;
  pointers.shadowSize *= 1.2;
  return business;
}

businesses.getClickables = function () {
  let clickables = [];
  Object.keys(businesses).forEach((key) => {
    let business = businesses[key];
    if (business.building && business.building.clickable) {
      clickables.push(business.building.clickable);
    }
  });
  return clickables;
};

businesses.loadBusinessData = function (businessData) {
  Object.keys(businesses).forEach((key) => {
    let business = businesses[key];
    if (business.building && businessData && businessData[business.type] && businessData[business.type].floors > 0) {
      let building = business.building;
      let data = businessData[business.type];
      building.addBuilding();
      let floorCount = data.floors;
      // this is super hacky
      let bottomLoadingDuration = (building.floors[0].loadingAnim.getClip().duration * 1) / business.productionRate;
      let middleLoadingDuration = (getAnimation(building.middleGltf, "loading.001").duration * 1) / business.productionRate;
      let productionTime = bottomLoadingDuration + middleLoadingDuration * (floorCount - 1);
      if (floorCount > 1) {
        for (let i = 1; i < floorCount; i++) {
          building.addFloor();
        }
      }
      if (data.hasManager) {
        building.addManager();
      }
      if (data.lastPickupTime) {
        let secSinceLastPickup = (Date.now() - data.lastPickupTime) / 1000;
        let currentProgress;
        if (data.hasManager) {
          let production = secSinceLastPickup / productionTime;
          global.player.money += Math.floor(production) * business.profit * business.building.floorCount;
          updateMoney();
          currentProgress = productionTime * ((secSinceLastPickup / productionTime) % 1);
        } else {
          if (secSinceLastPickup > productionTime) {
            // show product
            currentProgress = productionTime;
          } else {
            currentProgress = secSinceLastPickup;
          }
        }
        for (let i = building.floorCount - 1; i >= 0; i--) {
          if (currentProgress > 0) {
            let floor = building.floors[i];
            let loadingDuration = (floor.loadingAnim.getClip().duration * 1) / business.productionRate;
            if (currentProgress > loadingDuration) {
              floor.loadingAnim.time = floor.loadingAnim.getClip().duration;
              floor.loadingAnim.play().paused = true;
              currentProgress -= loadingDuration;
            } else {
              floor.loadingAnim.time = currentProgress * business.productionRate;
              floor.loadingAnim.play();
              currentProgress = 0;
            }
          }
        }
      }
    }
  });
};

export default businesses;
