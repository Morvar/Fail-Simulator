//scene setup
var scene = new THREE.Scene();
//create perspective camera(field of view, aspect ratio[width/height of element],near, far [clipping plane. no rendering nearer than near or beyond far. improves performance])
var camera = new THREE.PerspectiveCamera();