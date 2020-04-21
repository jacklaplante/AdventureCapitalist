# Adventure Capitalist

## The problem

I played the original Adventure Capitalist game and started to grasp the appeal but I found it didn't offer much visual feedback. The UI essentially looks the same wether you're starting the game or have been playing it for a while. I wanted to offer the player more visual gratification for growing and making money from businesses.

## The solution

I've had proir experience using [three.js](https://threejs.org/docs/), which is an open source javascript WebGL library, and I thought it would be cool to try and make this game in 3D. I decided to represent the businesses as buildings and their growth by adding floors to the buildings.
To represent the business's "production", I created an animation that essentially turns the building into a big loading bar. The loading bar goes downward towards the ground and when it completes the business's "product" will appear on the ground to represent a product that is ready to be sold. As the player builds their wealth they can hire a manager to sell the product as it appears. The selling of a product is represented by a truck that will appear and "pick up" the product.

## Focus

I primarily focussed on producing a visually satisfying and simple user experience.

## Architecture

This web app is very front-end heavy. All the game logic is taken care of in the client. I used webpack to package the client and add lazy loading. So the user can enter their user name and log in while the game's assets are being downloaded (see index.js).
It's hosted as a static site on AWS S3. It uses AWS API gateway as a proxy to read and write to a table in AWS DynamoDB. This is all meant to be serverless and cheap.

 ## TODOs

 I would like to represent the player's wealth in a more satisfying way, like a huge pile of gold behind the buildings.
 Saving the user's info in the browser cache would prevent the user from having to enter their username in every time.
 Add passwords.
 Make code more readable and organized with types and handle ansynchronous processes with async/await. `business.js` is hot mess.


# Play it now: 
http://adventure-capitalist.s3-website-us-east-1.amazonaws.com/