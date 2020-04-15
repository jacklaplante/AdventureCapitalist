import {Vector3} from 'three'
import {addBusiness} from './business'

// these will be used to create the initial values of each business, and increase them
var pointers = {
  position: new Vector3(),
  profit: 10,
  upgradeCost: 10
}
var businesses = {
  eggs: createBusiness(),
  waffles: createBusiness(),
  coffeeMugs: createBusiness(),
  soccerBalls: createBusiness(),
  topHats: createBusiness()
}

function createBusiness() {
  let business =  {
    position: pointers.position.clone(),
    profit:pointers.profit,
    upgradeCost: pointers.upgradeCost
  }
  addBusiness(business);
  pointers.position.x += 10;
  pointers.profit *= 5;
  pointers.upgradeCost *= 5;
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