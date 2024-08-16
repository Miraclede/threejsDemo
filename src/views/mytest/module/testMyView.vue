<template></template>

<script setup>
import { onMounted, watch, getCurrentInstance, nextTick } from "vue";
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
// 相机旋转 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const { proxy } = getCurrentInstance();

var raycaster = null;
var mouse = null;
var selectedObject = null;
var group = null;
var lastPick = null;

onMounted(() => {
	console.log("mounted");
	console.log("查看当前屏幕设备像素比", window.devicePixelRatio);

	// 场景 对象 相机 渲染器
	const scene = new THREE.Scene();
	// 创建GLTF加载器对象
	const loader = new GLTFLoader();

	// loader.load("/static/model/Model1.gltf", function (gltf) {
	// loader.load("/static/model/aliyun.glb", function (gltf) {
	loader.load("/static/model/aliyun.glb", function (gltf) {
		// loader.load("/static/model/house.glb", function (gltf) {
		// loader.load("/static/model/house.gltf", function (gltf) {
		console.log("控制台查看加载gltf文件返回的对象结构", gltf);
		console.log("gltf对象场景属性", gltf.scene);
		// 返回的场景对象gltf.scene插入到threejs场景中
		scene.add(gltf.scene);
		gltf.scene.rotateX(Math.PI / 6);
		group = gltf.scene;
		setRaycaster();
	});

	const ambient = new THREE.AmbientLight(0xffffff, 1.0);
	scene.add(ambient);

	const DirectionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
	const DirectionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
	const DirectionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
	const DirectionalLight3 = new THREE.DirectionalLight(0xffffff, 1.0);
	DirectionalLight.position.set(100, 0, 0);
	DirectionalLight1.position.set(-100, 0, 0);
	DirectionalLight2.position.set(-100, -100, 0);
	DirectionalLight3.position.set(-0, -0, 100);
	scene.add(DirectionalLight);
	scene.add(DirectionalLight1);
	scene.add(DirectionalLight2);
	scene.add(DirectionalLight3);

	const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 3000);
	// const camera = new THREE.PerspectiveCamera();
	camera.position.set(0, 0, 10);
	2;
	// camera.lookAt(0, 0, 0);
	camera.lookAt(0, 0, 0);

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x345678); //
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);
	// renderer.render(scene, camera);
	// renderer.render(scene, camera);
	setTimeout(() => {
		renderer.render(scene, camera);
	}, 1000);

	nextTick(() => {
		renderer.render(scene, camera);
	});
	// renderer.render(scene, camera);

	//新版本，加载gltf，不需要执行下面代码解决颜色偏差
	// renderer.outputColorSpace = THREE.SRGBColorSpace; //设置为SRGB颜色空间

	// 设置相机控件轨道控制器OrbitControls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		renderer.render(scene, camera); //重绘
		// console.log(567, camera.position);
	});
	// 相机控件.target属性在OrbitControls.js内部表示相机目标观察点，默认0,0,0
	// console.log('controls.target', controls.target);
	// controls.target.set(100, 0, 0);
	controls.update(); //update()函数内会执行camera.lookAt(controls.targe)

	const animation = () => {
		requestAnimationFrame(animation);
		renderer.render(scene, camera); //重绘
	};
	animation();

	const setRaycaster = () => {
		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();

		const pointermove = () => {
			raycaster.setFromCamera(mouse, camera);	
			var intersects = null;
			if (group) {
				intersects = raycaster.intersectObject(group, true);
				// console.log(124, intersects);
			}

			if (lastPick) {
				// console.log(128, lastPick.object.material);
				lastPick.object.material.opacity = 1;
				// lastPick.object.material[0].color.set("#2defff");
				// lastPick.object.material[1].color.set("#3480C4");
			}
			lastPick = null;
			if (intersects) {
				lastPick = intersects.find((item) => {
					// return item.object.material && item.object.material.length === 2;
					return item.object.material;
				});
				
			}

			if (lastPick) {
				// lastPick.object.material.color.set("#ff0000");
				lastPick.object.material.opacity = 0.5;
				// lastPick.object.material[0].color.set("#fcec0b");
				// lastPick.object.material[1].color.set("#fcec0b");
			}
		};

		window.addEventListener("pointermove", pointermove, false);

		// 标注点击
		function onClick() {
			if (lastPick) {
				// 输出标注信息
				console.log(999, lastPick.object.material.name+ "被点击了,颜色是" + lastPick.object.material.color.getHexString());

				// _this.tagClick(_this.selectedObject._data);
			}
		}
		window.addEventListener("click", onClick, false);
	};
});
</script>

<style lang="scss">
.myTest {
	// width: 100%;
	// height: 100vh;
	background-color: #000;
}
body {
	overflow: hidden;
	margin: 0px;
	height: 100vh;
	width: 100vw;
}
</style>
