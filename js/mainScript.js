function startGame(){

    //Global variables
        var jumpSpeed = 230,
            playerMoveSpeed = 400.0,
            playerBulletMoveSpeed = playerMoveSpeed * 0.5,
            mobBulletMoveSpeed = playerMoveSpeed * 0.1,
            mobMoveSpeed = playerMoveSpeed * 0.05,
            hp = 100,
            kills = 0,
            bulletDamage = 10,
            mobDamage = 20,
            mobRadius = 5,
            mobSpawnInterval = 5, //seconds
            mapGravity = 7.0,
            playerMass = 100.0,
            bulletMass = 3.0,
            unitSize = 20, 
            wallHeight = 5.0,
            cameraHeight = 0.25,
            floorHeight = 10.0,
            mouse = {x: 0, y: 0},
            width = window.innerWidth, 
            height = window.innerHeight, 
            aspect = width/height,
            animationRun = false, 
            canShoot = false, 
            scene, camera, controls, renderer, lastPlayerMove,

            bullets = [],
            mapObjects = [],
            mobs = [],
/*
            map =  [//0  1  2  3  4  5  6  7  8  9
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
*/
            map =  [//01  2  3  4  5  6  7  8  9  10 11 12 13 14 15  ---> X
                   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0  Z
                   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 1  ^
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 2  |
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 3  |
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 4
                   [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1], // 5
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 6
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 7
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 8
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 9
                   [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1], // 10
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 11
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 12
                   [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1], // 13
                   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 14
                   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 15
                   ], 

                
            mapWidth = map[0].length, //X
            mapHeight = map.length, //Z

            //Map colors:
            floorColor = {color: 0xCEF123},
            playerBulletColor = {color: 0x555555},
            mobBulletColor = {color: 0x994444},
            mobColor = {color: 0x55DD66},
            wall1Color = {color: 0x438776},
            fogColor = 0xFFAAFF//0x557788;//0x00AAFF,

            var floorMaterial = new THREE.MeshPhongMaterial(floorColor),
                wall1Material = new THREE.MeshPhongMaterial(wall1Color),
                ceilingMaterial = new THREE.MeshLambertMaterial(0xff0000),
                playerBulletMaterial = new THREE.MeshPhongMaterial(playerBulletColor);
                playerBulletMaterial.shininess = 10;
                mobBulletMaterial = new THREE.MeshPhongMaterial(mobBulletColor);
                mobBulletMaterial.shininess = 10;
                mobMaterial = new THREE.MeshPhongMaterial(mobColor);
            
                
            var controlsEnabled = false,
                moveForward = false,
                moveBackward = false,
                moveLeft = false,
                moveRight = false,
                canJump,

                previousTime = performance.now(),
                previousMobTime = performance.now(),
                playerVector = new THREE.Vector3(),

                blocker = document.getElementById('blocker'),
                startscreen = document.getElementById('startscreen'),
                gameoverscreen = document.getElementById('gameoverscreen');
                gameoverscreen.style.display = 'none';
                
            var hud = document.getElementById('hud');
                hud.style.display = 'none';
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
            
            gameoverscreen.addEventListener('click', function(event){
                location.reload();
                });
            
            
            //When user clicks on the startscreen, ask browser to enable pointerlock
            startscreen.addEventListener('click', function(event){
                startscreen.style.display = 'none';
                //show heads up display
                hud.style.display = '';
                
                //Make sure shooting is enabled after 1 sec.
                setTimeout(function(){canShoot = true; console.log("Shooting enabled.")}, 500);

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

        else{
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
        scene.fog = new THREE.FogExp2(fogColor, 0.005); //(color hex, density)

        //create perspective camera(FOV field of view [degrees], 
        //aspect ratio[width/height of element],near, far [clipping plane. 
        //no rendering nearer than near or beyond far. improves performance])
        camera = new THREE.PerspectiveCamera(60, aspect, 1, 10000);
        camera.position.y = unitSize * cameraHeight; //set camera height position
        camera.position.x = mapWidth/2;
        camera.position.z = mapHeight/2;
        scene.add(camera);
            
        //get pointerlock controls (for camera)
        controls = new THREE.PointerLockControls(camera);
        scene.add(controls.getObject());
                
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
                
                case 27: //escape (reload page)
                    location.reload();
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

        //add event listener for onKeyDown & Up
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
                
        //create raycaster (creates 3D perspective from 2D)
        // Raycaster(origin vector, direction vector)
        raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);
            
        //call function to set up the environment
        sceneSetup();

        //create renderer. set render size to browser window size
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(fogColor); //background/sky color
        renderer.setPixelRatio(window.devicePixelRatio);
        //append the renderer as a child node to the body of the HTML document.
        //three.js creates a canvas inside body element for rendering the scene
        document.body.appendChild(renderer.domElement); //add to document body
        
                
        //handle window resizing
        window.addEventListener('resize', onWindowResize, false);
        
        //Attaches an event handler to the element 'document'
        //track position of cursor (event type,function to execute,
        //,true/false:capturing/bubbling = 'mousemove' event will trigger onDocumentMouseMove 
        // on innermost element and bubble up to parents)
        document.addEventListener('mousemove', onDocumentMouseMove, false);

        //shooting
        $(document).click(function(e){
            e.preventDefault;
            //shoot with left click (id 1) or left shift (id 16)
            //.which property indicates which key is pressed
            if (animationRun && canShoot && e.which === 1 || animationRun && canShoot && e.which === 16){
                addBullet(controls);
            }
        });
    }
    //___________________________________________________

    function sceneSetup(){

        var units = mapWidth;
                
        //add light to scene
        var ambLight = new THREE.AmbientLight(0x303030);
        scene.add(ambLight);

        //DirectionalLight(hex, intensity)
        var direcLight1 = new THREE.DirectionalLight(0xffffff, 1.5);//0.5);
        var direcLight2 = new THREE.DirectionalLight(0xffffff, 1.5);//0.5);
        var direcLight3 = new THREE.DirectionalLight(0xffffff, 1);//0.2);
        //set position of light source
        direcLight1.position.set(mapWidth * unitSize/2, wallHeight * unitSize/2, mapHeight * unitSize/2);
        direcLight2.position.set(-mapWidth * unitSize/2, wallHeight * unitSize/2, -mapHeight * unitSize/2);
        direcLight3.position.set(0, wallHeight * unitSize, 0);
        scene.add(direcLight1);
        scene.add(direcLight2);
        scene.add(direcLight3);
        
        
        //add 3D objects to the map
                
        //BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
        //Mesh(geometry, material)
        //MeshLambertMaterial(properties of the 'parameters' object)
                
        //create the floor of the map
        var floor = new THREE.Mesh(
            new THREE.BoxGeometry(units * unitSize, floorHeight, units * unitSize), 
            floorMaterial);
        scene.add(floor);
        
        //create the ceiling/sky
        var ceiling = new THREE.Mesh(
            new THREE.BoxGeometry(units * unitSize, floorHeight, units * unitSize), 
            ceilingMaterial);
            ceiling.position.y = wallHeight * unitSize;
            console.log("adding ceiling at y: " + ceiling.position.y);
        scene.add(ceiling);
        
        //basic wall structure
        var cube = new THREE.BoxGeometry(unitSize, wallHeight * unitSize, unitSize); 

        //loop through map and place wallcubes
        for(i = 0; i < mapHeight; i++){
            for(j = 0, l = map[i].length; j < l; j++){
                
                //if the value of [i][j] in the 2d array 'map' 
                // is 1 (or higher), place wallcube
                if(map[i][j] > 0){
                    var wallCube = new THREE.Mesh(cube, wall1Material);
                    
                    //center map around 0,0 coords
                    wallCube.position.x = (i - units/2) * unitSize + unitSize / 2;
                    wallCube.position.y = wallHeight * unitSize/2;
                    wallCube.position.z = (j - units/2) * unitSize + unitSize / 2;
                    scene.add(wallCube);
                    mapObjects.push(wallCube);
                }
            }
        }
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
        
        //handle player moving around
        if(controlsEnabled){
            raycaster.ray.origin.copy(controls.getObject().position);
            raycaster.ray.origin.y -= 10; //floorHeight--------------??
            
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

            //player is affected by gravity
            playerVector.y -= mapGravity * playerMass * delta;

            //calculate player movement along x and z axis
            if(moveForward) playerVector.z -= playerMoveSpeed * delta;
            if(moveBackward) playerVector.z += playerMoveSpeed * delta;

            if(moveLeft) playerVector.x -= playerMoveSpeed * delta;
            if(moveRight) playerVector.x += playerMoveSpeed * delta;

            //make player landing on object possible
            if(isOnObject){
                playerVector.y = Math.max(0, playerVector.y);
                canJump = true;
            }
            
            //...attempt to fix player wall collision:
            // if player is not in an occupied map sector
            if(!checkWallCollision(controls.getObject().position)){
                // move player
                controls.getObject().translateX(playerVector.x * delta);
                controls.getObject().translateY(playerVector.y * delta);
                controls.getObject().translateZ(playerVector.z * delta);
                // and store the last player move
                lastPlayerMove = playerVector;
            }
            //if player enters an occupied map sector
            if(checkWallCollision(controls.getObject().position)){
                console.log("Player entered an occupied map sector");
                // undo the last player move
                controls.getObject().translateX(-lastPlayerMove.x * delta);
                controls.getObject().translateY(-lastPlayerMove.y * delta);
                controls.getObject().translateZ(-lastPlayerMove.z * delta);
            }
            
            //keep player from moving down through the floor
            if(controls.getObject().position.y < floorHeight){
                playerVector.y = 0;
                controls.getObject().position.y = floorHeight;
                canJump = true;
            }
            
            //store time for next calculation of 'delta'
            previousTime = time;
        }

        
        //update the bullets array
        //start counting from the last element so old bullets can be removed
        for(i = bullets.length-1; i >= 0; i--){
            var bullet = bullets[i], //the current bullet being examined
                pos = bullet.position, //the position of the bullet x, y, z
                dir = bullet.ray.direction, //the direction of the bullet
                hit = false; //has the bullet hit anything?

            //bullet collides with wall
            if(checkWallCollision(pos)){ //if bullet collides with wall-
                console.log("Wall collision for bullet position x: " + pos.x + " z: " + pos.z + "y: " + pos.y + " detected");
                bullets.splice(i, 1); //remove 1 bullet from bullets array
                scene.remove(bullet); //remove the bullet from scene
                continue; //if bullet has hit wall, skip the rest of this iteration
            }
            
            //bullet collides with ceiling/sky
            if(pos.y >= wallHeight * unitSize){ //if bullet has reached ceiling level-
                console.log("Ceiling collision for bullet position x: " + pos.x + " z: " + pos.z + "y: " + pos.y + " detected");
                bullets.splice(i, 1); //remove 1 bullet from bullets array
                scene.remove(bullet); //remove the bullet from scene
                continue; //if bullet has hit ceiling, skip the rest of this iteration
            }
            
            //bullet collides with floor
            if(pos.y <= floorHeight/2){
                console.log("Floor collision for bullet position x: " + pos.x + " z: " + pos.z + "y: " + pos.y + " detected");
                bullets.splice(i, 1); //remove 1 bullet from bullets array
                scene.remove(bullet); //remove the bullet from scene
                continue; //if bullet has hit floor, skip the rest of this iteration
            }

            //bullet collides with player
            //check owner - player (camera) can't get hit by own bullet
            if(dist(pos.x, pos.y, pos.z, controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z) < mobRadius*2 && bullet.owner != controls){
                console.log("Player was hit by bullet");
                hp -= bulletDamage; //lose hp
                if (hp < 0){ hp = 0;} //set hp to 0 if below 0
                bullets.splice(i, 1); //remove 1 bullet from bullets array
                scene.remove(bullet); //remove the bullet from scene
                //update hud
                document.getElementById("hud").innerHTML = "<p>HP: " + hp + "</span><br/>Kills: " + kills + "</span></p>";
                continue; //if bullet has hit player, skip the rest of this iteration
                //hit = true; //(will this be needed?)
            }
            
            //bullet hits mob
            for(j = mobs.length-1; j >= 0; j--){
                var mob = mobs[j], //the current mob being examined
                    mobPos = mob.position; //the position of the mob x, y, z
                
                if(dist(mobPos.x, mobPos.y, mobPos.z, pos.x, pos.y, pos.z) <= mobRadius && bullet.owner === controls){
                    
                    bullets.splice(i, 1); //remove 1 bullet from bullets array
                    scene.remove(bullet); //remove the bullet from scene
                    mobs.splice(j, 1); //remove 1 mob from mobs array
                    scene.remove(mob); //remove the mob from scene
                    hit = true;
                    kills += 1;
                    //update hud
                    document.getElementById("hud").innerHTML = "<p>HP: " + hp + "</span><br/>Kills: " + kills + "</span></p>";
                }
            }
            
            var bulletVelocity;
            
            //if bullet hasn't collided, move bullet
            if(!hit){
                if(bullet.owner === controls){
                    bulletVelocity = playerBulletMoveSpeed * delta;
                }
                else{
                    bulletVelocity = mobBulletMoveSpeed * delta;
                }
                bullet.translateX(bulletVelocity * dir.x); //move along x axis
                bullet.translateY(bulletVelocity * dir.y); //move along y axis
                bullet.translateZ(bulletVelocity * dir.z); //move along z axis
            }
        }
        
        
        //handle mobs
        
        var mobTime = performance.now();
        //spawn mobs every 'mobSpawnInterval' seconds
        if((mobTime - previousMobTime)/1000 >= mobSpawnInterval && mobs.length < 100 && animationRun && canShoot){
            addMob();
            previousMobTime = mobTime;
        }
        
        var mobVelocity = mobMoveSpeed * delta;
        
        for(i = mobs.length-1; i >= 0; i--){
            var mob = mobs[i], //the current mob being examined
                mobPos = mob.position, //the position of the mob x, y, z
                mobDir = mob.ray.direction; //the direction of the mob
            
            var mobShootTime = performance.now();
            if((mobShootTime - mob.previousMobShootTime)/1000 >= 15 && animationRun && canShoot){
                addBullet(mob);
                mob.previousMobShootTime = mobShootTime;
            }
          
            //mob player collision
            if(dist(mobPos.x, mobPos.y, mobPos.z, controls.getObject().position.x, controls.getObject().position.y, controls.getObject().position.z) <= mobRadius *2){
                console.log("Player and mob collide - player takes " + mobDamage + " hp damage and mob is deleted.");
                hp -= mobDamage; //player takes damage
                if (hp < 0){ hp = 0;} //set hp to 0 if below 0
                mobs.splice(i, 1); //remove 1 mob from mobs array
                scene.remove(mob); //remove the mob from scene
                //update hud
                document.getElementById("hud").innerHTML = "<p>HP: " + hp + "</span><br/>Kills: " + kills + "</span></p>";
            }

            //mob hits wall - change direction
            if(checkWallCollision(mobPos)){
                mobDir.x = mobDir.x * (-1);
                mobDir.z = mobDir.z * (-1);
            }
            
            //mob hits floor/ceiling
            if(mobPos.y >= wallHeight * unitSize - mobRadius || mobPos.y <= floorHeight/2 + mobRadius/2){
                mobDir.y = mobDir.y * (-1);
            }
            
            mob.translateX(mobVelocity * mobDir.x); //move along x axis
            mob.translateY(mobVelocity * mobDir.y); //move along y axis
            mob.translateZ(mobVelocity * mobDir.z); //move along z axis
        }

        
        //repaint everything
        renderer.render(scene, camera);

        //If player dies show game Over screen
        if(hp <= 0){
            animationRun = false;
            canShoot = false;
            $(renderer.domElement).fadeOut(); //fade out renderer
            $('#hud').fadeOut(); //fade out HUD
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            startscreen.style.display = 'none';
            //hud.style.display = 'none';
            gameoverscreen.style.display = '';
            
            //ask browser to disable pointerlock
            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
            document.exitPointerLock();
            controlsEnabled = false;
            controls.enabled = false;
        }
    }

//___________________________________________________

    var bulletGeometry = new THREE.SphereGeometry(1, 5, 5);

    function addBullet(object){ //the object is the shooter

        //create the new bullet with the mesh and material
        var newBullet;
        
        //if the object shooting is player
        if(object === controls){
            //make it a player bullet
            newBullet = new THREE.Mesh(bulletGeometry, playerBulletMaterial);
            
            //set new bullets position to position of player
            newBullet.position.set(object.getObject().position.x,
                                   object.getObject().position.y,
                                   object.getObject().position.z);
            
            //shoot the bullet in the cursors direction
            var vector = new THREE.Vector3(0, 0, 1);//mouse.x, mouse.y, 1);
            
            //translate vector from 2D to 3D
            vector.unproject(camera);
            //give new bullet a ray starting at player's position
            //(position of player, direction to shoot)
            newBullet.ray = new THREE.Ray(
                object.getObject().position,
                vector.sub(object.getObject().position).normalize()
            );
        }
        //if the shooter isn't player
        else{
            //make it a mob bullet
            newBullet = new THREE.Mesh(bulletGeometry, mobBulletMaterial);
            
            //set new bullets position to position of shooter
            newBullet.position.set(object.position.x,
                                   object.position.y,
                                   object.position.z);
            var vector = object.position.clone();
            //translate vector from 2D to 3D
            vector.unproject(camera);
            newBullet.ray = new THREE.Ray(object.position, vector.sub(object.position).normalize());
        }

        newBullet.objType = "bullet"; //give the bullet a name tag
        newBullet.owner = object; //give the bullet an owner property (who fired it)
        console.log("A " + newBullet.objType + " was fired from x: " + newBullet.position.x + ", y: " + newBullet.position.y + ", z: " + newBullet.position.z);
        bullets.push(newBullet); //add the new bullet to bullets array
        scene.add(newBullet); //add the new bullet to scene
    }

//___________________________________________________

    var mobGeometry = new THREE.SphereGeometry(mobRadius, 7, 7);
        
    function addMob(){

        //create the new mob with the mesh and material
        var newMob = new THREE.Mesh(mobGeometry, mobMaterial);
        
        //set the new mobs position
        newMob.position.set(0, unitSize * 1.2, 0);
        
        //give mob a random movement vector
        var vector = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        
        //give new mob a ray
        //(position of new mob, direction vector)
        newMob.ray = new THREE.Ray(newMob.position, vector);
        
        newMob.objType = "mob"; //give the mob a name tag
        newMob.previousMobShootTime = performance.now(); //start the mobs 'shooting clock'
        console.log("A " + newMob.objType + " spawned at x: " + newMob.position.x + ", y: " + newMob.position.y + ", z: " + newMob.position.z);
        
        mobs.push(newMob); //add the new mob to mobs array
        scene.add(newMob); //add the new mob to scene
    }
//___________________________________________

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
            //console.log("Wall collision for object position x: " + objPosition.x + " z: " + objPosition.z + "y: " + objPosition.y + " detected");
            return true;
        }
        else return false;
    }

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

    function dist(x1, y1, z1, x2, y2, z2){
        //pythagoras
        var diagonal2D = Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((z2-z1), 2));
        return Math.sqrt(Math.pow((y2-y1), 2) + Math.pow(diagonal2D, 2));
    }

    //find out in which map sector an object is located
    function retrieveMapSector(objPosition){
        var x = //Math.floor(objPosition.x / unitSize);
                Math.floor((objPosition.x + unitSize/2) / unitSize + mapWidth/2 - 0.5);
        var z = //Math.floor(objPosition.z / unitSize);
                Math.floor((objPosition.z + unitSize/2) / unitSize + mapWidth/2 - 0.5);
        return {x: x, z: z};
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
        if(controls){controls.freeze = true; location.reload();}
    });
}

//document.getElementById("hud").innerHTML = "<p>HP: " + hp + "</span><br/>Kills: " + kills + "</span></p>";