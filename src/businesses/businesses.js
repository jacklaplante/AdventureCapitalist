import { Vector3 } from "three";
import { addBusiness } from "./business";

// these will be used to create the initial values of each business, and increase them incrementally
var pointers = {
  position: new Vector3(-3, 0, 0),
  profit: 10,
  productionRate: 1,
  upgradeCost: 10,
  managerCost: 100,
  purchaseCost: 50,
  shadowSize: 2, // coincidentally the products get bigger as they get more expensive so I will use this to roughly scale the shadow size as well
};

const types = ["eggs", "waffles", "coffeeMugs", "soccerBalls", "topHats"];
const businesses = {};
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

export default businesses;
