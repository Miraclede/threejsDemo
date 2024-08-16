<!-- 知识点 Three.Group / 添加为子组件A.add(B) /控制对象的visible属性-->
<script setup>
import { onMounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

let scene, camera, renderer,stats;
var balls=[];
var circles=[]


function setStats(){
      stats=new Stats();
      stats.domElement.style.position='absolute';
      stats.domElement.style.left='0';
      stats.domElement.style.top='0';
      document.body.appendChild(stats.domElement);
}

const initLight = () => {
	const light = new THREE.DirectionalLight(0xffffff, 3);
	light.position.set(0, 50, 50);
	scene.add(light);
};

var deg=Math.PI/2;
function ballAnim(){
      deg+=1/6*Math.PI/180;//每次转动1/6度
      balls.forEach((ball,index)=>{
      var ballDeg=3*deg/(index+1);//根据索引值设置每个球体转动不同的角度
      ball.position.x=Math.sin(ballDeg)*circles[index];
      ball.position.z=Math.cos(ballDeg)*circles[index];
    })
}

function getColor(){
          //定义字符串变量colorValue存放可以构成十六进制颜色值的值
      var colorValue="0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f";
          //以","为分隔符，将colorValue字符串分割为字符数组["0","1",...,"f"]
       var colorArray = colorValue.split(",");
       var color="#";//定义一个存放十六进制颜色值的字符串变量，先将#存放进去
        //使用for循环语句生成剩余的六位十六进制值
        for(var i=0;i<6;i++){
           //colorArray[Math.floor(Math.random()*16)]随机取出
           // 由16个元素组成的colorArray的某一个值，然后将其加在color中，
           //字符串相加后，得出的仍是字符串
           color+=colorArray[Math.floor(Math.random()*16)];
       }
       return color;
}


function initball(){
   for(var i=2;i<10;i++){
       var geometry=new THREE.SphereGeometry(2+i/2,22,16);
       var material=new THREE.MeshLambertMaterial({color:getColor()})
       var ball=new THREE.Mesh(geometry,material);
       ball.position.set(10*i,0,0);
       scene.add(ball);
       balls.push(ball)
     }
 }


function initCycle(){
    // 使用 BufferGeometry 画圆环
    for (var j = 2; j < 10; j++) {
        var radius = 10 * j;
        var curve = new THREE.EllipseCurve(
            0, 0, // ax, aY
            radius, radius, // xRadius, yRadius
            0, 2 * Math.PI, // aStartAngle, aEndAngle
            false, // aClockwise
            0 // aRotation
        );

        var points = curve.getPoints(32); // 32 分段数，可以根据需要调整
        var lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // 使用 LineLoop 或者 LineSegments，这里使用 LineLoop 闭合线条
        var material = new THREE.LineBasicMaterial({ color: 0xffa500 });
        var cycleMesh = new THREE.LineLoop(lineGeometry, material);
		cycleMesh.rotateX(Math.PI/2);

        // 注意：如果使用 LineLoop 并且想在 WebGL2 中正确显示，需要确保引入并使用对应的渲染器设置
        // 如果使用 WebGL1，可能需要降级到 THREE.LineSegments

        cycleMesh.position.set(0, 0, 0);
        scene.add(cycleMesh);
        circles.push(radius);
    }
}

onMounted(() => {
	const wxGeometry = new THREE.SphereGeometry(2, 28, 22);
	const xxGeometry = new THREE.SphereGeometry(10, 28, 22);
	const hxGeometry = new THREE.SphereGeometry(12, 28, 22);

	const cubeA = new THREE.Mesh(wxGeometry, new THREE.MeshLambertMaterial({ color: 0xffffff }));
	cubeA.position.set(10, 10, 0);
	const cubeB = new THREE.Mesh(xxGeometry, new THREE.MeshLambertMaterial({ color: 0x0000ff }));
	cubeB.position.set(-500, 480, 200);
	const cubeC = new THREE.Mesh(hxGeometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));
	cubeB.position.set(0, 0, 0);




	//Three.Group 组合
	// const group = new THREE.Group();
	// group.add(cubeA);
	// group.add(cubeB);

	// cubeB.add(cubeA);
	// cubeC.add(cubeB)

	scene = new THREE.Scene();
	// scene.add(group);
	scene.add(cubeC);
	// scene.add(cubeA);
	// scene.add(cubeB);
	// scene.add(new THREE.AxesHelper(5));
	// scene.add(new THREE.GridHelper(10, 10));
	setStats();
	initLight();
	initball();
	initCycle();

	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(100, 200, 150);
	scene.add(camera);
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("container").appendChild(renderer.domElement);
	renderer.render(scene, camera);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.addEventListener("change", function () {
		// console.log(123, mesh.position);
		renderer.render(scene, camera); //重绘
		// console.log(567, camera.position);
	});


	const render = function () {
		ballAnim();
		stats.update();
		requestAnimationFrame(render);
			//控制 cubeA绕着CubeB旋转
			// cubeA.rotation.x = Math.cos(Date.now() * 0.0001)*1
			// cubeA.rotation.z = Math.sin(Date.now() * 0.0001)*1
			// cubeB.rotation.z += 0.01;
			// cubeB.rotation.x = Math.cos(Date.now() * 0.0001)*15
			// cubeB.rotation.z = Math.sin(Date.now() * 0.0001)*15
			cubeC.rotation.y += 0.005;
			// cubeC.visible = false;
			// cubeB.rotation.x += 0.001;
			// cubeB.rotation.z += 0.001;

		renderer.render(scene, camera);
	};
	render();

});

window.onresize = function () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
};

</script>

<template>
	<div id="container"></div>

	<div id="info">
		<a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> webgl - animation - keyframes<br />
		Model: <a href="https://artstation.com/artwork/1AGwX" target="_blank" rel="noopener">Littlest Tokyo</a> by <a href="https://artstation.com/glenatron" target="_blank" rel="noopener">Glen Fox</a>, CC Attribution.
	</div>
</template>

<style lang="scss" scoped>
body {
	background-color: #bfe3dd;
	color: #000;
}

a {
	color: #2983ff;
}
</style>
