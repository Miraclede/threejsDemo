<!--知识点 GUI  GSAP  -->
<template>
	<div style="background-color: #345678; box-sizing: border-box">
		<div class="myTest" id="myTest"></div>
		<div v-if="module == 0" class="gsapClass" style="width: 100px; height: 100px; background-color: green; border-radius: 20px; margin-top: 50px"></div>
		<test v-if="module == 1"></test>
		<testGltf v-if="module == 2"></testGltf>
		<testFullView v-if="module == 3"></testFullView>
		<test3DMap v-if="module == 4"></test3DMap>
		<test3DMapLignt v-if="module == 5"></test3DMapLignt>
		<test3DMapPoint v-if="module == 6"></test3DMapPoint>
		<testFirstPersonControl v-if="module == 7"></testFirstPersonControl>
		<testbasic v-if="module == 8"></testbasic>
		<testRaycaster v-if="module == 9"></testRaycaster>
		<testMove v-if="module == 10"></testMove>
		<testShader v-if="module == 11"></testShader>
		<testGlass v-if="module == 12"></testGlass>
		<testMyView v-if="module == 13"></testMyView>
		<testDom v-if="module == 14"></testDom>
		<testDom3 v-if="module == 15"></testDom3>
	</div>
</template>

<script setup>
import test from "/src/views/mytest/module/test.vue";
import testFullView from "./module/testFullView.vue";
import test3DMap from "/src/views/mytest/module/test3DMap.vue";
import testGltf from "./module/testGltf.vue";
import test3DMapLignt from "./module/test3DMap1.vue";
import test3DMapPoint from "./module/test3DMap2.vue";
import testFirstPersonControl from "./module/testFirstPersonControl.vue";
import testbasic from "./module/testbasic.vue";	
import testRaycaster from "./module/testRaycaster.vue";
import testMove from "./module/testMove.vue";
import testShader from "./module/testShader.vue";
import testGlass from "./module/testGlass.vue"
import testMyView from "./module/testMyView.vue";
import testDom from "./module/testDom.vue"
import testDom3 from "./module/testDom3.vue"

import { onMounted, watch, ref } from "vue";
import * as THREE from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
// 相机旋转 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
const module = ref(0);
//创建一个对象，对象属性的值可以被GUI库创建的交互界面改变
const obj = {
	x: 30,
	y: 50,
	z: 20,
	color: 0x0000ff,
	mTransparent: true,
	gXLength: 60,
	mRotate: false,
	changeModule: 0,
};

var camera = null;
const renderer = new THREE.WebGLRenderer();
onMounted(() => {
	// console.log("mounted");
	// console.log("查看当前屏幕设备像素比", window.devicePixelRatio);

	// 引入工具gui
	const gui = new GUI();
	const testGui = gui.addFolder("testGui模型");
	testGui.close();

	// gui.domElement.style.right = "2000px";
	gui.domElement.style.width = "300px";

	// gui增加交互界面，用来改变obj对应属性
	testGui
		.add(obj, "x", -100, 100)
		.name("红轴")
		.onChange(function (value) {
			guiXYZChanged();
		});
	testGui
		.add(obj, "y", -100, 100)
		.name("绿轴")
		.onChange(function (value) {
			guiXYZChanged();
		});
	testGui
		.add(obj, "z", -100, 100)
		.name("蓝轴")
		.onChange(function (value) {
			guiXYZChanged();
		});

	// 场景 对象 相机 渲染器
	const scene = new THREE.Scene();

	const geometry = new THREE.BoxGeometry(60, 30, 15); //创建一个立方体几何对象Geometry

	const material = new THREE.MeshLambertMaterial({
		color: 0xff0000,
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide, //两面可见
	}); //材质对象Material
	const material1 = new THREE.MeshLambertMaterial({
		color: 0x0000ff,
		transparent: true,
		opacity: 0.5,
		side: THREE.DoubleSide, //两面可见
	}); //材质对象Material

	const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
	mesh.position.set(0, 0, 0);
	// mesh.position.set(30, 50, 20);
	scene.add(mesh); //网格模型添加到场景中

	const mesh1 = new THREE.Mesh(geometry, material1); //网格模型对象Mesh

	mesh1.position.set(110, 50, 20);
	// mesh.position.set(30, 50, 20);
	scene.add(mesh1); //网格模型添加到场景中

	/* 辅助光源 */
	const ambient = new THREE.AmbientLight(0xffffff, 1.0);
	scene.add(ambient);

	/* 辅助网格 */
	const size = 1000;
	const divisions = 20;

	const gridHelper = new THREE.GridHelper(size, divisions);
	scene.add(gridHelper);

	/* Gui 改变光强度  改变任何属性 */
	testGui
		.add(ambient, "intensity", 0, 2.0)
		.name("环境光强度")
		.step(0.002)
		.onChange(function (value) {
			guiXYZChanged();
		});

	testGui.addColor(obj, "color").onChange(function (value) {
		// console.log(567, value);
		if (value) {
			mesh.material.color.set(value);

			guiXYZChanged();
		}
	});

	testGui
		.add(obj, "mTransparent", ["透明", "不透明"])
		.name("材质透明")
		.onChange(function (value) {
			mesh.material.transparent = value == "透明";
			guiXYZChanged();
		});

	testGui
		.add(obj, "gXLength", { 短: 20, 中: 60, 长: 120 })
		.name("模型红长")
		.onChange(function (value) {
			mesh.geometry = new THREE.BoxGeometry(value, 30, 15);
			// mesh.position.set(0, 0, 0);
			// mesh.position.set(30, 50, 20);
			scene.add(mesh); //网格模型添加到场景中
			guiXYZChanged();
		});

	// test gasp js动画工具 start

	gsap.to(".gsapClass", { x: 600, duration: 10, rotate: 360 });

	gsap.to(mesh.position, { x: 10000, duration: 10 });

	// test gasp js动画工具 end

	var timer = 0;
	var scaleNum = 0;
	testGui
		.add(obj, "mRotate")
		.name("旋转")
		.onChange(function (value) {
			if (value) {
				function render() {
					timer = requestAnimationFrame(function () {
						if (value) {
							mesh.rotateY(0.01);
							//mesh 放缩
							scaleNum += 0.001;
							mesh.scale.set(scaleNum, 1, 1);
							renderer.render(scene, camera); //重绘
							render();
						}
					});
				}
				render();
			} else {
				// console.log("123 Timer", timer);
				cancelAnimationFrame(timer);
				// console.log("123 clearTimer", timer);
				timer = 0;
			}
		});

	var GuiTest = ref(null);
	gui.add(obj, "changeModule", { testGui模型: 0, test相机成像: 1, testGltf导入外部: 2, testFullView全景: 3, test3DMap: 4, test3DMapLight: 5, test3DMapPoint: 6,testFirstPersonControl:7,testbasic基础成像:8,testRaycaster光线投影:9 ,testMove星系:10,testShader着色器:11,testGlass材质:12,testMyView引入设计Model:13,testDomCss2d:14,testDom3_Css3d:15})
		.name("更换模型")
		.onChange(function (value) {
			module.value = value;

			//保留body中最新的canvas
			let canvasArr = document.querySelectorAll("canvas");

			if (module.value == 0) {
				document.body.appendChild(GuiTest.value);
			}
			if (canvasArr.length > 0) {
				if (!GuiTest.value) {
					GuiTest.value = canvasArr[0];
					document.body.removeChild(canvasArr[0]);
				} else {
					document.body.removeChild(canvasArr[0]);
				}
			}
		});

	const dir = new THREE.Vector3(1200, 5000, 0);

	/**辅助:箭头
	 * 参数  (途径点,起点,长度,颜色)
	 */
	dir.normalize();

	const origin = new THREE.Vector3(0, 0, 0);
	const length = 100;
	const hex = 0xffff00;

	const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex);
	scene.add(arrowHelper);

	/**辅助:坐标系 */
	const axesHelper = new THREE.AxesHelper(150);
	scene.add(axesHelper);

	camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
	// const camera = new THREE.PerspectiveCamera();
	camera.position.set(500, 500, 500);
	// camera.position.set(200, 200, 200);
	camera.lookAt(0, 0, 0); //坐标原点

	renderer.setSize(window.innerWidth, window.innerHeight);
	// console.log(567, window.innerWidth, window.innerHeight);
	renderer.setClearColor(0x345678); //设置背景颜色
	renderer.render(scene, camera);
	document.body.appendChild(renderer.domElement);
	// console.log(123, camera.position);

	// 辅助:相机轨道

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		mesh.position.set(obj.x, obj.y, obj.z);
		// console.log(123, mesh.position);
		renderer.render(scene, camera); //重绘
		// console.log(567, camera.position);
	});

	/* guiXYZ */
	const guiXYZChanged = () => {
		mesh.position.set(obj.x, obj.y, obj.z);
		// console.log(123, mesh.position);
		renderer.render(scene, camera); //重绘
	};

	const render = () => {
		gsap.to(mesh.position, { x: 50, z: 40, duration: 10 });
		renderer.render(scene, camera);
		requestAnimationFrame(render);
	};
	render();
});

//保证窗口大小变化时,画布,相机尺寸变化
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
});

// 双击实现全屏/退出全屏
window.addEventListener("dblclick", () => {
	const fullScreenElement = document.fullscreenElement;
	if (!fullScreenElement) {
		renderer.domElement.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
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
