<template>
    <div class="tPage">
        <div class="artical">
            <div class="artical-title">什么是 three.js </div>
            <div class="artical-body">
                <p class="a-item">作用：Web页面的交互界面,呈现3D效果</p>
                <div class="a-item">原理：基于<span class="a-red">WebGL</span>,
                    <div style="display: inline-block;padding: 4px 6px;background-color: rgba(10, 204, 250,.5);">
                        【场景】 + 【相机】 ==<span style="font-size:12px;">渲染</span>==> 【结果】
                    </div>
                </div>
                <div class="a-item">
                    兼容性：<img src="@/assets/imgs/webgl.png" class="a-img" style="margin-top:6px;width:800px;" alt=""/>
                </div>
                
                <p class="a-item">中文教程 ：<a href="http://www.webgl3d.cn/" target="_blank">http://www.webgl3d.cn/</a></p>
                <p class="a-item">API查询 ：<a href="https://threejs.org/docs/index.html#manual/zh/introduction/Installation" target="_blank">https://threejs.org/docs/index.html#manual/zh/introduction/Installation</a></p>
                
            </div>
        </div>
        <div class="artical">
            <div class="artical-title">使用 three.js</div>
            <div class="artical-body">
                <p class="c-item">
                    安装：<code>npm install three --save</code>
                </p>
                <p class="c-item">
                    引入：<code>import * as THREE from 'three'</code>
                </p>
            </div>
        </div>
        <div class="artical">
            <div class="artical-title">实现过程</div>
            <div class="artical-body">
                <p class="a-item">1.创建场景：</p>
                <div class="myCode">
                    <p class="a-item">
                        <span class="keyword">scene</span> = <span class="reserve">new </span> 
                        <span class="superFn">THREE</span>.<span class="variable">Scene</span>
                        <span class="symbol">( )</span>;
                    </p>
                </div>
                <p class="a-item">2.创建相机：</p>
                <div class="myCode">
                    <p class="a-item"><code>
                        <span class="keyword">camera</span> = <span class="reserve">new </span> 
                        <span class="superFn">THREE</span>.<span class="variable">PerspectiveCamera</span>
                        <span class="symbol">( )</span>;
                        <span class="string">//透视相机，模拟人眼</span></code>
                    </p>
                    <p class="a-item"><code>
                        <span class="keyword">camera</span>.<span class="keyword">position</span>.<span class="fn">set</span><span class="symbol">(</span>
                        0, 500, 500
                        <span class="symbol">)</span>;<span class="string"> // 设置相机位置</span></code>
                    </p>
                    <p class="a-item"><code>
                        <span class="keyword">camera</span>.<span class="keyword">lookAt</span><span class="symbol">(</span>
                        0, 0, 0
                        <span class="symbol">)</span>;<span class="string"> //指向坐标原点</span>
                    </code></p>
                </div>
                <p class="a-item">3.渲染：</p>
                <div class="myCode">
                    <p class="a-item"><code>
                        <span class="keyword">camera</span> = <span class="reserve">new </span> 
                        <span class="superFn">THREE</span>.<span class="variable">WebGLRenderer</span>
                        <span class="symbol">( )</span>;
                        </code>
                    </p>
                    <p class="a-item"><code>
                        <span class="keyword">renderer</span>.<span class="fn">setSize</span><span class="symbol">(</span>
                        1000, 600
                        <span class="symbol">)</span>;<span class="string"> // 设置渲染区域尺寸</span></code>
                    </p>
                    <p class="a-item"><code>
                        <span class="keyword">document</span>.<span class="fn">getElementById</span><span class="symbol">(</span>
                        'webgl3'
                        <span class="symbol">)</span>.<span class="fn">appendChild</span><span class="symbol">(</span>
                        renderer.domElement<span class="symbol">)</span>;
                    </code>
                    </p>
                </div>
                
            </div>
            <div class="artical-body">
                <p class="a-item">
                    <button @click="setAxisHelper" class="tool-btn">坐标辅助线</button>
                    <button @click="setGridHelper" class="tool-btn">网格辅助线</button>
                    <button @click="addModels" class="tool-btn">添加模型</button>
                </p>
                <div id="threeSceneGL" style="width: 1000px;height:600px;border:1px solid #eee;"></div>
                <p class="a-item">1.因为是canvas操作，应该在页面渲染完以后调用，如vue3框架在 onMounted 方法里面执行</p>
                <p class="a-item">2.辅助线，帮助模型定位</p>
                <p class="a-item">3.没有光线时，将看不到模型的表面；只添加环境光，模型可能是灰暗的，可以多加平行光</p>
                <p class="a-item">
                    4.函数<span class="a-blue">requestAnimationFrame</span>可以实现周期性渲染，
                    类似定时器的一个方法，但它的执行取决于浏览器，不会出现丢帧和卡顿的现象。
                    结束执行为<span class="a-blue">cancelAnimationFrame</span>
                </p>
            </div>
        </div>
        <div class="artical">
            <div class="artical-title">导入模型</div>
            <div class="artical-body">
                <p class="a-item">
                    <router-link :to="{path:'/projects/co2'}" target="_blank">二氧化碳设备</router-link>
                </p>
                <p class="a-item">
                    <router-link :to="{path:'/projects/co2Second'}" target="_blank">建筑楼层</router-link>
                </p>
                <p class="a-item">
                    <router-link :to="{path:'/projects/fullViewRoom'}" target="_blank">全景房间</router-link>
                </p>
            </div>
        </div>
        <div class="artical">
            <div class="artical-title">gui</div>
            <div class="artical-body">
                <p class="a-item">
                    <router-link :to="{path:'/myGui'}" target="_blank">Gui模型</router-link>
                </p>
            </div>
        </div>
        <!-- <div class="artical">
            <div class="artical-title">小建议</div>
            <div class="artical-body">
                <p class="a-item">出现文字频繁切换显示时，可以采用显示隐藏的方式切换 </p>
                <p class="a-item">所有的初始化方法，应该在页面渲染完以后调用，即在 onMounted 方法里面执行</p>
                <p class="a-item">所有模型，都尽量暴露出来，方便后续的操作</p>
            </div>
        </div> -->
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router'
import * as THREE from 'three';
import * as echarts from "echarts";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let scene = null; //场景
let c_width = 1000; //场景的宽
let c_height = 600; //场景的高
let camera = null; //相机
let renderer = null; //渲染器
let raycaster = new THREE.Raycaster(); //创建一个射线，鼠标点击时使用
let gridHelpers = null; //辅助线
let axisHelper = null; //坐标线
let lightCtrl = null; //光线

let cube1 = null;
let cube2 = null;
let cube3 = null;
let cube4 = null;
let ball1 = null;
let ball2 = null;
let ball3 = null;
let ball4 = null;
let coneObj = null;

const router = useRouter()

/**创建场景 */
const initScene = ()=>{
    scene = new THREE.Scene();
}

/**创建相机 */
const initCamera = ()=>{
    // let camera = new THREE.OrthographicCamera(-c_s*c_k, c_s*c_k, c_s, -c_s, 1, 2000);//正交投影相机对象,地图时使用
    camera = new THREE.PerspectiveCamera(); //透视相机，模拟人眼
    camera.position.set(0, 800, 800);// 设置相机位置
    camera.lookAt(0, 0, 0);//指向坐标原点
}

/**创建光源 */
let directionalLights = null;
let directionalLights2 = null;
let directionalLights3 = null;
let directionalLights4 = null;
let ambientLights = null;
const initLights = ()=>{
    // 点光源
    // var pointLights = new THREE.PointLight(0xff00ff, 1); //点光源
    // pointLights.position.set(0,200,200); //光源位置
    // scene.add(pointLights); //点光源添加到场景中
    // // 点光源辅助观察
    // const pointLightHelper = new THREE.PointLightHelper(pointLights, 10);
    // scene.add(pointLightHelper);
    // 平行光
    directionalLights = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights.position.set(0, 200, 200);
    scene.add(directionalLights);
    directionalLights2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights2.position.set(0, 200, -200);
    scene.add(directionalLights2);
    directionalLights3 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights3.position.set(200, 200, 0);
    scene.add(directionalLights3);
    directionalLights4 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights4.position.set(-200, 200, 0);
    scene.add(directionalLights4);
    // 平行光辅助观察
    // const dirLightHelper = new THREE.DirectionalLightHelper(directionalLights, 5,0xff0000);
    // scene.add(dirLightHelper);
    //环境光
    ambientLights = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLights);
}

/**创建渲染 */
const initRender = ()=>{
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(c_width, c_height); //设置渲染区域尺寸
    renderer.setClearColor(0xb9d3ff, 0); //设置背景颜色
    document.getElementById('threeSceneGL').appendChild(renderer.domElement);
    doRendering();
    new OrbitControls(camera, renderer.domElement);//创建控件对象
}
/**鼠标操作后渲染 */
const doRendering = ()=>{
    renderer.render(scene,camera);//执行渲染操作
    requestAnimationFrame(doRendering);
}
/**辅助坐标系 */
let axisHelperCtrl = false;
const setAxisHelper = ()=>{
    axisHelperCtrl = !axisHelperCtrl;
    if(axisHelperCtrl){
        axisHelper = new THREE.AxesHelper(450); // 参数450表示坐标系大小，可以根据场景大小去设置
        scene.add(axisHelper);
    }else{
        scene.remove(axisHelper)
        axisHelper = null
    }
}

/**底部网格 */
let gridHelperCtrl = false;
const setGridHelper = ()=> {
    gridHelperCtrl = !gridHelperCtrl;
    if(gridHelperCtrl){
        gridHelpers = new THREE.GridHelper(600, 60, 0xdddddd, 0xdddddd);
        scene.add(gridHelpers)
    }else{
        scene.remove(gridHelpers)
        gridHelpers = null
    }
}



onMounted(()=>{

    initScene();
    initCamera();
    // initLights();
    initRender();
    setAxisHelper();
    setGridHelper();

    addDomEventListener();
})


const addModels = ()=>{
    addCube();
    addCube2();
    addCube3();
    addCube4();
    addBall();
    addBall2();
    addBall3();
    addBall4();
    addLights();
}

const addCube = ()=>{
    if(cube1==null){
        let geometry = new THREE.BoxGeometry(60, 10, 60); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0xeeeeee,
        }); //材质对象Material
        cube1 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        cube1.position.set(0,30,0);
        scene.add(cube1); //网格模型添加到场景中

    }else{
        // scene.remove(cube1)
        // cube1 = null
    }
}

const addCube2 = ()=>{
    if(cube2==null){
        let geometry = new THREE.BoxGeometry(30, 10, 30); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0xeeeeee,
        }); //材质对象Material
        cube2 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        cube2.position.set(0,30,100);
        scene.add(cube2); //网格模型添加到场景中

    }else{
        // scene.remove(cube1)
        // cube1 = null
    }
}

const addCube3 = ()=>{
    if(cube3==null){
        let geometry = new THREE.BoxGeometry(30, 10, 30); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0xeeeeee,
        }); //材质对象Material
        cube3 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        cube3.position.set(100,30,0);
        scene.add(cube3); //网格模型添加到场景中

    }else{
        // scene.remove(cube1)
        // cube1 = null
    }
}
const addCube4 = ()=>{
    if(cube4==null){
        let geometry = new THREE.BoxGeometry(30, 10, 30); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0xeeeeee,
        }); //材质对象Material
        cube4 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        cube4.position.set(100,30,100);
        scene.add(cube4); //网格模型添加到场景中

    }else{
        // scene.remove(cube1)
        // cube1 = null
    }
}

const addBall = ()=>{
    if(ball1==null){
        let geometry = new THREE.SphereGeometry(20, 10, 60); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0x33F0FF,
        }); //材质对象Material
        ball1 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        ball1.position.set(0,60,0);
        ball1.name = 'ball1';
        scene.add(ball1); //网格模型添加到场景中

    }
}
const addBall2 = ()=>{
    if(ball2==null){
        let geometry = new THREE.SphereGeometry(10, 10, 60); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0x33FFDC,
        }); //材质对象Material
        ball2 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        ball2.position.set(0,60,100);
        scene.add(ball2); //网格模型添加到场景中

    }
}
const addBall3 = ()=>{
    if(ball3==null){
        let geometry = new THREE.SphereGeometry(10, 10, 60); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0x33FFDC,
        }); //材质对象Material
        ball3 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        ball3.position.set(100,60,0);
        scene.add(ball3); //网格模型添加到场景中

    }
}
const addBall4 = ()=>{
    if(ball4==null){
        let geometry = new THREE.SphereGeometry(10, 10, 60); //创建一个立方体几何对象Geometry
        let material = new THREE.MeshLambertMaterial({
            color: 0x33FFDC,
        }); //材质对象Material
        ball4 = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        ball4.position.set(100,60,100);
        scene.add(ball4); //网格模型添加到场景中

    }
}

const addLights = ()=>{
    if(coneObj==null){
        let geometry = new THREE.ConeGeometry(10, 20, 60); //创建一个立方体几何对象Geometry
        geometry.rotateX(Math.PI);
        geometry.rotateY(Math.PI/4);
        let material = new THREE.MeshLambertMaterial({
            color: 0xF6FF33,
        }); //材质对象Material
        coneObj = new THREE.Mesh(geometry, material); //网格模型对象Mesh
        coneObj.position.set(200,400,0);
        coneObj.name = 'coneObj'
        scene.add(coneObj); //网格模型添加到场景中
    }
}

const setLights = ()=>{
    if(ambientLights==null){
        initLights();

    }else{
        scene.remove(directionalLights)
        scene.remove(directionalLights2)
        scene.remove(directionalLights3)
        scene.remove(directionalLights4)
        scene.remove(ambientLights)
        directionalLights = null;
        directionalLights2 = null;
        directionalLights3 = null;
        directionalLights4 = null;
        ambientLights = null;
    }
}

// 旋转
let redAnimationFrame = null;
const clock = new THREE.Clock();
const doRotate = ()=>{
    const elapsedTime = clock.getElapsedTime();
    ball1.rotation.y = elapsedTime;
    ball1.rotation.y = elapsedTime;
    renderer.render(scene, camera);
    redAnimationFrame = requestAnimationFrame(doRotate);
}
// 停止旋转
const stopRotate = ()=>{
    redAnimationFrame && cancelAnimationFrame(redAnimationFrame)
}

let lightOn = false;
let ballRateOn = false;
const addDomEventListener = ()=>{
    renderer.domElement.addEventListener('click', function (event) {
        // .offsetY、.offsetX以canvas画布左上角为坐标原点,单位px
        const px = event.offsetX;
        const py = event.offsetY;
        //屏幕坐标px、py转WebGL标准设备坐标x、y
        //width、height表示canvas画布宽高度
        const x = (px / c_width) * 2 - 1;
        const y = -(py / c_height) * 2 + 1;
        //创建一个射线投射器`Raycaster`
        // const raycaster = new THREE.Raycaster();
        //.setFromCamera()计算射线投射器`Raycaster`的射线属性.ray
        // 形象点说就是在点击位置创建一条射线，射线穿过的模型代表选中
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        // raycaster.ray.origin = new THREE.Vector3(0, 0, 0);
        // raycaster.ray.direction = new THREE.Vector3(100, 0, 10);
        //.intersectObjects([mesh1, mesh2, mesh3])对参数中的网格模型对象进行射线交叉计算
        // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
        const intersects = raycaster.intersectObjects([coneObj, ball1]);
        // intersects.length大于0说明，说明选中了模型
        if (intersects.length > 0) {
            if(intersects[0].object.name == 'ball1'){
                ballRateOn = !ballRateOn;
                if(ballRateOn){
                    doRotate();
                }else{
                    stopRotate();
                }

            }else if(intersects[0].object.name == 'coneObj'){
                lightOn = !lightOn;
                if(lightOn){
                    coneObj.material.color.set(0xF6FF33);
                    setLights();

                }else{
                    coneObj.material.color.set(0x000000);
                    setLights();
                }
            }
        }
    })
}

</script>

<style lang="scss" scoped>
.myCode{
    width: 860px;
    padding: 10px;
    color: #eee;
    background-color: #000;

    .keyword{
        color: #6BEBF8;
    }
    .symbol{
        color: #E84BF3;
    }
    .reserve{
        color: #0981DB;
    }
    .superFn{
        color: #6BA8F8;
    }
    .variable{
        color: #0CE87B;
    }
    .string{
        font-weight: bolder;
        color: green;
    }
    .fn{
        color: #F4FA0A;
    }
}
.artical{
    margin: 10px 0 30px;

    .artical-title{
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: bolder;
        color: #135ce0;
    }
    .artical-body{
        padding-left: 32px;
    }
    .a-red{
        color: red;
        font-style: italic;
    }
    .a-blue{
        color: blue;
    }
    .a-img{
        vertical-align: top;
    }
    .a-item{
        margin: 4px 0;
    }
}
</style>