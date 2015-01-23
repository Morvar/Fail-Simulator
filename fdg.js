function init() {
clock = new t.Clock(); // Used in render() for controls.update()
projector = new t.Projector(); // Used in bullet projection
scene = new t.Scene(); // Holds all objects in the canvas
scene.fog = new t.FogExp2(0xD6F1FF, 0.0005); // color, density
// Set up camera
cam = new t.PerspectiveCamera(60, ASPECT, 1, 10000); // FOV, aspect, near, far
cam.position.y = UNITSIZE * .2;
scene.add(cam);
// Camera moves with mouse, flies around with WASD/arrow keys
controls = new t.FirstPersonControls(cam);
controls.movementSpeed = MOVESPEED;
controls.lookSpeed = LOOKSPEED;
controls.lookVertical = false; // Temporary solution; play on flat surfaces only
controls.noFly = true;
// World objects
setupScene();
// Artificial Intelligence
setupAI();
// Handle drawing as WebGL (faster than Canvas but less supported)
renderer = new t.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
// Add the canvas to the document
renderer.domElement.style.backgroundColor = '#D6F1FF'; // easier to see
document.body.appendChild(renderer.domElement);
// Track mouse position so we know where to shoot
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    
    
    
// Shoot on click
$(document).click(function(e) {
e.preventDefault;
if (e.which === 1) { // Left click only
createBullet();
}
});
    
    
// Display HUD
$('body').append('<canvas id="radar" width="200" height="200"></canvas>');
$('body').append('<div id="hud"><p>Health: <span id="health">100</span><br />Score: <span id="score">0</span></p></div>');
$('body').append('<div id="credits"><p>Created by <a href="http://www.isaacsukin.com/">Isaac Sukin</a> using <a href="http://mrdoob.github.com/three.js/">Three.js</a><br />WASD to move, mouse to look, click to shoot</p></div>');
// Set up "hurt" flash
$('body').append('<div id="hurt"></div>');
$('#hurt').css({width: WIDTH, height: HEIGHT,});
}



function render() {
var delta = clock.getDelta(), speed = delta * BULLETMOVESPEED;
var aispeed = delta * MOVESPEED;
controls.update(delta); // Move camera
    
// Rotate the health cube
healthcube.rotation.x += 0.004
healthcube.rotation.y += 0.008;
// Allow picking it up once per minute
if (Date.now() > lastHealthPickup + 60000) {
if (distance(cam.position.x, cam.position.z, healthcube.position.x, healthcube.position.z) < 15 && health != 100) {
health = Math.min(health + 50, 100);
$('#health').html(health);
lastHealthPickup = Date.now();
}
healthcube.material.wireframe = false;
}
else {
healthcube.material.wireframe = true;
}
    
// Update bullets. Walk backwards through the list so we can remove items.
for (var i = bullets.length-1; i >= 0; i--) {
var b = bullets[i], p = b.position, d = b.ray.direction;
if (checkWallCollision(p)) {
bullets.splice(i, 1);
scene.remove(b);
continue;
}
    
// Collide with AI
var hit = false;
for (var j = ai.length-1; j >= 0; j--) {
var a = ai[j];
var v = a.geometry.vertices[0];
var c = a.position;
var x = Math.abs(v.x), z = Math.abs(v.z);
//console.log(Math.round(p.x), Math.round(p.z), c.x, c.z, x, z);
if (p.x < c.x + x && p.x > c.x - x &&
p.z < c.z + z && p.z > c.z - z &&
b.owner != a) {
bullets.splice(i, 1);
scene.remove(b);
a.health -= PROJECTILEDAMAGE;
var color = a.material.color, percent = a.health / 100;
a.material.color.setRGB(
percent * color.r,
percent * color.g,
percent * color.b
);
hit = true;
break;
}
}
    
// Bullet hits player
if (distance(p.x, p.z, cam.position.x, cam.position.z) < 25 && b.owner != cam) {
$('#hurt').fadeIn(75);
health -= 10;
if (health < 0) health = 0;
val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
$('#health').html(val);
bullets.splice(i, 1);
scene.remove(b);
$('#hurt').fadeOut(350);
}
if (!hit) {
b.translateX(speed * d.x);
//bullets[i].translateY(speed * bullets[i].direction.y);
b.translateZ(speed * d.z);
}
}
    
// Update AI.
for (var i = ai.length-1; i >= 0; i--) {
var a = ai[i];
if (a.health <= 0) {
ai.splice(i, 1);
scene.remove(a);
kills++;
$('#score').html(kills * 100);
addAI();
}
    
// Move AI
var r = Math.random();
if (r > 0.995) {
a.lastRandomX = Math.random() * 2 - 1;
a.lastRandomZ = Math.random() * 2 - 1;
}
a.translateX(aispeed * a.lastRandomX);
a.translateZ(aispeed * a.lastRandomZ);
var c = getMapSector(a.position);
if (c.x < 0 || c.x >= mapW || c.y < 0 || c.y >= mapH || checkWallCollision(a.position)) {
a.translateX(-2 * aispeed * a.lastRandomX);
a.translateZ(-2 * aispeed * a.lastRandomZ);
a.lastRandomX = Math.random() * 2 - 1;
a.lastRandomZ = Math.random() * 2 - 1;
}
if (c.x < -1 || c.x > mapW || c.z < -1 || c.z > mapH) {
ai.splice(i, 1);
scene.remove(a);
addAI();
}
    
/*
var c = getMapSector(a.position);
if (a.pathPos == a.path.length-1) {
console.log('finding new path for '+c.x+','+c.z);
a.pathPos = 1;
a.path = getAIpath(a);
}
var dest = a.path[a.pathPos], proportion = (c.z-dest[1])/(c.x-dest[0]);
a.translateX(aispeed * proportion);
a.translateZ(aispeed * 1-proportion);
console.log(c.x, c.z, dest[0], dest[1]);
if (c.x == dest[0] && c.z == dest[1]) {
console.log(c.x+','+c.z+' reached destination');
a.PathPos++;
}
*/
var cc = getMapSector(cam.position);
if (Date.now() > a.lastShot + 750 && distance(c.x, c.z, cc.x, cc.z) < 2) {
createBullet(a);
a.lastShot = Date.now();
}
}
    
renderer.render(scene, cam); // Repaint
    
// Death
if (health <= 0) {
runAnim = false;
$(renderer.domElement).fadeOut();
$('#radar, #hud, #credits').fadeOut();
$('#intro').fadeIn();
$('#intro').html('Ouch! Click to restart...');
$('#intro').one('click', function() {
location = location;
/*
$(renderer.domElement).fadeIn();
$('#radar, #hud, #credits').fadeIn();
$(this).fadeOut();
runAnim = true;
animate();
health = 100;
$('#health').html(health);
kills--;
if (kills <= 0) kills = 0;
$('#score').html(kills * 100);
cam.translateX(-cam.position.x);
cam.translateZ(-cam.position.z);
*/
});
}
}