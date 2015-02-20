
//Global variables
var moveSpeed = 500,
    bulletMoveSpeed = moveSpeed * 15;
    defaultLookSpeed = 3, currentLookSpeed = defaultLookSpeed, unitSize = 400, 
    wallHeight = unitSize,
    mouse = {x: 0, y: 0};
var width = window.innerWidth, 
    height = window.innerHeight, 
    aspect = width/height;
var scene, camera, controls, renderer, clock, projector, animationRun = false, paused = false, hp = 100, bulletDamage = 10, lastMouseMoveTime;

var bullets = [];

var map =[//0  1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
           [1, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 2
           [1, 0, 1, 0, 0, 0, 0, 0, 0, 1], // 3
           [1, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 4
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 5
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7
           [1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 9
           ], 
            mapWidth = map[0].length, mapHeight = map.length;
    
//Map colors:
var floorColor = {color: 0x164016},
    skyColor = '#85D6FF',
    bulletColor = {color: 0xCC99FF},
    wall1Color = {color: 0x333300},
    fogColor = 0x00AAFF;
//_________________________________________________

//initialize, run when document is ready
//$(selector).action()
$(document).ready(function(){
    //add a start game click text
	$('body').append('<div id="startGame">Click to start game</div>');
    //on element with id startGame add css properties width,height
    //attach event handler event type 'click'
    //when 'click', execute the function(e)
    $("#startGame").click(function(e){
        //prevent the default action that takes browser to new url
        e.preventDefault();
        $(this).fadeOut();
        init();
        animationRun = true;
        animate();
    });
    
	/*$('#startGame').css({width: width, height: height}).one('click', function(e){
        //prevent the default action that takes browser to new url
        e.preventDefault(); //CSS in separate file?????----------??
        $(this).fadeOut();
        init();
        animate();
    });*/
});

//_________________________________________________

function init(){
    
    clock = new THREE.Clock(); //calculate time between rendering frames
	projector = new THREE.Projector(); //helper class for projecting. makes 2D into 3D rays
    //scene setup - creating the world. the scene holds the other objects
    scene = new THREE.Scene();
    //add fog to the scene
    scene.fog = new THREE.FogExp2(fogColor, 0.001); //(color hex, density)
    
    //create perspective camera(FOV field of view [degrees], 
    //aspect ratio[width/height of element],near, far [clipping plane. 
    //no rendering nearer than near or beyond far. improves performance])
    camera = new THREE.PerspectiveCamera(60, aspect, 1, 15000);
    camera.position.y = unitSize * 0.5; //set camera height position
    camera.position.x = mapWidth/2; //-----?
    camera.position.z = mapHeight/2;
    scene.add(camera);

    //FirstPersonControls: move camera with mouse, player using WASD/arrow keys
    //takes the camera object as argument
	controls = new THREE.FirstPersonControls(camera);
    controls.currentLookSpeed = currentLookSpeed; //player look around speed (mouse)
    controls.lookVertical = false; //player can't look up/down (prevents flying)
	controls.movementSpeed = moveSpeed; //player move around speed
	controls.noFly = true; //no using R/F keys for moving up/down
    
    sceneSetup(); //call function to set up the environment
    
    //create renderer. set render size to browser window size
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    
    //change background canvas color
    renderer.domElement.style.backgroundColor = skyColor;
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
        if (animationRun && e.which === 1 || animationRun && e.which === 16) {
            addBullet(); hp -= 10; //-----------temporary way to die
        }
    });
    
    //heads-up display----------------------??
    $('body').append('<div id="hud"><p>HP: <span id="hp">100</span><br/>Kills: <span id="kills">0</span></p></div>');
    
}
//_________________________________________________
    
function sceneSetup(){
    
    var units = mapWidth;
        
    //create the floor of the map
    //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    //Mesh(geometry, material)
    //MeshLambertMaterial(properties of the 'parameters' object)
    var floor = new THREE.Mesh(
        new THREE.CubeGeometry(units * unitSize, 10, units * unitSize), 
        new THREE.MeshLambertMaterial(floorColor));
    //change floor coordinates
    //floor.position.x = units/2 * unitSize;
    //floor.position.z = units/2 * unitSize;
    scene.add(floor);

    var cube = new THREE.CubeGeometry(unitSize, wallHeight, unitSize); 
    var wallMaterial = new THREE.MeshLambertMaterial(wall1Color);
    
    //loop through map and place wallcubes
    for(i = 0; i < mapHeight; i++){
        for(j = 0, l = map[i].length; j < l; j++){
            //if the value of [i][j] in the 2d array 'map' is 1 (or higher), place wallcube
            if(map[i][j] > 0){
                var wallCube = new THREE.Mesh(cube, wallMaterial);
                //center map around 0,0 coords
                wallCube.position.x = (i - units/2) * unitSize;
                wallCube.position.y = wallHeight/2;
                wallCube.position.z = (j - units/2) * unitSize;
                scene.add(wallCube);
            }
        }
    }
    
    //light
    var ambLight = new THREE.AmbientLight(0x303030);
    scene.add(ambLight);

    //DirectionalLight(hex, intensity)
    var direcLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    var direcLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    //set position of light source
	direcLight1.position.set(0.5, 1, 0.5);
    direcLight2.position.set(-0.5, 1, -0.5);
	scene.add(direcLight1);
    scene.add(direcLight2);

    var direcLight3 = new THREE.DirectionalLight(0x006666, 0.2);
    direcLight3.position.set(0, 400, 0);
    scene.add(direcLight3);
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
    var bulletSpeed = bulletMoveSpeed * delta;
    controls.update(delta); //moves camera
    
    //update the bullets array with for loop
    //start counting from the last element so old bullets can be removed
    for(i = bullets.length-1; i >= 0; i--){
        var bullet = bullets[i], //the current bullet being examined
            pos = bullet.position, //the position of the bullet x, y, z
            dir = bullet.ray.direction, //the direction of the bullet
            hit = false; //has the bullet hit anything?
        
        //bullet collides with wall
        if (checkWallCollision(pos)){ //if bullet collides with wall-
            bullets.splice(i, 1); //remove 1 bullet from bullets array
            scene.remove(bullet); //remove the bullet from scene
            continue; //if bullet has hit wall, skip the rest of this iteration
        }
        
        //bullet collides with player
        //check owner - player (camera) can't get hit by own bullet
        if (dist(pos.x, pos.z, camera.position.x, camera.position.z) < 50 && bullet.owner != camera){
            hp -= bulletDamage; //lose hp
            if (hp < 0){ hp = 0;} //set hp to 0 if below 0
            bullets.splice(i, 1); //remove 1 bullet from bullets array
            scene.remove(bullet); //remove the bullet from scene
            hit = true; //(will this be needed?)
        }
        
        //if bullet hasn't collided, continue moving
        if (!hit){
            bullet.translateX(bulletSpeed * dir.x); //move along x axis
            bullet.translateZ(bulletSpeed * dir.z); //move along z axis
        }
    }
    
    //Get current time
    var dateNow2 = new Date();
    var currentTime = dateNow2.getTime();
    //compare to last time mousemove was triggered
    //if mouse has been inactive long enough, stop spinning camera
    if(currentTime - lastMouseMoveTime > 1000){
        console.log("yup");
        currentLookSpeed = 0;
    }
    //reset lastMouseMoveTime
    lastMouseMoveTime = 0;
    
    //repaint everything
    renderer.render(scene, camera);
    

    //Fade in Game Over screen
    if(hp <= 0){
        animationRun = false;
        $(renderer.domElement).fadeOut(); //fade out renderer
        $('#hud').fadeOut(); //fade out HUD
        $('#startGame').fadeIn();
        $('#startGame').html('Return to Main Menu'); //change html text
        //attach event handler event type 'click'
        //when 'click', execute the function()
        //reload the page by setting url to same url?
        $('#startGame').one('click', function(){location = location;});
    }
}

//_____________________________________________________________

//calculate distance between objects
function dist(x1, z1, x2, z2){
    //pythagoras
    return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((z2-z1), 2));
}
                     
//find out which map sector object is in
function retrieveMapSector(object){
    //
    var x = //Math.floor(object.x / unitSize);
            Math.floor((object.x + unitSize / 2) / unitSize + mapWidth / 2);
    var z = //Math.floor(object.x / unitSize);
            Math.floor((object.z + unitSize / 2) / unitSize + mapWidth / 2);
    return {x: x, z: z};
}

//check if object has collided with a wall
function checkWallCollision(object){
    //get the map sector the object is in
    var objSec = retrieveMapSector(object);
    //return true if there is a wall there on map (>0) 
    // or bullet position is undefined, otherwise false
    //Still not working -----------------------------??
    if(map[objSec.x][objSec.z] > 0 || objSec.x === undefined || map[objSec.x][objSec.z] === undefined || object === undefined){
        return true;
    }
    else return false;
}

var bulletMaterial = new THREE.MeshBasicMaterial(bulletColor);
var bulletGeometry = new THREE.SphereGeometry(3, 5, 5);

//_________________________________________________
function addBullet(object){ //the object is the one shooting
    if(object === undefined){ //fix camera undefined bug
        object = camera;
    }
    //create the new bullet
    var newBullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    //set new bullets position to position of shooter
    newBullet.position.set(object.position.x, object.position.y * 0.8,
                        object.position.z);
    //if the object shooting is a camera, shoot the bullet in the cursors direction
    if (object instanceof THREE.Camera) {
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        //translate vector from 2D to 3D
        projector.unprojectVector(vector, object);
        //create new bullet as a ray starting at shooter's position
        //(position of camera, direction to shoot)
        newBullet.ray = new THREE.Ray(
            object.position,
            vector.subSelf(object.position).normalize()); //---------?
        console.log("Player fired a bullet");
    }
    
    else {
        var vector = camera.position.clone();
        newBullet.ray = new THREE.Ray(
            object.position,
            vector.subSelf(object.position).normalize()); //---------?
    }
    
    newBullet.owner = object; //give the bullet owner property (who fired it)
    bullets.push(newBullet); //add the new bullet to bullets array
    scene.add(newBullet); //add the new bullet to scene
    //return newBullet;
}

//handle mouse move
function onDocumentMouseMove(e){
    //prevent mouse default actions from firing (i.e. trackballcontrols)
    e.preventDefault();
    //clientX returns mouse x coord
    //(number between 0&1)*2 = number between 0&2. between 0&2-1 = between -1&1
    //make 0,0 coord in lower right corner
    mouse.x = (e.clientX / width) * 2 - 1;
    mouse.y = - (e.clientY / height) * 2 + 1;
    var dateNow1 = new Date();
    lastMouseMoveTime = dateNow1.getTime();
    currentLookSpeed = defaultLookSpeed;
}


//handle key press (pause)
function keyDown(e){
    //prevent scrolling
    e.preventDefault();
    //space key down
    if(e.keyCode == 32){
        if(animationRun){
        animationRun = false;
        paused = true; //---------declare global!
        console.log("Space was pressed, game is paused");
        }
        else if(animationRun == false && paused == true){
        animationRun = true;
        paused = false;
        animate();
        console.log("Space was pressed, game is running");
        }
    }
}


//resize window
$(window).resize(function(){
    //set global variables width,height to window size values
    width = window.innerWidth;
    height = window.innerHeight;
    aspect = width / height;
    if(camera){
        camera.aspect = aspect;
        //update camera matrix with the new values
        camera.updateProjectionMatrix();
    }
    if(renderer){
        //give renderer the new size
        renderer.setSize(width, height);
    }
});

//when browser window is in focus, do not freeze controls.
$(window).focus(function(){
    if(controls){controls.freeze = false;} //freeze,enabled?
});
//when browser window is out of focus (blurred), no moving around.
$(window).blur(function(){
    if(controls){controls.freeze = true;}
});
