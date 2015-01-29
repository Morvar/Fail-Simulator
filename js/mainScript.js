
//Global variables
var moveSpeed = 200,
    bulletMoveSpeed = moveSpeed * 2;
    lookSpeed = 0.1, 
    unitSize = 200, 
    wallHeight = 100,
    mouse = {x: 0, y: 0};
var width = window.innerWidth, height = window.innerHeight, aspect = width/height;
var scene, units, camera, controls, renderer, clock, projector, animationRun = true, hp = 100;

var map =[//0  1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
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

//_________________________________________________

//initialize, run when document is ready
//$(selector).action()
$(document).ready(function(){
    //add a start game click text
	$('body').append('<div id="startGame">Start Game</div>');
    //on element with id startGame add css properties width,height
    //attach event handler event type 'click'
    //when 'click', execute the function(e)
	$('#startGame').css({width: width, height: height}).one('click', function(e){
        //prevent the default action that takes browser to new url
        e.preventDefault(); //------------ CSS in separate file?????----------
        init();
        animate();
    }
    );
});

//_________________________________________________

function init(){
    
    clock = new THREE.Clock(); //calculate time between rendering frames
	projector = new THREE.Projector(); //helper class for projecting. makes 2D into 3D rays
    //scene setup - creating the world. the scene holds the other objects
    scene = new THREE.Scene();
    //add fog to the scene
    scene.fog = new THREE.FogExp2(0xCCFFFF, 0.001); // (hex, density)
    
    //create perspective camera(FOV field of view [degrees], 
    //aspect ratio[width/height of element],near, far [clipping plane. 
    //no rendering nearer than near or beyond far. improves performance])
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.y = unitSize * 0.5; //set camera height position
    scene.add(camera);

    //FirstPersonControls: move camera with mouse, player using WASD/arrow keys
    //takes the camera object as argument
	controls = new THREE.FirstPersonControls(camera);
    controls.lookSpeed = lookSpeed; //player look around speed (mouse)
    controls.lookVertical = false; //player can't look up/down (prevents flying)
	controls.moveSpeed = moveSpeed; //player move around speed
	controls.noFly = true; //no using R/F keys for moving up/down
    
    sceneSetup(); //call function to set up the environment
    
    //create renderer. set render size to browser window size
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    
    //change background canvas color
    renderer.domElement.style.backgroundColor = '#85D6FF';
    //append the renderer as a child node to the body of the HTML document.
    //three.js creates a canvas inside body element for rendering the scene
    document.body.appendChild(renderer.domElement); //add to document body
    
    //Attaches an event handler to the element 'document'
    //track position of cursor (event type,function to execute,
    //,true/false:capturing/bubbling = 'mousemove' event will trigger onDocumentMouseMove 
    // on innermost element and bubble up to parents)
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    
    //shooting
    $(document).click(function(e) {
        e.preventDefault;
        //shoot with left click (id 1) or left shift (id 16)
        //.which property indicates which key is pressed
        if (e.which === 1 || e.which === 16) {
            addBullet(); //-----------------------write this function
        }
    });
    
    //heads-up display??-----
    
}

    
function sceneSetup(){
    
    var units = mapWidth; 
        
    //create the floor of the map
    //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    //Mesh(geometry, material)
    //MeshLambertMaterial(properties of the 'parameters' object)
    var floor = new THREE.Mesh(
        new THREE.BoxGeometry(units * unitSize, 10, units * unitSize), 
        new THREE.MeshLambertMaterial({color: 0x00ff00}));
    scene.add(floor);

    var cube = new THREE.BoxGeometry(unitSize, wallHeight, unitSize); 
    var wallMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
    
    //loop through map and place wallcubes
    for(i = 0; i < mapHeight; i++){
        for(j = 0; l = map[i].length; j < l; j++){
            //if the value of [i][j] in the 2d array 'map' is 1 (or higher), place wallcube
            if(map[i][j] > 0){
                var wallCube = new THREE.Mesh(cube, wallMaterial);
                wallCube.position.x = i * unitSize;
                wallCube.position.y = wallHeight/2;
                wallCube.position.z = j * unitSize;
                scene.add(wallCube);
            }
        }
    }
    
    //light
    var ambLight = new THREE.AmbientLight(0x404040);
    /*
    //DirectionalLight(hex, intensity)
    var direcLight = new THREE.DirectionalLight(0x00ff00, 0.5);
    //set position of light source
	direcLight.position.set(1, 1, 1);
	scene.add(direcLight);
    */
}

//call render() repeatedly every time browser can render new frame
function animate(){
    if(animationRun){
        //works asynchronically
        //when browser is ready to render new frame, call (animate)
        requestAnimationFrame(animate);
    }
    render();
}

//the rendering function
function render(){
    
    var delta = clock.getDelta(); //returns time since last time called
    var bulletspeed = bulletMoveSpeed * delta;
    controls.update(delta); //moves camera --------??
    
    //update the bullets array------------??
    //start counting from the last element so old bullets can be removed
    for (i = bullets.length-1; i >= 0; i--) { //var i?--------------??
        var bullet = bullets[i], //the current bullet being examined
            pos = bullet.position, //the position of the bullet x, y, z
            dir = bullet.ray.direction, //the direction of the bullet
            hit = false; //has the bullet hit anything?
        
        //bullet collides with wall
        if (checkWallCollision(pos)) { //if bullet collides with wall ----- write checkwallcol
            bullets.splice(i, 1); //remove 1 bullet from bullets array
            scene.remove(bullet); //remove the bullet from scene
            continue; //if bullet has hit wall, skip the rest of this iteration
        }
        
        //bullet collides with player             owner---------------???
        if (dist(pos.x, pos.z, camera.position.x, camera.position.z) < 50 && bullet.owner != camera){
            hp -= 5; //lose hp
            if (hp < 0){ hp = 0;} //set hp to 0 if below 0
            bullets.splice(i, 1); //remove 1 bullet from bullets array
            scene.remove(bullet); //remove the bullet from scene
            hit = true; //-------?
        }
        
        //if bullet hasn't collided, continue moving
        if (!hit){
            bullet.translateX(bulletSpeed * dir.x); //move along x axis
            bullet.translateZ(bulletSpeed * dir.z); //move along z axis
        }
        
        renderer.render(scene, camera); //repaints everything
    }
    
    
    //Game Over screen??
}

var bullets = [];

//calculate distance between objects
function dist(x1, z1, x2, z2){
    //pythagoras
    return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2);
}

