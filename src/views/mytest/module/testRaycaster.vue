<!-- 射线映射碰撞检测 / 实现hover 效果  / 实现点击效果-->
<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import Stats from "three/addons/libs/stats.module.js"; //性能统计模块 性能帧数，每次刷新所用时间，占用内存
import {DragControls} from "three/addons/controls/DragControls.js";

let stats;
let camera, scene, raycaster, renderer,controls;

let INTERSECTED;
let theta = 0;

const pointer = new THREE.Vector2();
const radius = 5;

onMounted(() => {
	init();
});

//点击监听
document.addEventListener("click", onDocumentClick, false);

function onDocumentClick(event) {
	// event.preventDefault();

	// 转换鼠标坐标为屏幕坐标（标准化设备坐标）
	const mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	 // 创建射线caster
	 const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera); // 使用相机和鼠标位置设置射线

    // 计算哪些对象被射线击中
    const intersects = raycaster.intersectObjects(scene.children, true); // 第二个参数为true表示递归检查所有子对象

    if (intersects.length > 0) {
        const firstIntersectedObject = intersects[0].object;

        // 在这里处理点击的对象
        console.log('Clicked on:', firstIntersectedObject);
        
        // 示例：高亮点击的对象
        // firstIntersectedObject.material.color.set(0x00ff00);
		//为firstIntersectedObject设置逐渐透明消失的动画
		
		// firstIntersectedObject.visible = false;
    }
}

const initDragControls=()=>{
	controls = new DragControls(scene.children, camera, renderer.domElement);
	controls.addEventListener('dragstart', function (event) {
		console.log('dragstart', event);
		event.object.material.emissive.set(0xaaaaa);
	});
	constrols.addEventListener('dragend', function (event) {
		console.log('dragend', event);
		event.object.material.emissive.set(0x000000);
	});
}

function init() {
	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xf0f0f0);

	const light = new THREE.DirectionalLight(0xffffff, 3);
	light.position.set(1, 1, 1).normalize();
	scene.add(light);

	//生成两千个随机位置,大小,颜色的box
	const geometry = new THREE.BoxGeometry();

	for (let i = 0; i < 2000; i++) {
		const object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff })); //Math.random() * 0xffffff 随机颜色

		object.position.x = Math.random() * 40 - 20;
		object.position.y = Math.random() * 40 - 20;
		object.position.z = Math.random() * 40 - 20;

		object.rotation.x = Math.random() * 2 * Math.PI;
		object.rotation.y = Math.random() * 2 * Math.PI;
		object.rotation.z = Math.random() * 2 * Math.PI;

		object.scale.x = Math.random() + 0.5;
		object.scale.y = Math.random() + 0.5;
		object.scale.z = Math.random() + 0.5;

		scene.add(object);
	}

	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

	stats = new Stats();
	document.body.appendChild(stats.dom);

	document.addEventListener("mousemove", onPointerMove);
	window.addEventListener("resize", onWindowResize);

	initDragControls();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {
	pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
	pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
	render();
	stats.update();
}

function render() {
	theta += 0.05;

	camera.position.x = radius * Math.sin(THREE.MathUtils.degToRad(theta));
	camera.position.y = radius * Math.sin(THREE.MathUtils.degToRad(theta));
	camera.position.z = radius * Math.cos(THREE.MathUtils.degToRad(theta));
	camera.lookAt(scene.position);

	camera.updateMatrixWorld();

	// find intersections

	raycaster.setFromCamera(pointer, camera);

	const intersects = raycaster.intersectObjects(scene.children, false);

	if (intersects.length > 0) {
		if (INTERSECTED != intersects[0].object) {
			if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex(0xff0000);
		}
	} else {
		if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

		INTERSECTED = null;
	}

	renderer.render(scene, camera);
}
</script>

<template>
	<div id="info"><a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - interactive cubes</div>
</template>

<style lang="scss" scoped>
body {
	background-color: #f0f0f0;
	color: #444;
}
a {
	color: #08f;
}
</style>
