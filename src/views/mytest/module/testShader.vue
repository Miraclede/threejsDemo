<template>
	<div ref="container" id="container" class="canvas-container" />
	<div id="info" class="info-text">three.js webgl - buffergeometry custom attributes - particles</div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "three";
import Stats  from "three/examples/jsm/libs/stats.module.js";

const container = ref(null);
let renderer, scene, camera, stats;
let particleSystem, uniforms, geometry;

const particles = 100000;

onMounted(() => {
	init();
	window.addEventListener("resize", onWindowResize);
});

onUnmounted(() => {
	window.removeEventListener("resize", onWindowResize);
	// Clean up, if necessary
});

/* 着色器代码字符串 */
const vertexShaderSource = `
	attribute float size;
	varying vec3 vColor;
  
	void main() {
	  vColor = color;
	  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	  gl_PointSize = size * ( 300.0 / -mvPosition.z );
	  gl_Position = projectionMatrix * mvPosition;
	}
  `;

const fragmentShaderSource = `
	uniform sampler2D pointTexture;
	varying vec3 vColor;
  
	void main() {
	  gl_FragColor = vec4( vColor, 1.0 );
	  gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
	}
  `;

function init() {
	camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 300;

	scene = new THREE.Scene();

	uniforms = {
		pointTexture: { value: new THREE.TextureLoader().load("/static/model/spark1.png") },
	};

	//着色器材质
	const shaderMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vertexShaderSource,
		fragmentShader: fragmentShaderSource,

		blending: THREE.AdditiveBlending,
		depthTest: false,
		transparent: true,
		vertexColors: true,
	});

	const radius = 200;

	geometry = new THREE.BufferGeometry();

	const positions = [];
	const colors = [];
	const sizes = [];

	const color = new THREE.Color();

	for (let i = 0; i < particles; i++) {
		positions.push((Math.random() * 2 - 1) * radius);
		positions.push((Math.random() * 2 - 1) * radius);
		positions.push((Math.random() * 2 - 1) * radius);

		color.setHSL(i / particles, 1.0, 0.5);

		colors.push(color.r, color.g, color.b);

		sizes.push(20);
	}

	geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
	geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
	geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));

	particleSystem = new THREE.Points(geometry, shaderMaterial);

	scene.add(particleSystem);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);

	const container = document.getElementById("container");
	container.appendChild(renderer.domElement);

	stats = new Stats();
	container.appendChild(stats.dom);

	//

	window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	const time = Date.now() * 0.005;

	particleSystem.rotation.z = 0.01 * time;

	const sizes = geometry.attributes.size.array;

	for (let i = 0; i < particles; i++) {
		sizes[i] = 10 * (1 + Math.sin(0.1 * i + time));
	}

	geometry.attributes.size.needsUpdate = true;

	renderer.render(scene, camera);

	stats.update();
}
</script>

<style scoped>
.canvas-container {
	width: 100%;
	height: 100%;
	display: block;
}
.info-text {
	/* Add your styles for the info text */
}
</style>
