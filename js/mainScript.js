//scene setup
var scene = new THREE.Scene();
var movespeed = 100, lookSpeed = 0.075;
var camera, controls, renderer;
//create renderer. set render size to browser window size
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//change background canvas color
renderer.domElement.style.backgroundColor = '#85D6FF';
//append the renderer as a child element to the body of the HTML document.
//three.js creates a canvas inside body element for rendering the scene
document.body.appendChild(renderer.domElement); //domElement???-----

//track position of cursor (event type, function to execute, true/false:capturing/bubbling)
document.addEventListener('mousemove', onDocumentMouseMove, false);

//the rendering function
function render(){
    requestAnimationFrame(render); 
    renderer.render(scene, camera);
} 
render();


function init(){
    //create perspective camera(FOV field of view [degrees], 
    //aspect ratio[width/height of element],near, far [clipping plane. 
    //no rendering nearer than near or beyond far. improves performance])
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = playerSize * 0.7; //set camera height
    scene.add(camera);

    //FirstPersonControls: Camera moves with mouse, player moves using WASD/arrow keys
    //takes object as argument
	controls = new THREE.FirstPersonControls(camera);
	controls.moveSpeed = moveSpeed; //player move around speed
	controls.lookSpeed = lookSpeed; //player look around speed (mouse)
	controls.lookVertical = false; //player can't look up/down (prevents flying)
	controls.noFly = true; //no using R/F for moving up/down
    
    sceneSetup(); //-----------
}
