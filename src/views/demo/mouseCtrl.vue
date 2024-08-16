<template>
    <div>
        <div style="margin: 20px 100px;">
            <button @click="addModel">添加一个模型</button>
            <button @click="doRotate">开始旋转</button>
            <button @click="stopRotate">停止旋转</button>
            <button @click="changeOneColor">改变颜色</button>
            <button @click="addFonts">添加文字</button>
            <button @click="modifyFonts">修改文字</button>
        </div>
        <div id="webgl3" class="threedContainer"></div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as THREE from 'three';
import * as DAT from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/** 1.创建场景对象Scene*/
var scene = new THREE.Scene();
let modelGroups = [];

/**2.加载模型 */
//创建一个长方体几何对象Geometry
// const geometry1 = new THREE.BoxGeometry(50, 50, 50);
// //创建一个材质对象Material
// const material1 = new THREE.MeshLambertMaterial({
//     color: 0x0000ff,//0xff0000设置材质颜色为红色
//     transparent:true,//开启透明
//     opacity:0.9,//设置透明度
// });
// const mesh1 = new THREE.Mesh(geometry1, material1); //网格模型对象Mesh
// //设置网格模型在三维空间中的位置坐标，默认是坐标原点
// mesh1.position.set(0,0,0);
// scene.add(mesh1);

/** 3.光源设置 */
// 点光源
// var pointLights = new THREE.PointLight(0xff00ff, 1); //点光源
// pointLights.position.set(0,100,0); //光源位置
// scene.add(pointLights); //点光源添加到场景中
// // 点光源辅助观察
// const pointLightHelper = new THREE.PointLightHelper(pointLights, 10);
// scene.add(pointLightHelper);
// 环境光
// var ambientLights = new THREE.AmbientLight(0xffffff); //环境光
// scene.add(ambientLights)
// 平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// 设置光源的方向：通过光源position属性和目标指向对象的position属性计算
directionalLight.position.set(0, 100, 100);
// 方向光指向对象网格模型mesh，可以不设置，默认的位置是0,0,0
// directionalLight.target = mesh;
scene.add(directionalLight);
// DirectionalLightHelper：可视化平行光
// const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5,0xff0000);
// scene.add(dirLightHelper);


/** 4.相机设置 */
const c_width = 1200; //宽度
const c_height = 800; //高度
// 30:视场角度, width / height:Canvas画布宽高比, 1:近裁截面, 3000：远裁截面
const camera = new THREE.PerspectiveCamera(30, c_width / c_height, 1, 3000);
camera.position.set(800, 800, 800);
//相机观察目标指向Threejs 3D空间中某个位置
camera.lookAt(0, 0, 0); //坐标原点

/**4.创建的渲染对象 */
var renderer = new THREE.WebGLRenderer();

onMounted(()=>{
    initRender();
    setAxisHelper();

    creatWalls();
})

//渲染
const initRender = ()=>{
    renderer.setSize(c_width, c_height); //设置渲染区域尺寸
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
    document.getElementById('webgl3').appendChild(renderer.domElement);
    doRendering();
    new OrbitControls(camera, renderer.domElement);//创建控件对象
}
//鼠标操作后渲染
const doRendering = ()=>{
    renderer.render(scene,camera);//执行渲染操作
    requestAnimationFrame(doRendering);
}
// 辅助坐标系
const setAxisHelper = ()=>{
    var axisHelper = new THREE.AxesHelper(450); // 参数450表示坐标系大小，可以根据场景大小去设置
    scene.add(axisHelper);
}

const addModel = ()=>{
    const geometry2 = new THREE.BoxGeometry(50, 50, 50);
    //创建一个材质对象Material
    const material2 = new THREE.MeshLambertMaterial({
        color: 0x00ffff,//0xff0000设置材质颜色为红色
        transparent:true,//开启透明
        opacity:0.9,//设置透明度
    });
    const mesh3 = new THREE.Mesh(geometry2, material2); //网格模型对象Mesh
    mesh3.name = 'cube1'
    //设置网格模型在三维空间中的位置坐标，默认是坐标原点
    mesh3.position.set(100,0,0);
    scene.add(mesh3);
    modelGroups.push(mesh3)
}

const creatWalls = ()=>{
    const geometry1 = new THREE.BoxGeometry(400, 150, 10);
    //创建一个材质对象Material
    const material1 = new THREE.MeshLambertMaterial({
        color: 0x0000ff,
        transparent:true,//开启透明
        opacity:0.5,//设置透明度
    });
    const mesh1 = new THREE.Mesh(geometry1, material1); //网格模型对象Mesh
    //设置网格模型在三维空间中的位置坐标，默认是坐标原点
    mesh1.position.set(0,0,0);
    scene.add(mesh1);
    mesh1.name = 'model1'
    modelGroups.push(mesh1)

    const geometry2 = new THREE.BoxGeometry(10, 150, 400);
    //创建一个材质对象Material
    const material2 = new THREE.MeshLambertMaterial({
        color: 0x00ffff,
        transparent:true,//开启透明
        opacity:0.5,//设置透明度
    });
    const mesh2 = new THREE.Mesh(geometry2, material2); //网格模型对象Mesh
    //设置网格模型在三维空间中的位置坐标，默认是坐标原点
    mesh2.position.set(0,0,0);
    mesh2.name = 'model2'
    scene.add(mesh2);
    modelGroups.push(mesh2)
}

// 旋转
let redAnimationFrame = null;
const doRotate = ()=>{
    const clock = new THREE.Clock();
    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        modelGroups[0].rotation.y = elapsedTime;
        modelGroups[1].rotation.y = elapsedTime;
        renderer.render(scene, camera);
        redAnimationFrame = requestAnimationFrame(animate);
    };
    animate();
}
// 停止旋转
const stopRotate = ()=>{
    redAnimationFrame && cancelAnimationFrame(redAnimationFrame)
}
// 改变颜色
const changeOneColor = ()=>{
    scene.traverse((obj)=>{
        if(obj.name==='model1'){
            obj.material.color.set(0xE74C3C)
        }
    })
}

//添加文字
let textMesh = null;
let textMesh2 = null;
const addFonts = ()=>{
    const fontLoaders = new FontLoader();
    fontLoaders.load('/static/font/FZShuSong-Z01S_Regular.json',(font)=>{
        const fontGeometry = new TextGeometry('控制器',{
            font: font, //.ttf字体文件转换而来， https://www.100font.com/  https://gero3.github.io/facetype.js/
            size: 20, //Float,字体大小,默认100
            height: 0.05, //Float，挤出文本的厚度，默认50
            curveSegments: 12, //Integer(表示文本的)曲线上点的数量，默认12
            bevelEnabled: true, //Boolean,是否开启斜角，默认false
            bevelThickness: 0.01, //Float,文本斜角的深度，默认20
            bevelSize: 0, //Float,斜角与原始文本轮廓之间的延伸距离，默认8
            bevelSegments: 3, //Integer,斜角的分段数，默认3
        })
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
        });
        textMesh = new THREE.Mesh(fontGeometry, material)
        textMesh.position.set(100, 60, 5)
        textMesh.name = 'textNames'
        scene.add(textMesh)
    })
    fontLoaders.load('/static/font/FZShuSong-Z01S_Regular.json',(font)=>{
        const fontGeometry = new TextGeometry('特殊文字',{
            font: font, //.ttf字体文件转换而来， https://www.100font.com/  https://gero3.github.io/facetype.js/
            size: 20, //Float,字体大小,默认100
            height: 0.05, //Float，挤出文本的厚度，默认50
            curveSegments: 12, //Integer(表示文本的)曲线上点的数量，默认12
            bevelEnabled: true, //Boolean,是否开启斜角，默认false
            bevelThickness: 0.01, //Float,文本斜角的深度，默认20
            bevelSize: 0, //Float,斜角与原始文本轮廓之间的延伸距离，默认8
            bevelSegments: 3, //Integer,斜角的分段数，默认3
        })
        const material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
        });
        textMesh2 = new THREE.Mesh(fontGeometry, material)
        textMesh2.position.set(100, 60, 5)
        textMesh2.name = 'textNames2'
        textMesh2.visible = false
        scene.add(textMesh2)
    })
    
}

//修改文字
const modifyFonts = ()=>{
    textMesh.visible = false
    textMesh2.visible = true
}

let cubeCtrl =  false;
renderer.domElement.addEventListener('click', function (event) {
    // .offsetY、.offsetX以canvas画布左上角为坐标原点,单位px
    const px = event.offsetX;
    const py = event.offsetY;
    //屏幕坐标px、py转WebGL标准设备坐标x、y
    //width、height表示canvas画布宽高度
    const x = (px / c_width) * 2 - 1;
    const y = -(py / c_height) * 2 + 1;
    //创建一个射线投射器`Raycaster`
    const raycaster = new THREE.Raycaster();
    //.setFromCamera()计算射线投射器`Raycaster`的射线属性.ray
    // 形象点说就是在点击位置创建一条射线，射线穿过的模型代表选中
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    //.intersectObjects([mesh1, mesh2, mesh3])对参数中的网格模型对象进行射线交叉计算
    // 未选中对象返回空数组[],选中一个对象，数组1个元素，选中两个对象，数组两个元素
    const intersects = raycaster.intersectObjects(modelGroups);
    // intersects.length大于0说明，说明选中了模型
    
    console.log(intersects)
    if (intersects.length > 0) {
        intersects.forEach(element => {
            if(element.object.name=='cube1'){
                cubeCtrl = !cubeCtrl
                if(cubeCtrl){
                    element.object.material.color.set(0xff0000)
                    alert('开')
                }else{
                    element.object.material.color.set(0x00ff00)
                    alert('关')
                }
            }
        });
    }
})

</script>

<style lang="scss" scoped>

</style>