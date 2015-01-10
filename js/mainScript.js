//scene setup
var scene = new THREE.Scene();
//create perspective camera(FOV field of view [degrees], 
//aspect ratio[width/height of element],near, far [clipping plane. 
//no rendering nearer than near or beyond far. improves performance])
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//create renderer. set render size to browser window size
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//append the renderer as a child element to the body of the HTML document.
//three.js creates a canvas inside body element for rendering the scene
document.body.appendChild(renderer.domElement); //domElement???----

//the rendering function
function render(){
    requestAnimationFrame(render); 
    renderer.render(scene, camera); 
} 
render();

scene.add(camera);