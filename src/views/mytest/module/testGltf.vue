<script setup>
import { onMounted, watch } from "vue";
import * as THREE from "three";
import gsap from "gsap";
const colorList = ["#fff", "#06B4EE", "#ffa500", "#ffff00"];
// 相机旋转 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

//定义全局model
var model = null;
onMounted(() => {
	console.log("mounted");
	console.log("查看当前屏幕设备像素比", window.devicePixelRatio);

	// 场景 对象 相机 渲染器
	const scene = new THREE.Scene();
	// 创建GLTF加载器对象
	const loader = new GLTFLoader();

	// loader.load("/static/model/Model1.gltf", function (gltf) {
	// loader.load("/static/model/aliyun.glb", function (gltf) {
	// loader.load("/static/model/AlphaBlendModeTest.gltf", function (gltf) {
	// loader.load("/static/model/BarramundiFish.gltf", function (gltf) {
	// loader.load("/static/model/house.glb", function (gltf) {
	// loader.load("/static/model/house.gltf", function (gltf) {
	loader.load("/static/model/BoomBox.glb", function (gltf) {
		// console.log("控制台查看加载gltf文件返回的对象结构", gltf);
		// console.log("gltf对象场景属性", gltf.scene);
		model = gltf.scene;
		//gsap控制 model 绕Y轴左右各45°来回旋转
		var bool = true;
		var event = null;
		const render = () => {
			if (event == null) {
				event = gsap.to(model.rotation, {
					duration: 10,
					y: bool ? -0.25 * Math.PI : 0.25 * Math.PI,
					repeat: 1,
					yoyo: true,
					ease: "none",
					onComplete: () => {
						console.log("动画执行完成");
						bool = !bool;
						event = null;
					},
				});
			}

			renderer.render(scene, camera);
			requestAnimationFrame(render);
		};
		render();

		// 返回的场景对象gltf.scene插入到threejs场景中
		scene.add(model);
		// scene.add(gltf.scene);
		// 导入模型是异步的,需要在图像load 加载完成之后立即渲染一次
		renderer.render(scene, camera);
	});

	/* 辅助坐标轴 */
	// const axesHelper = new THREE.AxesHelper(100);
	// scene.add(axesHelper);

	/* 辅助光源 */
	const ambient = new THREE.AmbientLight(0xffffff, 7.0);
	scene.add(ambient);

	const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.01, 3000);
	// const camera = new THREE.PerspectiveCamera();
	camera.position.set(0, 0, 0.15);
	// camera.lookAt(0, 0, 0);
	camera.lookAt(0, 0, 0);

	const renderer = new THREE.WebGLRenderer();
	let divGltf = document.getElementById("divGltf");
	renderer.setSize(divGltf.clientWidth, divGltf.clientHeight);
	// renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x008B8B);
	renderer.setPixelRatio(window.devicePixelRatio);

	//新版本，加载gltf，不需要执行下面代码解决颜色偏差
	// renderer.outputColorSpace = THREE.SRGBColorSpace; //设置为SRGB颜色空间

	// 设置相机控件轨道控制器OrbitControls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		console.log("重绘");
		renderer.render(scene, camera); //重绘
	});

	// document.body.appendChild(renderer.domElement);

	divGltf.appendChild(renderer.domElement);
	renderer.render(scene, camera); //重绘
	// // 相机控件.target属性在OrbitControls.js内部表示相机目标观察点，默认0,0,0
	// controls.target.set(0, 0, 0);
	controls.update(); //update()函数内会执行camera.lookAt(controls.targe)
});

const changeColor = (item) => {
	console.log("当前点击的颜色", item);

	model.traverse(function (child) {
		if (child.isMesh) {
			if (child.name == "Cube003") {
				child.material.color.setHex(0x00ff00);
			} else if (child.name == "Cube") {
				child.material.color.setHex(0x0000ff);
			} else if (child.name == "Cube001") {
				child.material.color.setHex(0x345678);
			} else {
				child.material.color.set(item);
			}
			console.log("查看当前模型", child);
		}
	});
};
</script>

<template>
	<div class="dbody">
		<div class="divGltf" id="divGltf"></div>

		<div class="dbody-right">
			<div class="dbody-right-title">产品颜色</div>
			<div class="dbody-right-colorbox">
				<div class="dbody-right-colorbox-item" v-for="(item, index) in colorList" @click="changeColor(item)" :style="{ backgroundColor: item }"></div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
body {
	overflow: hidden;
	margin: 0px;
	height: 100vh;
	width: 100vw;
}

.dbody {
	width: 100vw;
	height: 100vh;
	box-sizing: border-box;
	background-color: #008B8B;
	position: relative;
	.divGltf {
		position: absolute;
		width: 50%;
		height: 80%;
		top: 50%;
		left: 30%;
		transform: translate(-50%, -50%);
		// background-color: #23A48F;
	}
	&-right {
		position: absolute;
		width: 40%;
		height: 80%;
		top: 50%;
		right: 1rem;
		background-color:#23A48F;
		border-radius: 1rem;
		transform: translateY(-50%);
		color: white;
		//从右往左进入的css效果
		animation: fromRight 1s ease-in-out;
		@keyframes fromRight {
			0% {
				transform: translateX(100%) translateY(-50%);
			}
			100% {
				transform: translateX(0%) translateY(-50%);
			}
		}

		&-title {
			font-size: 1.2rem;
			font-weight: 600;
			padding: 1rem 2.5rem;
		}

		&-colorbox {
			display: flex;
			justify-content: space-around;
			padding: 0 2.5rem;
			
			&-item {
				width: 4rem;
				height: 4rem;
				border-radius: 25rem;
				border: 0.3rem solid rgba(255, 255, 255, 0.419);
				box-sizing: border-box;
				box-shadow: inset 0 0 0 0.2rem rgba(255, 255, 255, 1);
				background-color: aquamarine;
			}
		}
	}
}
</style>
