<template>
	<div style="position: relative">
		<div class="tooltip-box" :style="tooltipPosition" ref="tooltipBox">
			<div class="container">
				<div class="title">标题：{{ tooltopContent.title }}</div>
				<div class="explain">说明：{{ tooltopContent.text }}</div>
			</div>
		</div>
		<p class="title-text" ref="titleBox" :style="titlePosition">
			{{ tooltopContent.title }}
		</p>
	</div>
</template>

<script setup>
import picFullView from "/static/imgs/fullView.jpg";
import picFullCity from "/static/imgs/fullCity.jpg";

import { onMounted, ref, watch, getCurrentInstance, reactive, render } from "vue";

import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
// 相机旋转 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// 引入gltf模型加载库GLTFLoader.js
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { gsap } from "gsap";

var { proxy } = getCurrentInstance();

var scene = null;
var box = null;
var camera = null;
var sphere = null;
var tipsSpriteList = [];
let tooltipBox = ref(null);
let titleBox = ref(null);
var timer = null;
var renderer = null;

var tooltipPosition = ref({
	// 初始化位置全部在屏幕之外
	top: "-100%",
	left: "-100%",
});
var titlePosition = ref({
	top: "-100%",
	left: "-100%",
});
var tooltopContent = {}; // 展示的内容

const handleTooltipHide = (e) => {
	e.preventDefault();
	tooltipPosition.value = {
		top: "-100%",
		left: "-100%",
	};
	titlePosition.value = {
		top: "-100%",
		left: "-100%",
	};
	tooltopContent = {};
};

const changeContentAndtips = (index) => {
	// 清除场景数据内所有的精灵标签
	scene.children = scene.children.filter((item) => String(item.type) !== "Sprite");
	// 储存数组置空
	tipsSpriteList = [];
	// 重新加载贴图，这边应用gasp做一个简单的过渡动画，将透明度从0 ~ 1
	let texture = new THREE.TextureLoader().load(dataList[index].image);
	let sphereMaterial = new THREE.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: 0,
		// transparent: false,
	});
	sphere.material = sphereMaterial;
	// 手动更新投影矩阵
	gsap.to(sphereMaterial, { transparent: true, opacity: 1, duration: 2 });
	// 手动更新投影矩阵
	camera.updateProjectionMatrix();
	// 添加当前场景标签
	addTipsSprite(index);
};

const onMouseClick = (e) => {
	e.preventDefault();
	//   let element = this.$refs.threeDBox;
	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	let intersects = raycaster.intersectObjects(tipsSpriteList, true);
	if (intersects.length > 0 && intersects[0].object.content.showTitle) {
		changeContentAndtips(intersects[0].object.content.image);
		handleTooltipHide(e);
	}
};

const onMousemove = (e) => {
	//console.log(888,e,'??',window.clientWidth)
	e.preventDefault();
	//   let element = this.$refs.threeDBox;
	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();

	// 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mouse, camera);
	// 将标签精灵数据放进来做视线交互
	let intersects = raycaster.intersectObjects(tipsSpriteList, true);
	// console.log("tipsSpriteList1211", tipsSpriteList);
	// console.log("intersects1212", intersects);
	// 视线穿过集合选择最前面的一个
	if (intersects.length > 0) {
		// console.log("intersects", intersects);
		// 将标签的空间坐标转屏幕坐标，通过计算赋给元素的top、left
		let elementWidth = window.innerWidth / 2;
		let elementHeight = window.innerHeight / 2;
		let worldVector = new THREE.Vector3(intersects[0].object.position.x, intersects[0].object.position.y, intersects[0].object.position.z);
		let position = worldVector.project(camera);
		tooltopContent = intersects[0].object.content;

		if (intersects[0].object.content.showTip) {
			console.log(789, elementWidth, position.x, tooltipBox.value.clientWidth);
			let left = Math.round(elementWidth * position.x + elementWidth - tooltipBox.value.clientWidth / 2);
			let top = Math.round(-elementHeight * position.y + elementHeight - tooltipBox.value.clientHeight / 2);
			tooltipPosition.value = {
				left: `${left}px`,
				top: `${top}px`,
			};
			console.log(567, tooltipPosition.value);
		} else if (intersects[0].object.content.showTitle) {
			let left = Math.round(elementWidth * position.x + elementWidth - titleBox.value.clientWidth / 2);
			let top = Math.round(-elementHeight * position.y + elementHeight);
			titlePosition.value = {
				left: `${left}px`,
				top: `${top}px`,
			};
			console.log(568, titlePosition.value);
		}
	} else {
		// console.log("没有穿过");
		// 鼠标移出去隐藏所有
		handleTooltipHide(e);
	}
};

// 标签数据
const dataList = [
	{
		image: picFullView,
		tipsList: [
			{
				position: { x: 200, y: 13, z: -120 },
				content: {
					title: "拥抱太阳,进入城市",
					text: "",
					image: 1,
					showTip: false,
					showTitle: true,
				},
			},
			{
				position: { x: 250, y: -20, z: -20 },
				content: {
					title: "海港耍朋友",
					text: "安逸勒",
					showTip: true,
					showTitle: false,
				},
			},
		],
	},
	{
		image: picFullCity,
		tipsList: [
			{
				position: { x: 240, y: -20, z: -20 },
				content: {
					title: "返回海边",
					text: "",
					image: 0,
					showTip: false,
					showTitle: true,
				},
			},
		],
	},
];

const renders = () => {
	renderer.render(scene, camera); //重绘
	timer = requestAnimationFrame(renders); //请求再次执行渲染函数render，渲染下一帧
};

onMounted(() => {
	console.log("mounted");
	console.log("查看当前屏幕设备像素比", window.devicePixelRatio);

	// 场景 对象 相机 渲染器
	scene = new THREE.Scene();

	// AxesHelper：辅助观察的坐标系
	const axesHelper = new THREE.AxesHelper(1500);
	scene.add(axesHelper);

	// GridHelper：网格辅助线
	// const gridHelpers = new THREE.GridHelper(1000, 100, 0x00000000, 0xffffff);
	// scene.add(gridHelpers);

	// 立方体盒子
	initContent();

	/* 辅助光源 */
	// const ambient = new THREE.AmbientLight(0xffffff, 1.0);
	// scene.add(ambient);

	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
	// const camera = new THREE.PerspectiveCamera();
	// camera.position.set(50, 50, 50);
	camera.position.set(0, 0, 0);
	camera.lookAt(255, 255, 255);
	// camera.lookAt(255, -5, -50);

	renderer = new THREE.WebGLRenderer( { antialias: true,alpha:true });
	renderer.setClearAlpha(0.0);
	renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.setClearColor(0x345678,0.0); //设置背景颜色
	
	renderer.setPixelRatio(window.devicePixelRatio);

	renderer.domElement.addEventListener("mousemove", onMousemove, false);
	renderer.domElement.addEventListener("click", onMouseClick, false);
	console.log("tooltipBox", tooltipBox);
	proxy.$refs.tooltipBox.addEventListener("mouseleave", handleTooltipHide, false);
	// tooltipBox.addEventListener("mouseleave", handleTooltipHide, false);
	document.body.appendChild(renderer.domElement);
	renders();

	//新版本，加载gltf，不需要执行下面代码解决颜色偏差
	// renderer.outputColorSpace = THREE.SRGBColorSpace; //设置为SRGB颜色空间

	// 设置相机控件轨道控制器OrbitControls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		renderer.render(scene, camera); //重绘
		// console.log(567, camera.position);
	});
	controls.enableDamping = true; //开启阻尼效果
	controls.dampingFactor = 0.25; //阻尼系数
	controls.enableZoom = false; //开启相机缩放
	controls.autoRotate = false; //开启自动旋转
	controls.enablePan = false; //开启相机平移
	controls.minDistance = 1; //设置相机距离原点的最近距离
	controls.maxDistance = 100; //设置相机距离原点的最远距离
	// 相机控件.target属性在OrbitControls.js内部表示相机目标观察点，默认0,0,0
	// console.log('controls.target', controls.target);
	// controls.target.set(100, 0, 0);
	controls.update(); //update()函数内会执行camera.lookAt(controls.targe)
	setTimeout(() => {
		renderer.render(scene, camera);
		addTipsSprite();
	}, 200);
});

//加载全景
const initContent = () => {
	// 立方体盒子

	// let picList = ['left', 'right', 'top', 'bottom', 'front', 'back'];
	// let boxGeometry = new THREE.BoxGeometry(100, 100, 100);
	// let boxMaterials = [];
	// picList.forEach((item)=>{
	// 	let texture = new THREE.TextureLoader().load(`/static/imgs/${item}.png`);
	// 	boxMaterials.push(new THREE.MeshBasicMaterial({map: texture}));
	// });
	// box = new THREE.Mesh(boxGeometry, boxMaterials);
	// scene.add(box);
	// box.geometry.scale(10, 10, -10);

	//球体

	let sphereGeometry = new THREE.SphereGeometry(16, 50, 50);
	let texture = new THREE.TextureLoader().load(`/static/imgs/fullView.jpg`);
	// let texture = new THREE.TextureLoader().load(picFullCity);
	let sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
	sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	scene.add(sphere);
	sphereGeometry.scale(16, 16, -16);
};

// 添加标签
const addTipsSprite = (index = 0) => {
	let tipTexture = new THREE.TextureLoader().load(`/static/imgs/tip.png`);
	let tipMaterial = new THREE.SpriteMaterial({ map: tipTexture });
	tipsSpriteList = [];
	dataList[index].tipsList.forEach((item) => {
		let tipsSprite = new THREE.Sprite(tipMaterial);
		tipsSprite.scale.set(10, 10, 10);
		tipsSprite.position.set(item.position.x, item.position.y, item.position.z); //设置标签位置
		tipsSprite.content = item.content; //设置标签内容
		tipsSpriteList.push(tipsSprite); //保存标签
		scene.add(tipsSprite); //添加到场景
	});
};
</script>

<style lang="scss">
body {
	overflow: hidden;
	margin: 0px;
	height: 100%;
	width: 100%;
	// height: 100vh;
	// width: 100vw;
}

.title-text {
	position: absolute;
	z-index: 9999;
	background-color: rgb(252, 252, 252);
	border-radius: 12px;
	border: 3px solid rgb(241, 97, 25);
	padding: 16px;
	color: rgb(241, 97, 25);
}
.tooltip-box {
	position: absolute;
	z-index: 9999;
	background-color: rgba(16, 15, 15, 0.541);
	border-radius: 12px;
	padding: 16px;
	color: white;
}
</style>
