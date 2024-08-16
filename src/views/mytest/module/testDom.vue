<!-- 简单渲染dom到指定容器 CSS2DObject创建对象 + CSS2DRenderer渲染 -->
<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

var scene = null;
var renderer = null;
var camera = null;
let labelRenderer = null;

onMounted(() => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 300, 500);
	camera.lookAt(0, 0, 0);

	//坐标轴
	const axesHelper = new THREE.AxesHelper(500);
	scene.add(axesHelper);

	//添加一个box,设置为地板
	const geometry = new THREE.BoxGeometry(100, 100, 100);
	const material = new THREE.MeshBasicMaterial({ color: 0x234567, side: THREE.DoubleSide, transparent: true });

	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, 0, 0);

	const earthDiv = document.createElement("div");
	earthDiv.className = "label";
	earthDiv.textContent = "dom textContent";
	// earthDiv.style.backgroundColor = "transparent";
	earthDiv.style.backgroundColor = "red";

	const label = new CSS2DObject(earthDiv);
	label.position.set(0, 130, 0);
	// label.center.set(0, 1);
	mesh.add(label);

	scene.add(mesh);

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x345678); //设置背景颜色
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
	document.body.appendChild(renderer.domElement);

	labelRenderer = new CSS2DRenderer();
	labelRenderer.setSize(window.innerWidth, window.innerHeight);
	labelRenderer.domElement.style.position = "absolute";
	labelRenderer.domElement.style.top = "0px";
	labelRenderer.render(scene, camera);
	document.body.appendChild(labelRenderer.domElement);

	// const controls = new OrbitControls(camera, renderer.domElement);
	const controls = new OrbitControls(camera, labelRenderer.domElement);
	controls.addEventListener("change", function () {
		// console.log(123, mesh.position);
		renderer.render(scene, camera); //重绘
		labelRenderer.render(scene, camera);
		// console.log(567, camera.position);
	});
});

// onresize 事件会在窗口被调整大小时发生
window.onresize = function () {
	// console.log("onresize", window.innerWidth, window.innerHeight);
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
.label {
	color: #fff;
	font-family: sans-serif;
	padding: 2px;
	background: rgba(0, 0, 0, 0.6);
}
.first-person {
}
body {
	margin: 0;
	width: 100vw;
	height: 100vh;
	background-color: #345678;
}
</style>
