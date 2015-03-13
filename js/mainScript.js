function startGame(){

    //Global variables
        var jumpSpeed = 500,
            moveSpeed = 0.0,
            bulletMoveSpeed = moveSpeed * 15,
            hp = 100, 
            bulletDamage = 10,
            mapGravity = 9.82,
            playerMass = 100.0,
            bulletMass = 3.0,
            unitSize = 100, 
            wallHeight = unitSize,
            floorHeight = 10,
            mouse = {x: 0, y: 0},
            width = window.innerWidth, 
            height = window.innerHeight, 
            aspect = width/height,
            animationRun = false, 
            paused = false, 
            scene, camera, controls, renderer, lastMouseMoveTime,

            bullets = [],
            mapObjects = [],

            map =  [//0  1  2  3  4  5  6  7  8  9
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
            mapWidth = map[0].length, 
            mapHeight = map.length,

            //Map colors:
            floorColor = {color: 0x164016},
            skyColor = '#85D6FF',
            bulletColor = {color: 0xCC99FF},
            wall1Color = {color: 0x333300},
            fogColor = 0x00AAFF,

            controlsEnabled = false,
            moveForward = false,
            moveBackward = false,
            moveLeft = false,
            moveRight = false,

            previousTime = performance.now(),
            playerVector = new THREE.Vector3(),

            blocker = document.getElementById('blocker'),
            startscreen = document.getElementById('startscreen');
        //_________________________________________________
            
        //check if users browser supports pointerlock
        var pointerLockFound = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        //if browser supports pointerlock
        if(pointerLockFound){
            var bodyElement = document.body;
            var pointerLockChange = function(event){
                //check if pointer lock was enabled -
                // - if document.pointerLockElement is equal to the element 
                // that pointer lock was requested for
                if(document.pointerLockElement === bodyElement || document.mozPointerLockElement === bodyElement || document.webkitPointerLockElement === bodyElement){
                    //if pointerlock was enabled, enable controls
                    controlsEnabled = true;
                    controls.enabled = true;
                    blocker.style.display = 'none';
                }

                //if pointerlock was not enabled, disable controls
                // and display the 'blocker' and 'startscreen'
                else{
                    controls.enabled = false;
                    blocker.style.display = '-webkit-box';
                    blocker.style.display = '-moz-box';
                    blocker.style.display = 'box';
                    startscreen.style.display = '';
                }
            }
            //if pointerlock error occurs, display startscreen
            var pointerLockError = function(event){
                startscreen.style.display = '';
            }

            //hook pointer lock state change events (firefox, chrome)
            document.addEventListener('pointerlockchange', pointerLockChange, false);
            document.addEventListener('mozpointerlockchange', pointerLockChange, false);
            document.addEventListener('webkitpointerlockchange', pointerLockChange, false);

            document.addEventListener('pointerlockerror', pointerLockError, false);
            document.addEventListener('mozpointerlockerror', pointerLockError, false);
            document.addEventListener('webkitpointerlockerror', pointerLockError, false);

            startscreen.addEventListener('click', function(event){
                startscreen.style.display = 'none';

                //pointer locking request for users browser (firefox, chrome)
                bodyElement.requestPointerLock = bodyElement.requestPointerLock || bodyElement.mozRequestPointerLock || bodyElement.webkitRequestPointerLock;

                if(/Firefox/i.test(navigator.userAgent)){
                    var fullscreenchange = function(event){
                        if(document.fullscreenElement === bodyElement || document.mozFullscreenElement === bodyElement || document.mozFullScreenElement === bodyElement){
                            document.removeEventListener( 'fullscreenchange', fullscreenchange );
                            document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                            bodyElement.requestPointerLock();
                        }
                    }
                    document.addEventListener('fullscreenchange', fullscreenchange, false);
                    document.addEventListener('mozfullscreenchange', fullscreenchange, false);

                    bodyElement.requestFullscreen = bodyElement.requestFullscreen || bodyElement.mozRequestFullscreen || bodyElement.mozRequestFullScreen || bodyElement.webkitRequestFullscreen;
                    bodyElement.requestFullscreen();
                }

            else{
                bodyElement.requestPointerLock();
            }
        }
        , false);}

        else {
            startscreen.innerHTML = 'your browser doesn\'t support the Pointer Lock API';
        }

        init();
        animationRun = true;
        animate();

    //___________________________________________________

    function init(){
        
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
            
        //get pointerlock controls
        controls = new THREE.PointerLockControls(camera);
        scene.add(controls.getObject());

        //onKeyDown & Up
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
                
        //create raycaster
        raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);
            
        //call function to set up the environment
        sceneSetup();

        //create renderer. set render size to browser window size
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
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
                addBullet(); hp -= 5; //-----------temporary way to die
            }
        });

        //heads-up display----------------------??
        $('body').append('<div id="hud"><p>HP: <span id="hp">100</span><br/>Kills: <span id="kills">0</span></p></div>');

    }
    //___________________________________________________

    function sceneSetup(){

        var units = mapWidth;

        //create the floor of the map
        //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
        //Mesh(geometry, material)
        //MeshLambertMaterial(properties of the 'parameters' object)
        var floor = new THREE.Mesh(
            new THREE.BoxGeometry(units * unitSize, floorHeight, units * unitSize), 
            new THREE.MeshLambertMaterial(floorColor));
        scene.add(floor);

        var cube = new THREE.BoxGeometry(unitSize, wallHeight, unitSize); 
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
                    mapObjects.push(wallCube);
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
    //___________________________________________________
    
    //animate calls render() repeatedly every time browser can render new frame
    function animate(){
        if(animationRun){
            //works asynchronically
            //when browser is ready to render new frame, call (animate)
            requestAnimationFrame(animate);
        }
        render();
    }
    //___________________________________________________

    //the rendering function
    function render(){

        if(controlsEnabled){
            raycaster.ray.origin.copy(controls.getObject().position);
            raycaster.ray.origin.y -= 10; //floorHeight-------??
            
            //check if player is on a map object
            //intersectObjects returns array of intersections
            var intersections = raycaster.intersectObjects(mapObjects);
            //if intersections were found, set isOnObject to true
            var isOnObject = intersections.length > 0;
            
            //get the time in milliseconds
            var time = performance.now();
            //get the time difference in seconds
            var delta = (time - previousTime)/1000;

            //prevent player from accelerating out of map
            playerVector.x -= playerVector.x * 10.0 * delta;
            playerVector.z -= playerVector.z * 10.0 * delta;

            //100.0 is players mass
            playerVector.y -= mapGravity * playerMass * delta;

            //move along x and z axis
            if(moveForward) playerVector.z -= 400.0 * delta;
            if(moveBackward) playerVector.z += 400.0 * delta;

            if(moveLeft) playerVector.x -= 400.0 * delta;
            if(moveRight) playerVector.x += 400.0 * delta;

            //make player landing on object possible
            if(isOnObject){
                playerVector.y = Math.max(0, playerVector.y);
                canJump = true;
            }

            //move player
            controls.getObject().translateX(playerVector.x * delta);
            controls.getObject().translateY(playerVector.y * delta);
            controls.getObject().translateZ(playerVector.z * delta);

            //keep player from moving down through the floor
            if(controls.getObject().position.y < floorHeight){
                playerVector.y = 0;
                controls.getObject().position.y = floorHeight;
                canJump = true;
            }
            previousTime = time;
        }

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
            
            var bulletVelocity = bulletMoveSpeed * delta;
            
            //if bullet hasn't collided, move bullet
            if (!hit){
                bullet.translateX(bulletVelocity * dir.x); //move along x axis
                bullet.translateZ(bulletVelocity * dir.z); //move along z axis
                bullet.translateY(bulletVelocity * dir.y); //move along y axis
                console.log("dir x: " + bullet.ray.direction.x + "dir y: " + bullet.ray.direction.y + "dir z: " + bullet.ray.direction.z);
            }
        }

        //repaint everything
        renderer.render(scene, camera);

        //Fade in Game Over screen
        if(hp <= 0){
            animationRun = false;
            $(renderer.domElement).fadeOut(); //fade out renderer
            $('#hud').fadeOut(); //fade out HUD
            $('#startGame').fadeIn();
            /*
            //ask browser to disable pointerlock
            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
            document.exitPointerLock();
            */
            $('#startGame').html('Return to Main Menu'); //change html text
            //attach event handler event type 'click'
            //when 'click', execute the function()
            //reload the page by setting url to same url
            $('#startGame').one('click', function(){location = location;});
        }
    }

    //___________________________________________________

    var bulletMaterial = new THREE.MeshBasicMaterial(bulletColor);
    var bulletGeometry = new THREE.SphereGeometry(3, 5, 5);

    function addBullet(object){ //the object is the shooter
        if(object === undefined){ //fix camera undefined bug
            object = camera;
        }
        
        //create the new bullet with the mesh and material
        var newBullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        //set new bullets position to position of shooter
        newBullet.position.set(object.position.x, object.position.y * 0.8,
                            object.position.z);
        
        //if the object shooting is a camera, shoot the bullet in the cursors direction
        if(object instanceof THREE.Camera){
            var vector = new THREE.Vector3(mouse.x, mouse.y, mouse.z); //---z??
        }
        else{
        var vector = camera.position.clone();
        }
            //translate vector from 2D to 3D
            vector.unproject(object);
            //create new bullet as a ray starting at shooter's position
            //(position of camera, direction to shoot)
            newBullet.ray = new THREE.Ray(
                object.position,
                vector.sub(object.position).normalize()); //---------?

        newBullet.objType = "bullet"; //give the bullet a name tag
        newBullet.owner = object; //give the bullet an owner property (who fired it)
        console.log("Player fired a " + newBullet.objType);
        bullets.push(newBullet); //add the new bullet to bullets array
        scene.add(newBullet); //add the new bullet to scene
    }
    //___________________________________________________

    //move while key is pressed(keyDown), stop moving when key not pressed(keyUp)
    //if space is pressed, jump if jumping is allowed (canJump)
    function onKeyDown(e){

        switch(e.keyCode){

            case 38: //up
            case 87: //w
                moveForward = true;
                break;

            case 37: //left
            case 65: //a
                moveLeft = true; break;

            case 40: //down
            case 83: //s
                moveBackward = true;
                break;

            case 39: //right
            case 68: //d
                moveRight = true;
                break;

            case 32: //space
                if(canJump) playerVector.y += jumpSpeed;
                canJump = false;
                break;
        }
    };

    var onKeyUp = function(e){

        switch(e.keyCode){

            case 38: //up
            case 87: //w
                moveForward = false;
                break;

            case 37: //left
            case 65: //a
                moveLeft = false;
                break;

            case 40: //down
            case 83: //s
                moveBackward = false;
                break;

            case 39: //right
            case 68: //d
                moveRight = false;
                break;
        }
    };

    /*
    //handle key press (pause)
    function keyDown(e){
        //prevent scrolling
        e.preventDefault();
        //space key down
        if(e.keyCode == 32){
            if(animationRun){
            animationRun = false;
            paused = true;
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
    */

    //___________________________________________________

    //handle window resizing
        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize(){
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
        }

    //calculate distance between objects
    function dist(x1, z1, x2, z2){
        //pythagoras
        return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((z2-z1), 2));
    }

    //find out which map sector object is in
    function retrieveMapSector(objPosition){
        //
        var x = //Math.floor(object.x / unitSize);
                Math.floor((objPosition.x + unitSize / 2) / unitSize + mapWidth / 2);
        var z = //Math.floor(object.x / unitSize);
                Math.floor((objPosition.z + unitSize / 2) / unitSize + mapWidth / 2);
        return {x: x, z: z};
    }

    //check if object has collided with a wall
    function checkWallCollision(objPosition){
        //get the map sector the object is in
        var objSec = retrieveMapSector(objPosition);
        //return true if there is a wall there on map (>0) 
        // or bullet position is undefined, otherwise false

        if(objSec.x === undefined){
            console.log("The objSec.x treated in checkWallCollision is undefined");
        }
        if(map[objSec.x]===undefined){
            console.log("The objSec.x treated in checkWallCollision is undefined. Bullet will be spliced");
            return true;
        }
        if(map[objSec.x][objSec.z] > 0 || objSec.x === undefined || map[objSec.x][objSec.z] === undefined || objPosition.x === undefined || objPosition.z === undefined){
            console.log("Wall collision for object position x: " + objPosition.x + " z: " + objPosition.z + "y: " + objPosition.y + " detected");
            return true;
        }
        else return false;
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

    }

    //when browser window is in focus, do not freeze controls.
    $(window).focus(function(){
        if(controls){controls.freeze = false;} //freeze,enabled?
    });
    //when browser window is out of focus (blurred), no moving around.
    $(window).blur(function(){
        if(controls){controls.freeze = true;}
    });
}