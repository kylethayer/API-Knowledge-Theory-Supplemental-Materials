/* global THREE Detector performance */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container;
var camera, scene, renderer, light, reflectCubeCamera;
var object1, object2, object3, object4, object5;
var controls;

init();
animate();
function init() {
	container = document.getElementById( 'container' );
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
	camera.position.set( 60, 10, 100 );
	
	light = new THREE.DirectionalLight( 0xffffff, 0.8 );
	light.position.set( - 30, 30, 30 );
	scene.add( light );
	var ambientLight = new THREE.AmbientLight( 0x555555, 0.4 );
	scene.add( ambientLight );

	
	var geometry1 = new THREE.IcosahedronGeometry( 20, 0 );
	var material1 = new THREE.MeshPhongMaterial( {
    		shininess: 20,
    		specular: 0xffff00,
    		side: THREE.DoubleSide
    	} );
    object1 = new THREE.Mesh( geometry1, material1 );
    object1.position.x = -40;
	scene.add( object1 );
	
	var geometry2 = new THREE.TetrahedronGeometry (20);
	var material2 = new THREE.MeshPhongMaterial( {
	        color: 0x555555,
    		emissive: 0x007700,
    		side: THREE.DoubleSide
    	} );
    object2 = new THREE.Mesh( geometry2, material2 );
    object2.position.x = 40;
	scene.add( object2 );
	
	var geometry3 = new THREE.SphereGeometry(15, 20, 50);
	reflectCubeCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
	reflectCubeCamera.position.x = 0;
	reflectCubeCamera.position.z = 20;
	scene.add( reflectCubeCamera );
	reflectCubeCamera.update( renderer, scene );
	var material3 = new THREE.MeshBasicMaterial( {
    		color:  0xffffff,
    		envMap: reflectCubeCamera.renderTarget.texture
    	} );
    material3.envMap.mapping = THREE.CubeReflectionMapping;
    object3 = new THREE.Mesh( geometry3, material3 );
    object3.position.x = 0;
    object3.position.z = 20;
 	scene.add( object3 );
 	
 	var geometry4 = new THREE.TorusGeometry(10);
	var material4 = new THREE.MeshBasicMaterial( {
			color: 0x8f0f5f
		} );
    	
    object4 = new THREE.Mesh( geometry4, material4 );
    object4.position.x = 10;
    object4.position.z = 50;
	scene.add( object4 );
	
 	var geometry5 = new THREE.ConeGeometry(10,10);
	var material5 = new THREE.MeshPhongMaterial( {
    		color: 0xf794f0,
    		opacity: .8,
    		transparent: true,
    		side: THREE.DoubleSide
    	} );
    object5 = new THREE.Mesh( geometry5, material5 );
    object5.position.x = -40;
    object5.position.z = 50;
	scene.add( object5 );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target.set( 0, 10, 0 );
	camera.lookAt( controls.target );
}

function animate() {
	requestAnimationFrame( animate );
	var time = performance.now();
    object1.rotation.y = time / 1000;
    object2.rotation.y = time / 1000;
    object4.rotation.y = time / 1000;
    object5.rotation.y = time / 1000;
    reflectCubeCamera.update( renderer, scene );
	renderer.render( scene, camera );
}