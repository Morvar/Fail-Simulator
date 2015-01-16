
//Global variables
var moveSpeed = 200, 
    lookSpeed = 0.1, 
    unitSize = 200, 
    wallheight = 100, 
    mouse = {x: 0, y: 0};
var width = window.innerWidth, height = window.innerHeight, aspect = width/height;
var scene, units, camera, controls, renderer, clock, projector;

var map =[//0  1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 1
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 2
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 4
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
           ], 
            mapWidth = map[0].length, mapHeight = map.length;

//the rendering function
function render(){

    //collision check, player location and stuff??
    
    //argument callback
    requestAnimationFrame(render); //-------
    renderer.render(scene, camera);
}
//render();

//_________________________________________________

function init(){
    
    clock = new THREE.Clock(); //calculate time between rendering frames
	projector = new THREE.Projector(); //helper class for projecting. makes 2D into 3D rays
    //scene setup - creating the world. the scene holds the other objects
    scene = new THREE.Scene();
    
    //create perspective camera(FOV field of view [degrees], 
    //aspect ratio[width/height of element],near, far [clipping plane. 
    //no rendering nearer than near or beyond far. improves performance])
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.y = unitSize * 0.7; //set camera height position
    scene.add(camera);

    //FirstPersonControls: move camera with mouse, player using WASD/arrow keys
    // takes the camera object as argument
	controls = new THREE.FirstPersonControls(camera);
    controls.lookSpeed = lookSpeed; //player look around speed (mouse)
    controls.lookVertical = false; //player can't look up/down (prevents flying)
	controls.moveSpeed = moveSpeed; //player move around speed
	controls.noFly = true; //no using R/F keys for moving up/down
    
    sceneSetup(); //----------- function to be created
    
    //create renderer. set render size to browser window size
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //change background canvas color
    renderer.domElement.style.backgroundColor = '#85D6FF';
    //append the renderer as a child node to the body of the HTML document.
    //three.js creates a canvas inside body element for rendering the scene
    document.body.appendChild(renderer.domElement); //domElement???-------
    
    //Attaches an event handler to the element 'document'
    //track position of cursor (event type,function to execute,
    //,true/false:capturing/bubbling = 'mousemove' event will trigger onDocumentMouseMove 
    // on innermost element and bubble up to parents)
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function sceneSetup(){
    
    var units = mapWidth;
        
    //create the floor of the map
    //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    var floor = new THREE.Mesh(
        new THREE.BoxGeometry(units * unitSize, 10, units * unitSize), 
        new THREE.MeshLambertMaterial({color: 0xEDCBA0}));
    scene.add(floor);

    var cube = new THREE.BoxGeometry(unitSize, wallHeight, unitSize); 
    var wallMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var wallCube = new THREE.Mesh(cube, wallMaterial);
    scene.add(wallCube);
    
    //light ??
}
