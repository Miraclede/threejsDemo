<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

var scene = null;
var renderer = null;
var camera = null;

const initBase = () => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 300, 500);
	camera.lookAt(0, 0, 0);

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x345678); //设置背景颜色
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
};

const initLight = () => {
	// 添加环境贴图以增强反射和折射效果（这里简化处理，实际项目中可能需要加载HDR环境图）
	const SpotLight = new THREE.SpotLight(0xffffff, 3);
	scene.add(SpotLight);
};

const initGeometry = () => {
	const geometry = new THREE.BoxGeometry(100, 100, 100);
	const material = new THREE.MeshPhysicalMaterial({
		metalness: 0.0, //玻璃非金属  金属度设置0
		roughness: 0.0, //玻璃表面光滑
		envMapIntensity: 1.0,
		transmission: 1.0, //透射度(透光率)
		ior: 1.5, //折射率
	});

	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, 0, 0);
	scene.add(mesh);
};

const initOrbitControls = () => {
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		renderer.render(scene, camera); //重绘
	});
};

onMounted(() => {
	initBase();
	initLight();
	initGeometry();
	initOrbitControls();

	renderer.render(scene, camera);
});

// onresize 事件会在窗口被调整大小时发生
window.onresize = function () {
	console.log("onresize", window.innerWidth, window.innerHeight);
	// 重置渲染器输出画布canvas尺寸

	renderer.setSize(window.innerWidth, window.innerHeight);
	// 全屏情况下：设置观察范围长宽比aspect为窗口宽高比
	camera.aspect = window.innerWidth / window.innerHeight;
	// 渲染器执行render方法的时候会读取相机对象的投影矩阵属性projectionMatrix
	// 但是不会每渲染一帧，就通过相机的属性计算投影矩阵(节约计算资源)
	// 如果相机的一些属性发生了变化，需要执行updateProjectionMatrix ()方法更新相机的投影矩阵
	camera.updateProjectionMatrix();
};
</script>

<template>
	<div class="first-person"></div>
</template>

<style lang="scss" scoped>
.first-person {
}
body {
	margin: 0;
	width: 100vw;
	height: 100vh;
	background-color: #345678;
}
</style>
