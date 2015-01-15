//Global variables
var moveSpeed = 100, lookSpeed = 0.075;
var scene, camera, controls, renderer, unitSize, wallheight;

//the rendering function
function render(){

    //collision check, player location and stuff??
    
    //argument callback
    requestAnimationFrame(render); //-----
    renderer.render(scene, camera);
}
render();
//_________________________________________________

function init(){
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
    //create the floor of the map
    var floor = //??
    scene.add(floor);
    
    //
    //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    var cube = new THREE.BoxGeometry(unitSize, wallHeight, unitSize); 
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var wallCube = new THREE.Mesh(cube, material); 
    scene.add(wallCube);
    
    //light ??
}



