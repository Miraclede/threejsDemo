<script setup>
import { onMounted,ref } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextureLoader } from "three"; //导入纹理加载器
import { FirstPersonControls } from "three/examples/jsm/controls/FirstPersonControls";//导入第一人称控制器

import grassTexture from "@/views/mytest/module/textures/grass.jpg"; //引入纹理贴图

var scene = null;
var renderer = null;
var camera = null;

// 第一人称控制器
var firstPersonControls  = null;
// 
var clock = null;
// 创建一个TextureLoader实例
const textureLoader = new TextureLoader();

onMounted(() => {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 10000);
	camera.position.set(0, 800, 800);
	camera.lookAt(0, 0, 0);

	/* 辅助光源 */
	const ambient = new THREE.AmbientLight(0xffffff, 1.0);
	scene.add(ambient);

    /* 坐标轴 */
    const axesHelper = new THREE.AxesHelper(10000);

    scene.add(axesHelper);

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(0x345678); //设置背景颜色
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);
	document.body.appendChild(renderer.domElement);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		// console.log(123, mesh.position);
		renderer.render(scene, camera); //重绘
		// console.log(567, camera.position);
	});


    // 异步加载纹理贴图
	textureLoader.load(
		grassTexture,
		(texture) => {
			console.log(788, texture);
			//添加一个box,设置为地板
			const floorGeometry = new THREE.BoxGeometry(5000, 0.1, 5000);
			const floorMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });

			// 根据需要调整纹理重复次数以适应模型大小
			floorMaterial.map.repeat.set(5, 5);
			floorMaterial.map.wrapS = THREE.RepeatWrapping;
			floorMaterial.map.wrapT = THREE.RepeatWrapping;

			const mesh = new THREE.Mesh(floorGeometry, floorMaterial);
			mesh.position.set(0, 0, 0);
			scene.add(mesh);
			renderer.render(scene, camera); //重绘
		},
		(onprogress) => {
			console.log(789, onprogress);
		},
		(onerror) => {
			console.log(790, onerror);
		}
	);

    createFirstPersonControls();
    
    const render = () => {
        const delta = clock.getDelta();
        firstPersonControls.update(delta);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
	};
    render();
});

const createFirstPersonControls = ()=>{
    clock = new THREE.Clock();
    firstPersonControls = new FirstPersonControls(camera, renderer.domElement);
    // firstPersonControls.lookSpeed = 0;
    firstPersonControls.movementSpeed = 20;
    firstPersonControls.noFly = true;
    firstPersonControls.lookVertical = false;
    firstPersonControls.constrainVertical = true;
    firstPersonControls.verticalMin = 1.0;
    firstPersonControls.verticalMax = 2.0;
    firstPersonControls.lon = -150;
    firstPersonControls.lat = 120;
}

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
