import {Vector3} from 'three'
import {addBusiness} from './business'

// these will be used to create the initial values of each business, and increase them
var pointers = {
  position: new Vector3(-3, 0, 0),
  profit: 10,
  productionRate: 1,
  upgradeCost: 10,
  managerCost: 100,
}
var businesses = {
  eggs: createBusiness('eggs'),
  waffles: createBusiness(),
  coffeeMugs: createBusiness(),
  soccerBalls: createBusiness(),
  topHats: createBusiness()
}

function createBusiness(type) {
  let business =  {
    position: pointers.position.clone(),
    profit: pointers.profit,
    productionRate: pointers.productionRate,
    upgradeCost: pointers.upgradeCost,
    managerCost: pointers.managerCost,
    hasManager: false
  }
  addBusiness(business, type);
  pointers.position.x += 7;
  pointers.profit *= 5;
  pointers.productionRate *= 0.5;
  pointers.upgradeCost *= 5;
  pointers.managerCost *= 5;
  return business;
}

businesses.getClickables = function() {
  let clickables = []
  Object.keys(businesses).forEach((key) => {
    let business = businesses[key]
    if (business.building && business.building.clickable) {
      clickables.push(business.building.clickable)
    }
  })
  return clickables
}

export default businesses