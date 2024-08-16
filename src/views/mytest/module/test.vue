<!-- three.js
	渲染三要素: secene,camera,renderer
-->
<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
// 相机旋转 引入轨道控制器扩展库OrbitControls.js
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* 必要辅助方法 */
const fAssist = (renderer, scene, camera, mesh) => {
	/**辅助:坐标系 */
	const axesHelper = new THREE.AxesHelper(150);
	scene.add(axesHelper);

	/**点辅助:加光源 */
	fLight(scene);

	// renderer.render(scene, camera);

	// 辅助:threejs旋转动画
	// 渲染函数
	function render() {
		renderer.render(scene, camera) ;//执行渲染操作
		// mesh.rotateY(0.01); //每次绕y轴旋转0.01弧度
		requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧
	}
	render();

	// 辅助:相机轨道
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		renderer.render(scene, camera); //重绘
		
		console.log(567, camera.position);
	});
	// controls.target = new THREE.Vector3(4200, 2200, 4200); //设置控制点
	controls.update();
};

/* 局部渲染 */
const fPartRender = (mesh, scene, camera) => {
	const width = 800;
	const height = 500;

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	renderer.render(scene, camera);

	fAssist(renderer, scene, camera, mesh);

	document.getElementById("myTest").appendChild(renderer.domElement);

	/**计算两帧 */
	// 渲染循环
	/* 	const clock = new THREE.Clock();
	function render() {
		const spt = clock.getDelta() * 1000; //毫秒
		console.log("两帧渲染时间间隔(毫秒)", spt);
		console.log("帧率FPS", 1000 / spt);
		renderer.render(scene, camera); //执行渲染操作
		mesh.rotateY(0.01); //每次绕y轴旋转0.01弧度
		requestAnimationFrame(render); //请求再次执行渲染函数render，渲染下一帧
	}
	render(); */
};

/* 全局渲染 */
const fFullRender = (scene, camera, mesh) => {
	const width = window.innerWidth; //窗口文档显示区的宽度作为画布宽度
	const height = window.innerHeight; //窗口文档显示区的高度作为画布高度
	const renderer = new THREE.WebGLRenderer({
		antialias: true, // 开启抗齿锯
		devicePixelRatio: window.devicePixelRatio, // 设置设备像素比为1，防止canvas画布被放大，导致模糊

	});
	renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比为1，防止canvas画布被放大，导致模糊
	renderer.setClearColor(0x345678); //设置背景颜色
	renderer.setSize(width, height);
	renderer.render(scene, camera);
	document.body.appendChild(renderer.domElement);

	fAssist(renderer, scene, camera, mesh);

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
};

/* 辅助灯光 */
const fLight = (scene) => {
	//点光源
	/* 
		const pointLight = new THREE.PointLight(0xffffff, 1000000.0);
	pointLight.position.set(200, 200, 100); //点光源放在x轴上
	// pointLight.decay = 0.0;//设置光源不随距离衰减
	scene.add(pointLight); //点光源添加到场景中
	 */

	//环境光:没有特定方向，整体改变场景的光照明暗
	/* 
		const ambient = new THREE.AmbientLight(0xffffff, 1000);
	scene.add(ambient);
	*/

	// 平行光
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	// 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
	// directionalLight.position.set(80, 100, 50);
	directionalLight.position.set(-4000, 2000, -4000);

	// 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
	// directionalLight.target = mesh;
	directionalLight.target.position.set(0, 0, 0); // 设置target坐标0,0,0

	scene.add(directionalLight);

	// DirectionalLightHelper：可视化平行光

	// const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5, 0xff0000);
	// scene.add(dirLightHelper);
};

onMounted(() => {
	console.log("mounted");
	console.log('查看当前屏幕设备像素比',window.devicePixelRatio);
	// 创建场景和网格模型
	const scene = new THREE.Scene();

	/** 创建一个立方体几何对象Geometry并格模型添加到场景中*/
	/*
	const geometry = new THREE.BoxGeometry(50, 100, 10); //创建一个立方体几何对象Geometry

	const material = new THREE.MeshLambertMaterial({
		color: 0x0000ff,
		transparent: true,
		opacity: 0.5,
	}); //材质对象Material

	const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh

	// mesh.position.set(0, 0, 0);
	mesh.position.set(25, 50, 15);
	scene.add(mesh); //网格模型添加到场景中 
	*/


	// 阵列mesh
	const geometry = new THREE.BoxGeometry(100, 100, 100);
	//材质对象Material
	// const material = new THREE.MeshLambertMaterial({
	const material = new THREE.MeshPhongMaterial({
	// const material = new THREE.MeshBasicMaterial({
		color: 0x00ffff, //设置材质颜色
		transparent: true, //开启透明
		opacity: 0.5, //设置透明度
		side: THREE.DoubleSide, //设置两面可见
		shininess: 20, //高光部分的亮度，默认30
		specular: 0xff0000, //高光部分的颜色
	});
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			const mesh = new THREE.Mesh(geometry, material); //网格模型对象Mesh
			// 在XOZ平面上分布
			mesh.position.set(i * 200, 0, j * 200);
			scene.add(mesh); //网格模型添加到场景中
		}
	}

	// 创建投影相机
	// const camera = new THREE.PerspectiveCamera()
	const camera = new THREE.PerspectiveCamera(22, window.innerWidth / window.innerHeight, 1, 8000);
	// todo 移动相机位置观察图像变化
	// camera.position.set(200, 200, 200)
	// camera.position.set(50, 50, 50)
	// camera.position.set(500, 500, 500);
	camera.position.set(4000, 2000, 4000)
	// camera.position.set(2000, 2000, 2000)
	// camera.lookAt(4200, 2200, 4200)
	// camera.lookAt(mesh.position);

	// 渲染 以下两种方式都可以
	/* 局部渲染 */
	// fPartRender(mesh, scene,camera);

	/* 全局渲染 */
	// fFullRender(scene, camera, mesh);
	fFullRender(scene, camera, null);
});
</script>

<template>
	<div class="myTest" id="myTest"></div>
</template>



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
