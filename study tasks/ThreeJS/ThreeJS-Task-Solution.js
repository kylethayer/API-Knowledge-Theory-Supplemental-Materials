/* global THREE Detector performance */
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
var container;
var camera, scene, renderer, light;
var controls, water, cubeMap;
var parameters;
var torus, reflectCubeCamera;

init();
animate();
function init() {
	container = document.getElementById( 'container' );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	container.appendChild( renderer.domElement );

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0xaabbbb, 0.001 );

	camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
	camera.position.set( 30, 30, 100 );

	light = new THREE.DirectionalLight( 0xffffff, 0.8 );
	light.position.set( - 30, 30, 30 );
	light.castShadow = true;
	light.shadow.camera.top = 45;
	light.shadow.camera.right = 40;
	light.shadow.camera.left = light.shadow.camera.bottom = -40;
	light.shadow.camera.near = 1;
	light.shadow.camera.far = 200;
	scene.add( light );
	var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
	scene.add( ambientLight );

	setWater();
	setSkybox();
	
	//add camera to this, use as a reflection or refraction map
	reflectCubeCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
	scene.add( reflectCubeCamera );
	reflectCubeCamera.update( renderer, scene );
	
	var geometry = new THREE.TorusGeometry( 20, 5, 16, 36 );

	var material = new THREE.MeshPhongMaterial( {
					 color: 0x0,
					 emissive: 0xffffff,
					 shininess: 100,
					 reflectivity: 1,
					 envMap: reflectCubeCamera.renderTarget.texture,
					 specular: 0x991199,
				} );
			
	material.envMap.mapping = THREE.CubeReflectionMapping;
	
    torus = new THREE.Mesh( geometry, material );
	torus.position.y = 30;
	
	reflectCubeCamera.position.copy( torus.position );
	
	scene.add( torus );
	
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.maxPolarAngle = Math.PI * 0.495;
	controls.target.set( 0, 10, 0 );
	controls.enablePan = false;
	controls.minDistance = 40.0;
	controls.maxDistance = 200.0;
	camera.lookAt( controls.target );

	window.addEventListener( 'resize', onWindowResize, false );
}

function animate() {
	requestAnimationFrame( animate );
	
	var time = performance.now() * 0.001;
	torus.rotation.y = time;
	
	reflectCubeCamera.update( renderer, scene );
	
	animateWater();
	renderer.render( scene, camera );
}


/***************
Additional code that you don't need to worry about: 
  creating water, animating water, creating sky, responding to resize
***************/

function setWater() {
	parameters = {
		oceanSide: 2000,
		size: 1.0,
		distortionScale: 3.7,
		alpha: 1.0,
	};
	
	var waterGeometry = new THREE.PlaneBufferGeometry( parameters.oceanSide * 5, parameters.oceanSide * 5 );
	water = new THREE.Water(
		waterGeometry,
		{
			textureWidth: 512,
			textureHeight: 512,
			waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			}),
			alpha: parameters.alpha,
			sunDirection: light.position.clone().normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001e0f,
			distortionScale: parameters.distortionScale,
			fog: scene.fog !== undefined
		}
	);
	water.rotation.x = - Math.PI / 2;
	water.receiveShadow = true;
	scene.add( water );
}

function animateWater(){
	water.material.uniforms.time.value += 1.0 / 60.0;
	water.material.uniforms.size.value = parameters.size;
	water.material.uniforms.distortionScale.value = parameters.distortionScale;
	water.material.uniforms.alpha.value = parameters.alpha;
}

function setSkybox() {
	var cubeTextureLoader = new THREE.CubeTextureLoader();
	cubeTextureLoader.setPath( 'textures/cube/skyboxsun25deg/' );
	cubeMap = cubeTextureLoader.load( [
		'px.jpg', 'nx.jpg',
		'py.jpg', 'ny.jpg',
		'pz.jpg', 'nz.jpg',
	] );
	var cubeShader = THREE.ShaderLib[ 'cube' ];
	cubeShader.uniforms[ 'tCube' ].value = cubeMap;
	var skyBoxMaterial = new THREE.ShaderMaterial( {
		fragmentShader: cubeShader.fragmentShader,
		vertexShader: cubeShader.vertexShader,
		uniforms: cubeShader.uniforms,
		side: THREE.BackSide
	} );
	var skyBoxGeometry = new THREE.BoxBufferGeometry(
		parameters.oceanSide * 5 + 100,
		parameters.oceanSide * 5 + 100,
		parameters.oceanSide * 5 + 100 );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add( skyBox );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}