<template>
	<!-- <div class="map">1</div> -->
	<div id="tooltip"></div>
</template>

<script setup>
import chinaJson from "@/views/mytest/module/component/Map/json/china.json";

import * as THREE from "three";
import * as d3 from "d3";
import TWEEN from "tween.js";
import tagSign from "@/views/mytest/module/component/Map/textures/tag.png";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import { onMounted, ref, watch, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();
// 墨卡托投影转换
const projection = d3.geoMercator().center([104.0, 37.5]).scale(80).translate([0, 0]);

const props = defineProps({
	SignData: {
		type: Array,
		default: () => [],
	},
});
const getData = ref(null);

watch(
	() => props.SignData,
	(newVal, oldVal) => {
		getData.value = newVal;
		let data = JSON.parse(JSON.stringify(newVal));
		// console.log("watch", data);
		setTags(data);
	},
	{
		deep: true,
	}
);

var scene = null;
var camera = null;
var render = null;
var cube = null;

var map = null;
var raycaster = null;
var mouse = null;
var lastPick = null;
var tooltip = null;

var group = null;
var EsaTween = null;

var selectedObject = null;

onMounted(() => {
	init();
});

const init = () => {
	scene = new THREE.Scene();
	setCamera();
	setRender();
	setLight();
	setBackground();
	// setBox();

	loadMapData();
	//相机辅助线(十字交叉)
	// addHelper();
	setController();
	setRenders();
	setRaycaster();
	// 设置刷新及动画及省份选中透明
	setAnimation();
};

const setBackground = () => {};

//todo 绘制标注
const setTags = (_data = []) => {
	if (!_data || _data.length === 0) {
		return;
	}

	scene.remove(group);
	group = new THREE.Object3D();

	// 设置精灵贴图标注
	const paintTag = (scale = 1) => {
		let spriteMap = new THREE.TextureLoader().load(tagSign);

		_data.forEach((d) => {
			// console.log('tag', d);
			// 必须是不同的材质，否则鼠标移入时，修改材质会全部都修改
			let spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap, color: 0xff0000 });
			const { value } = d;
			// 添加标点
			const sprite1 = new THREE.Sprite(spriteMaterial);

			if (value && value.length !== 0) {
				let [x, y] = projection(value);
				// sprite1.position.set(x, -y + 2, 6);
				sprite1.position.set(x, -y + 2, 13);
				// console.log(131, sprite1.position);
			}
			sprite1._data = d;
			sprite1.scale.set(2 * scale, 3 * scale, 8 * scale);
			// sprite1.scale.set(20 * scale, 30 * scale, 80 * scale);
			// sprite1.scale.set(20 * scale, 50 * scale, 80 * scale);

			group.add(sprite1);
		});
		spriteMap.dispose();
	};

	// 设置圆柱体标注
	// const paintTag = (scale = 1) => {
	// 	const axesHelper = new THREE.AxesHelper(150);
	// 	scene.add(axesHelper);

	// 	_data.forEach((d) => {
	// 		// console.log('tag', d);
	// 		// 必须是不同的材质，否则鼠标移入时，修改材质会全部都修改
	// 		const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1);
	// 		const material = new THREE.MeshBasicMaterial({
	// 			color: 0x00ff00, //0xff0000设置材质颜色为红色
	// 			transparent: true,
	// 			opacity: 0.8,
	// 			side: THREE.DoubleSide,
	// 		});

	// 		const { value } = d;
	// 		// 添加标点
	// 		// const sprite1 = new THREE.Sprite(spriteMaterial);
	// 		const sprite1 = new THREE.Mesh(geometry, material);

	// 		if (value && value.length !== 0) {
	// 			let [x, y] = projection(value);
	// 			// sprite1.position.set(x, -y + 2, 6);
	// 			sprite1.position.set(x, -y + 2, 13);
	// 			sprite1.rotation.x = Math.PI / 2;
	// 			// console.log(131, sprite1.position);
	// 		}
	// 		sprite1._data = d;
	// 		// sprite1.scale.set(2 * scale, 3 * scale, 8 * scale);
	// 		// sprite1.scale.set(2 , 30 * scale, 8 * scale);

	// 		group.add(sprite1);
	// 	});
	// 	// spriteMap.dispose();
	// };

	function setScale(scale = 1) {
		// console.log("scale",scale)
		group.children.forEach((s) => {
			// 精灵贴图
			s.scale.set(2 * scale, 3 * scale, 8 * scale);

			// 柱状体
			// let randomHeightArr = [30, 60, 90, 120];

			// s.scale.set(2, randomHeightArr[Math.floor(Math.random() * randomHeightArr.length)] * scale, 2);
		});
	}

	scene.add(group);

	paintTag.call(proxy, 0.1);

	let tween = new TWEEN.Tween({ val: 0.1 })
		.to(
			{
				val: 1.2,
			},
			1.5 * 1000
		)
		.easing(TWEEN.Easing.Sinusoidal.Out)
		.repeat(Infinity) //重复次数
		.onUpdate((d) => {
			//高度增加动画
			setScale.call(proxy, d);
			// setScale(d.val);
			// console.log("onUpdate",d)
		});

	tween.start();

	if (raycaster) {
		raycaster.setFromCamera(mouse, camera);
	}
	render.render(scene, camera);
	// console.log("render info", render.info);
	// TWEEN.update()
};

const showTooltip = () => {
	if (lastPick) {
		const properties = lastPick.object.parent.properties;
		// console.log(888,lastPick.object.parent)
		tooltip.textContent = properties.name;
		tooltip.style.visibility = "visible";
	} else {
		tooltip.style.visibility = "hidden";
	}
};

const setRaycaster = () => {
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	tooltip = document.getElementById("tooltip");

	// 省份toolTip
	const onMouseMove = (event) => {
		// 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		tooltip.style.left = event.clientX + 2 + "px";
		tooltip.style.top = event.clientY + 2 + "px";
	};
	window.addEventListener("mousemove", onMouseMove, false);

	// 标注
	const onPointerMove = () => {
		if (selectedObject) {
			selectedObject.material.color.set(0xff0000);
			selectedObject = null;
		}

		if (raycaster) {
			const intersects = raycaster.intersectObject(group, true);
			// console.log('select group', intersects)
			if (intersects.length > 0) {

				const res = intersects.filter(function (res) {
					return res && res.object;
				})[intersects.length - 1];

				if (res && res.object) {
					selectedObject = res.object;
					selectedObject.material.color.set("#0f0");
				}
			}
		}
	};
	window.addEventListener("pointermove", onPointerMove, false);

	// 标注点击
	function onClick() {
		if (selectedObject) {
			// 输出标注信息
			// console.log(999, selectedObject._data);
			alert(selectedObject._data.cityName+":项目数："+selectedObject._data.projectCount+"设备数："+selectedObject._data.deviceCount)
			// _this.tagClick(_this.selectedObject._data);
		}
	}
	window.addEventListener("click", onClick, false);
};


const setAnimation = () => {
	requestAnimationFrame(setAnimation);
	raycaster.setFromCamera(mouse, camera);
	TWEEN.update();
	const intersects = raycaster.intersectObjects(scene.children, true);
	if (lastPick) {
		lastPick.object.material[0].opacity = 1;
		// lastPick.object.material[0].color.set("#2defff");
		// lastPick.object.material[1].color.set("#3480C4");
	}
	lastPick = null;
	lastPick = intersects.find((item) => {
		return item.object.material && item.object.material.length === 2;
	});
	if (lastPick) {
		lastPick.object.material[0].opacity = 0.5;
		// lastPick.object.material[0].color.set("#fcec0b");
		// lastPick.object.material[1].color.set("#fcec0b");
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
	let v = new THREE.Vector3(0, -10, 0);
	controls.target = v;
	camera.lookAt(v);
	//todo 1.controls失效,添加了这个监听事件就可以了  2.周边黄色边框隐藏
	controls.addEventListener("change", function () {
		render.render(scene, camera); //执行渲染操作
	}); //监听鼠标、键盘事件
};

const setCamera = () => {
	camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 80;
	camera.position.x = 0;
	camera.position.y = -10;
	// camera.position.z = 60;
};
const setRender = () => {
	render = new THREE.WebGLRenderer();
	render.setSize(window.innerWidth, window.innerHeight);
	render.setClearColor(0x020212, 1.0);
	document.body.appendChild(render.domElement);
};
const setLight = () => {
	const light = new THREE.AmbientLight(0xffffff);
	scene.add(light);
};

const addTweenEsa = (mesh) => {
	//核心代码 mesh 是使用three.js 建立的一个网格模型
	EsaTween = new TWEEN.Tween(mesh.position)
		.to({ x: 30, y: 0, z: 0 }, 2000) //改变当前模型的位置
		.delay(1000) //开始时的延迟
		.yoyo(true) //是否开启yoyo循环
		.easing(TWEEN.Easing.Elastic.InOut) //运动曲线
		.repeat(Infinity); //重复次数
	EsaTween.start(); //开启动画
};

const setBox = () => {
	const geometry = new THREE.BoxGeometry();
	const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	// 添加TWEEN动画
	addTweenEsa(cube);
	setAnimations();
};
const setAnimations = () => {
	requestAnimationFrame(setAnimations);
	// 动画调用一定要requestAnimationFrame执行  TWEEN.update();
	TWEEN.update();
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	setRenders();
};
const setRenders = () => {
	render.render(scene, camera);
};

const generateGeometry = (jsondata) => {
	// 初始化一个地图对象
	map = new THREE.Object3D();

	// console.log(123, jsondata);

	jsondata.features.forEach((elem, index) => {
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

				// console.log("elem", elem);
				const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
				var colorArr = ["#0465BD", "#357bcb", "#3a7abd"];
				const material = new THREE.MeshBasicMaterial({
					// color: "#2defff",
					color: colorArr[index % 3],
					transparent: true,
					// opacity: 0.8,
					opacity: 1,
				});
				const material1 = new THREE.MeshBasicMaterial({
					color: "#3480C4",
					transparent: true,
					opacity: 0.5,
				});

				const mesh = new THREE.Mesh(geometry, [material, material1]);
				if (index % 2 === 0) {
					mesh.scale.set(1, 1, 1.2);
				}
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
		// console.log("scene is null");
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
