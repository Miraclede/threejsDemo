<template>
	<!-- <div class="map">1</div> -->
	<div id="tooltip"></div>
</template>

<script setup>
import chinaJson from "@/views/mytest/module/component/Map/json/china.json";

import * as THREE from "three";
import * as d3 from "d3";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { onMounted, ref, watch, getCurrentInstance } from "vue";

var scene = null;
var camera = null;
var render = null;
var cube = null;

var map = null;
var raycaster = null;
var mouse = null;
var lastPick = null;
var tooltip = null;

onMounted(() => {
	init();
});

const init = () => {
	scene = new THREE.Scene();
	setCamera();
	setRender();
	setLight();
	// setBox();

	loadMapData();
	addHelper();
	setController();
	setRenders();
	setRaycaster();
	setAnimation();
};

const showTooltip = () => {
	if (lastPick) {
        const properties = lastPick.object.parent.properties;
        tooltip.textContent = properties.name;
		tooltip.style.visibility = "visible";
	}else{
        tooltip.style.visibility = "hidden";
    }
};

const setRaycaster = () => {
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	tooltip = document.getElementById("tooltip");
	const onMouseMove = (event) => {
		// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		tooltip.style.left = event.clientX + 2 + "px";
		tooltip.style.top = event.clientY + 2 + "px";
	};
	window.addEventListener("mousemove", onMouseMove, false);
};

const setAnimation = () => {
	requestAnimationFrame(setAnimation);
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(scene.children, true);
	if (lastPick) {
		lastPick.object.material[0].color.set("#2defff");
		lastPick.object.material[1].color.set("#3480C4");
	}
	lastPick = null;
	lastPick = intersects.find((item) => {
		return item.object.material && item.object.material.length === 2;
	});
	if (lastPick) {
		lastPick.object.material[0].color.set("#ff0000");
		lastPick.object.material[1].color.set("#ff0000");
	}
    showTooltip();
	// const find = intersects.find((item) => {
	//     item.object.material && item.object.material.length ===2
	// });
	setRenders();
};

const addHelper = () => {
	const helper = new THREE.CameraHelper(camera);
	scene.add(helper);
};

const setController = () => {
	const controls = new OrbitControls(camera, render.domElement);
	controls.update();
	//todo 1.controls失效,添加了这个监听事件就可以了  2.周边黄色边框隐藏
	controls.addEventListener("change", function () {
		render.render(scene, camera); //执行渲染操作
	}); //监听鼠标、键盘事件
};

const setCamera = () => {
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 80;
	// camera.lookAt(0, 0, 0);
};
const setRender = () => {
	render = new THREE.WebGLRenderer();
	render.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(render.domElement);
};
const setLight = () => {
	const light = new THREE.AmbientLight(0xffffff);
	scene.add(light);
};
// const setBox = () => {
// 	const geometry = new THREE.BoxGeometry();
// 	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// 	cube = new THREE.Mesh(geometry, material);
// 	scene.add(cube);
// 	setAnimation();
// };
// const setAnimation = () => {
// 	requestAnimationFrame(setAnimation);
// 	cube.rotation.x += 0.01;
// 	cube.rotation.y += 0.01;
// 	setRenders();
// };
const setRenders = () => {
	render.render(scene, camera);
};

const generateGeometry = (jsondata) => {
	// 初始化一个地图对象
	map = new THREE.Object3D();
	// 墨卡托投影转换
	const projection = d3.geoMercator().center([104.0, 37.5]).scale(80).translate([0, 0]);

	// console.log(123, jsondata);

	jsondata.features.forEach((elem) => {
		// 定一个省份3D对象
		const province = new THREE.Object3D();

		// 每个的 坐标 数组
		const coordinates = elem.geometry.coordinates;
		province.properties = elem.properties;
		// 循环坐标数组
		coordinates.forEach((multiPolygon) => {
			multiPolygon.forEach((polygon) => {
				const shape = new THREE.Shape();
				const lineMaterial = new THREE.LineBasicMaterial({
					color: "white",
				});
				const lineGeometry = new THREE.BufferGeometry();

				for (let i = 0; i < polygon.length; i++) {
					const [x, y] = projection(polygon[i]);
					if (i === 0) {
						shape.moveTo(x, -y);
					}
					shape.lineTo(x, -y);
					// lineGeometry.vertices.push(new THREE.Vector3(x, -y, 4.01));
					let pointsArray = [];
					pointsArray.push(new THREE.Vector3(x, -y, 4.01));
					lineGeometry.setFromPoints(pointsArray);
				}

				const extrudeSettings = {
					depth: 10,
					bevelEnabled: false,
				};

				const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
				const material = new THREE.MeshBasicMaterial({
					color: "#2defff",
					transparent: true,
					opacity: 0.6,
				});
				const material1 = new THREE.MeshBasicMaterial({
					color: "#3480C4",
					transparent: true,
					opacity: 0.5,
				});

				const mesh = new THREE.Mesh(geometry, [material, material1]);
				const line = new THREE.Line(lineGeometry, lineMaterial);
				province.add(mesh);
				province.add(line);
				map.add(province);
			});
		});
	});

	if (scene) {
		scene.add(map);
	} else {
		console.log(123, "scene is null");
	}
};

const loadMapData = () => {
	// 获取地图数据
	// const loader = new THREE.FileLoader();
	// loader.load(chinaJson, (data) => {
	//     console.log(124, data);
	// 	const jsonData = JSON.parse(JSON.stringify(data));
	//     generateGeometry(jsonData);
	// });

	generateGeometry(chinaJson);
};
</script>

<style lang="scss">
// .map{
//     height: 10px;
// }
#tooltip {
	position: absolute;
	z-index: 2;
	background: white;
	padding: 10px;
    color: black;
	border-radius: 2px;
	visibility: hidden;
}
</style>
