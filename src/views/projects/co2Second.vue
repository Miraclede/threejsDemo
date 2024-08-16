<template>
  <div>
    <div class="tcontent">
      <div class="tools-div">
        <button @click="setAxisHelper" class="tool-btn">坐标辅助线</button>
        <button @click="setGridHelper" class="tool-btn">网格辅助线</button>
        <button @click="exportFactoryModel" class="tool-btn">导入模型</button>
        <button @click="enterFloor" class="tool-btn">进入楼层</button>
        <button v-if="!showClickDot" @click="addDot" class="tool-btn">
          添加点位
        </button>
        <button v-if="showClickDot" @click="pathAndMove" class="tool-btn">
          生成路线
        </button>
        <button @click="addRobot()" class="tool-btn">
          添加机器人(第三人称)
        </button>
        <el-select
          v-model="deviceId"
          @change="choseDevice"
          clearable
          style="margin-left: 10px"
          placeholder="请选择设备"
        >
          <el-option :value="'1'" :label="'设备1'"></el-option>
          <el-option :value="'2'" :label="'设备2'"></el-option>
          <el-option :value="'3'" :label="'设备3'"></el-option>
        </el-select>
      </div>
    </div>
    <div class="tcontent" style="position: relative">
      <div id="webgl3" style="border: 1px solid #eee"></div>

      <div v-show="diaShow" class="myDia">
        <div
          class="mDia"
          style="
            position: relative;
            width: 500px;
            height: 300px;
            padding: 10px;
            background-color: #fff;
          "
        >
          <div
            style="
              position: relative;
              margin-bottom: 20px;
              border-bottom: 1px solid #eee;
            "
          >
            <span style="font-size: 18px; font-weight: 600">信息交互</span>
            <span
              @click="closeDia"
              style="
                position: absolute;
                right: 0;
                font-size: 18px;
                color: #ccc;
                cursor: pointer;
              "
              >x</span
            >
          </div>
          <div style="padding: 10px 0">
            <p style="margin-bottom: 10px">
              信息：<el-input
                v-model="inputVal"
                maxlength="12"
                clearable
                style="width: 300px"
                placeholder="请输入"
              ></el-input>
            </p>
          </div>
          <div
            style="
              position: absolute;
              bottom: 0;
              width: 90%;
              margin-bottom: 10px;
              text-align: right;
            "
          >
            <el-button @click="submitDia" type="primary">提交</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="tcontent">
      <div class="tools-div">
        <h4 style="font-weight: bolder">小小tips</h4>
        <p class="pitem">1.进入模型的动画，通过改变相机位置实现</p>
        <p class="pitem">
          2.通过new THREE.Ray()可以创建射线，射线穿过模型，模型就会被选中。
        </p>
        <p class="pitem" style="padding-left: 10px">
          点击选中模型的原理，就是在点击的位置创建一个射线，射线必然穿过这个模型，从而实现选中
        </p>
        <p class="pitem">3.与模型的对话框交互，直接使用的html弹窗</p>
        <p style="color: ">
          --------------------------------------------李懿-添加物体移动--------------------------------------------------
        </p>
        <p class="pitem">
          4.为了使图形/模型看起来更加的圆滑，减少边缘锯齿化，可以加入antialias
          参数，<span style="color: "
            >const renderer = new THREE.WebGLRenderer({ antialias: true })</span
          >
        </p>
        <p class="pitem">
          5.骨骼动画与运动状态关联，例如休息、步行、跑步等动作
        </p>
        <p class="pitem">
          <img src="../../assets/imgs/模型.png" alt="" />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import * as TWEEN from 'tween.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js' //创建和管理后期处理效果
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js' //后期处理效果通道
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js' //用于实现虚幻引擎中常见的泛光效果（Bloom）
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { Octree } from 'three/addons/math/Octree.js' //八叉树
import { Capsule } from 'three/addons/math/Capsule.js' //Capsule碰撞体
import {
  MaskPass,
  ClearMaskPass,
} from 'three/addons/postprocessing/MaskPass.js'
import gsap from 'gsap'
import { ElMessage, ElMessageBox } from 'element-plus'
let scene = null //场景
let c_width = 1200 //场景的宽
let c_height = 640 //场景的高
let camera = null //相机
let renderer = null //渲染器
let raycaster = new THREE.Raycaster() //创建一个射线，鼠标点击时使用
let gridHelpers = null //辅助线
let axisHelper = null //坐标线

let valveObj1 = null //co2设备的阀门
let deviceId = ref('') //选择的设备
let deviceObj1 = null
let deviceObj2 = null
let deviceObj3 = null
let textMesh1 = null
let textMesh2 = null
let textMesh3 = null
let inputVal = ref('')
let diaShow = ref(false)
let showRobot = ref(false)

/**创建场景 */
const initScene = () => {
  scene = new THREE.Scene()
}

let xCameraPos=100;
let yCameraPos=600;
let zCameraPos=600;
/**创建相机 */
const initCamera = () => {
  // let c_k = c_width/c_height;
  // let c_s = 600;
  // camera = new THREE.OrthographicCamera(-c_s*c_k, c_s*c_k, c_s, -c_s, 1, 2000);//正交投影相机对象,地图时使用
  //   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000) //透视相机，模拟人眼
  camera = new THREE.PerspectiveCamera()
  camera.position.set(xCameraPos, yCameraPos, zCameraPos) // 设置相机位置
  camera.lookAt(0, 0, 0) //指向坐标原点
}

/**创建光源 */
const initLights = () => {
  // 点光源
  // var pointLights = new THREE.PointLight(0xff00ff, 1); //点光源
  // pointLights.position.set(0,200,200); //光源位置
  // scene.add(pointLights); //点光源添加到场景中
  // // 点光源辅助观察
  // const pointLightHelper = new THREE.PointLightHelper(pointLights, 10);
  // scene.add(pointLightHelper);
  // 平行光
  const directionalLights = new THREE.DirectionalLight(0xffffff, 1)
  directionalLights.position.set(0, 1000, 1000)
  scene.add(directionalLights)
  const directionalLights2 = new THREE.DirectionalLight(0xffffff, 1)
  directionalLights2.position.set(0, 1000, -1000)
  scene.add(directionalLights2)
  // const directionalLights3 = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLights3.position.set(1000, 1000, 0);
  // scene.add(directionalLights3);
  // const directionalLights4 = new THREE.DirectionalLight(0xffffff, 1);
  // directionalLights4.position.set(-1000, 1000, 0);
  // scene.add(directionalLights4);
  // // 平行光辅助观察
  // const dirLightHelper = new THREE.DirectionalLightHelper(directionalLights, 5,0xff0000);
  // scene.add(dirLightHelper);
  //环境光
  // var ambientLights = new THREE.AmbientLight(0xffffff, 1);
  // scene.add(ambientLights);
  // 未知光
  let hemisphereLights = new THREE.HemisphereLight(0xffffff, 0x444444)
  scene.add(hemisphereLights)
}

/**创建渲染 */
let controls
const initRender = () => {
  renderer = new THREE.WebGLRenderer({ antialias: true }) //抗锯齿
  renderer.useLegacyLights = false
  renderer.setSize(c_width, c_height) //设置渲染区域尺寸
  renderer.setClearColor(0xb9d3ff, 1) //设置背景颜色
  renderer.setPixelRatio(window.devicePixelRatio) //更新像素比
  document.getElementById('webgl3').appendChild(renderer.domElement)
  doRendering()
  initControls(renderer.domElement)
  //  new OrbitControls(camera, renderer.domElement) //创建控件对象
  renderer.outputColorSpace = THREE.SRGBColorSpace //设置为SRGB颜色空间
}
// 创建控制器,可以使用鼠标对场景进行操作，比如旋转场景，移动场景，对场景进行缩放
let initControls = (val) => {
  controls = new OrbitControls(camera, val)
}
/**鼠标操作后渲染 */
const doRendering = () => {
  renderer.render(scene, camera) //执行渲染操作
  requestAnimationFrame(doRendering)
}
/**辅助坐标系 */

let axisHelperCtrl = false
let plane
const objects = []
let pointer
const setAxisHelper = () => {
  axisHelperCtrl = !axisHelperCtrl
  if (axisHelperCtrl) {
    axisHelper = new THREE.AxesHelper(450) // 参数450表示坐标系大小，可以根据场景大小去设置

    scene.add(axisHelper)
  } else {
    scene.remove(axisHelper)
    axisHelper = null
  }
}
let rollOverMesh, rollOverMaterial
let cubeGeo, cubeMaterial
const addCube = () => {
  // roll-over helpers

  const rollOverGeo = new THREE.BoxGeometry(10, 10, 10)
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  })
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial)
  scene.add(rollOverMesh)

  // cubes

  const map = new THREE.TextureLoader().load(
    '../../assets/imgs/square-outline-textured.png'
  )
  map.colorSpace = THREE.SRGBColorSpace
  cubeGeo = new THREE.BoxGeometry(10, 10, 10)
  cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xfeb74c, map: map })

  const geometry = new THREE.PlaneGeometry(600, 600)
  geometry.rotateX(-Math.PI / 2)

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  )
  scene.add(plane)
  objects.push(plane)
  pointer = new THREE.Vector2()
}

//
function onPointerMove(event) {
  console.log('鼠标事件')
  pointer.set(
    (event.clientX / c_width) * 2 - 1,
    -(event.clientY / c_height) * 2 + 1
  )

  raycaster.setFromCamera(pointer, camera)

  const intersects = raycaster.intersectObjects(objects, false)
  console.log('intersects', intersects)
  if (intersects.length > 0) {
    const intersect = intersects[0]

    rollOverMesh.position.copy(intersect.point).add(intersect.face.normal)
    rollOverMesh.position
      .divideScalar(50)
      .floor()
      .multiplyScalar(50)
      .addScalar(25)

    renderer.render(scene, camera)
  }
}
/**底部网格 */
let gridHelperCtrl = false
const setGridHelper = () => {
  gridHelperCtrl = !gridHelperCtrl
  if (gridHelperCtrl) {
    gridHelpers = new THREE.GridHelper(600, 60, 0xdddddd, 0xdddddd)
    scene.add(gridHelpers)
  } else {
    scene.remove(gridHelpers)
    gridHelpers = null
  }
}

/**入口 */
onMounted(() => {
  initScene()
  initCamera()
  initLights()
  initRender()
  // addCube()
  // document.addEventListener('pointermove', onPointerMove);
  // setAxisHelper();
  // setGridHelper();

  // exportFactoryModel();
  // exportCo2Model();
})

//导入gltf模型
let loadModel1 = null
let smallSphere,gui


const exportFactoryModel = () => {
  if (loadModel1 == null) {
 
    const loader = new GLTFLoader()
    // loader.load('/static/model/简单版厂房.glb', function ( gltf ) {
    loader.load('/static/model/厂房2.glb', function (gltf) {
      // console.log('控制台查看加载gltf文件返回的对象结构',gltf);
      // console.log('gltf对象场景属性',gltf.scene);
      gltf.scene.scale.set(5, 5, 5) //网格模型缩放
      // 返回的场景对象gltf.scene插入到threejs场景中
      gltf.scene.traverse(function (item) {
        if (item.name == 'Plane007') {
          const texLoader = new THREE.TextureLoader()
          const texture = texLoader.load('/static/model/earth.png')
          texture.wrapS = THREE.RepeatWrapping //和下面的重复组合使用
          texture.wrapT = THREE.RepeatWrapping
          texture.repeat.x = 4 //值越大，贴图越小；不设置，整个贴图贴上去
          texture.repeat.y = 4
          texture.offset.y = 4
          item.material.map = texture
        }

        if (item.isMesh) {
          // .material.clone()返回一个新材质对象，和原来一样，重新赋值给.material属性
          item.material = item.material.clone()
        }
      })
      loadModel1 = gltf.scene
      scene.add(gltf.scene)
      addGui()
   

      setTimeout(() => {
        addDomEventListener()
      }, 1000)
    })
  } else {
    scene.remove(loadModel1)
    loadModel1 = null
  }
}

let effectCamera={
  'forward':function(){
     zCameraPos -=100
  },
  'left':1,
  'right':1,
  'back':1

}
const updateCamera=()=>{
  console.log('11111',zCameraPos);
  camera.position.set(xCameraPos,yCameraPos,zCameraPos);
}
// 添加GUI控制器
const addGui=()=>{
   gui = new GUI();
   gui.add( effectCamera, 'forward',-600,600 ).onChange(updateCamera);
  
}
// 从室外切换到楼层
function enterFloor() {
  // 镜头动画
  if (camera.position.x > -100) {
    camera.position.x = camera.position.x - 5
    camera.position.y = camera.position.y - 12.5
    camera.position.z = camera.position.z - 15
    renderer.render(scene, camera)
    requestAnimationFrame(enterFloor)
  } else {
    // 场景切换
    showRooms()
  }
}
// 手动生成路线并移动
const showClickDot = ref(false)
const addDot = () => {
  showClickDot.value = true
}
const pathAndMove = () => {
  ElMessageBox.confirm('确定生成路线吗?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      addModel() //添加移动的物体
      addPath() //添加移动路线path
      showClickDot.value = false
    })
    .catch(() => {
      scene.remove(model)
      scene.remove(skeleton)
      console.log(lines)
      for (const line of lines) {
        scene.remove(line)
      }
      for (const marker of markers) {
        scene.remove(marker)
      }
      pathVertices = []
      pathVertices2 = []
      lines = []
      line.lineGeometry.dispose()
      line.lineMaterial.dispose()
      showClickDot.value = false
    })
}
let scaledScene = null
let scaledCamera = null
let scaledRenderer = null
const initScaledScene = () => {
  scaledScene = new THREE.Scene()
}
const initScaleCamera = () => {
  scaledCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
  let hemisphereLights = new THREE.HemisphereLight(0xffffff, 0x444444)
  scaledScene.add(hemisphereLights)
}
const scaledRender = () => {
  scaledRenderer.render(scaledScene, scaledCamera) //执行渲染操作
  requestAnimationFrame(scaledRender)
}
const initScaledRenderer = () => {
  scaledRenderer = new THREE.WebGLRenderer()
  scaledRenderer.setSize(window.innerWidth / 4, window.innerHeight / 4)
  document.body.appendChild(scaledRenderer.domElement)
  scaledRenderer.domElement.style.position = 'absolute'
  scaledRenderer.domElement.style.bottom = '0'
  scaledRenderer.domElement.style.left = '0'
  scaledRender()
}
const showRooms = () => {
  if (loadModel1) {
    scene.remove(loadModel1)
    loadModel1 = null

    // initScaledScene()
    // initScaleCamera()
    // initScaledRenderer()
    exportCo2Model()

    setTimeout(() => {
      // addModel() //添加移动的物体
      // addPath() //添加移动路线path

      camera.position.set(-200, 200, 0)
      camera.lookAt(0, 0, 0)
      // animate() //小球移动动画
      //   renderer.render(scene, camera)
    }, 500)
  }
}

let actions, settings, model, skeleton, mixer, activeAction, previousAction

const scaleFactor = 10

let angle = 0
let clipAction
const addModel = () => {
  // const geometry = new THREE.IcosahedronGeometry(5, 0) //创建一个正二十面体几何体
  //   const material = new THREE.MeshPhongMaterial({
  //     color: 0xffffff,
  //     emissive: 0x333333,
  //     flatShading: true,
  //   })
  //   smallSphere = new THREE.Mesh(geometry, material)
  //   scene.add(smallSphere)
  const loader = new GLTFLoader()
  loader.load('static/model/Soldier.glb', function (gltf) {
    model = gltf.scene
    scene.add(model)
    // 设置模型的缩放大小
    model.scale.set(scaleFactor, scaleFactor, scaleFactor)
    // 改变模型的方向---转了180°
    model.rotation.y = Math.PI
    // traverse遍历model，将模型中所有的网格mesh对象的属性castShadow设置
    model.traverse(function (object) {
      if (object.isMesh) object.castShadow = true
    })

    // 可视化模型骨骼
    skeleton = new THREE.SkeletonHelper(model)
    skeleton.visible = false
    scene.add(skeleton)
    // 获取加载模型的动画数组
    const animations = gltf.animations
    // 用于管理和播放模型的动画
    mixer = new THREE.AnimationMixer(gltf.scene)
    const clipAction = mixer.clipAction(animations[1]) //走路
    clipAction.setEffectiveTimeScale(10) //走路频率
    clipAction.play() //播放动作
    clipAction.weight = 1.0
    clock.start()
    animate()

    // animate()
  })
}

let pathVertices = []
let pathVertices2 = []
let lineGeometry, lineMaterial
let line
let lines = []
const addPath = () => {
  // pathVertices = [
  //   new THREE.Vector3(10, 0, -88),
  //   new THREE.Vector3(10, 0, 74),
  //   new THREE.Vector3(-20, 0, 74),
  //   new THREE.Vector3(-20, 0, 38),
  // ]
  // pathVertices2 = [
  //   new THREE.Vector3(15, 0, -88),
  //   new THREE.Vector3(15, 0, 77),
  //   new THREE.Vector3(-20, 0, 77),
  //   new THREE.Vector3(-20, 0, 32),
  // ]

  // 创建多条直线的路径
  // const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathVertices);
  // const pathMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  // const pathLines = new THREE.LineLoop(pathGeometry, pathMaterial);

  // // 将路径添加到场景
  // scene.add(pathLines);

  for (let i = 0; i < pathVertices2.length - 1; i++) {
    lineGeometry = new THREE.BufferGeometry().setFromPoints([
      pathVertices2[i],
      pathVertices2[i + 1],
    ])
    lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })
    line = new THREE.Line(lineGeometry, lineMaterial)
    console.log('lines', lines)
    lines.push(line)
    scene.add(line)
  }
}

let currentPointIndex = 0

const delta = ref(5)
const speeds = [1, 1, 1, 1]
let startTime = 0
const animate = () => {
  requestAnimationFrame(animate)
  updateModelDirection()
  mixer.update(clock.getDelta())

  if (startTime === 0) {
    startTime = clock.getElapsedTime()
  }

  // 计算经过的总时间，基于起始时间
  const elapsedTime = clock.getElapsedTime() - startTime
  // const elapsedTime = clock.getElapsedTime()

  // if (model.position.z >= 74 && model.position.x < 15) {
  //   model.rotation.y = Math.PI / 2 //到达第2段路程
  // } else if (
  //   model.position.z < 77 &&
  //   model.position.z > 33 &&
  //   model.position.x < 0
  // ) {
  //   model.rotation.y = 0

  //   //到达第3段路程
  // } else if (model.position.z <= 77 && model.position.x > 0) {
  //   model.rotation.y = Math.PI

  //   //  第1段路程
  // }

  // console.log(delta.value);
  const t = (elapsedTime % delta.value) / delta.value // 5是路径的总时长，这里假设路径移动需要5秒
  const position = new THREE.Vector3()
  // 插值计算
  // position.lerpVectors(
  //   pathVertices[Math.floor(t * (pathVertices.length - 1))],
  //   pathVertices[Math.ceil(t * (pathVertices.length - 1))],
  //   (t * (pathVertices.length - 1)) % 1
  // )

  const relativeT = t * (pathVertices.length - 1)

  // 进行插值
  const curve = new THREE.CatmullRomCurve3(pathVertices)
  curve.curveType = 'centripetal'
  const tension = 0.5
  curve.tension = tension
  curve.closed = false // 设置为 true 可以形成闭合曲线
  const point = new THREE.Vector3()
  curve.getPointAt(t, point)

  // angle += 0.05;
  // const clampedAngle = THREE.MathUtils.euclideanModulo(angle, Math.PI*2 );
  //  for(let i=0;i<skeleton.bones.length;i++){
  //   const bone = skeleton.bones[i];
  //     if(bone.name&&bone.name.includes('Leg')){

  //       // bone.rotation.x = Math.sin(clampedAngle) * 0.5+2*Math.PI;
  //       // bone.rotation.x=Math.PI

  //     }
  //  }

  // 更新小球的位置
  model.position.copy(point)

  // 使路径旋转
  //   lines.forEach(line => {
  //     line.rotation.y += 0.005;
  //   });

  //   smallSphere.position.set(
  //     xPotistion.value,
  //     10,
  //     yPotistion.value
  //   )
  //   smallSphere.rotation.y = Math.PI / 2 - time
  //   smallSphere.rotation.z = elapsedTime * 8

  renderer.render(scene, camera)
}
let currentModelIndex = 0
function updateModelDirection() {
  // 假设模型始终位于路径上的某个点，可以根据需要调整这个逻辑
  const currentModelPosition = pathVertices[0]

  // 计算当前点和下一个点的方向向量
  const directionVector = pathVertices[1]
    .clone()
    .sub(currentModelPosition)
    .normalize()

  // 将模型的方向设置为该方向向量
  model.lookAt(pathVertices[1])

  // 更新模型的位置（这里需要根据你的模型和场景设置合适的位置）
  model.position.copy(currentModelPosition)
}

const exportCo2Model = () => {
  const loader = new FBXLoader()
  loader.load('/static/model/空间建模.fbx', function (obj) {
    obj.scale.set(0.2, 0.2, 0.2, 0.2) //网格模型缩放
    obj.children[0].material.color.set(0xeeeeee) // 设置其中一个网格模型的颜色

    scene.add(obj)
    // scaledScene.add(obj)
    addDevice1()
    addDevice2()
    addDevice3()
    // addRobot()
    // addBloom()

    setTimeout(() => {
      addDomEventListener()
    }, 1000)
  })
}
let composer, mixer3
const addBloom = () => {
  // 创建 EffectComposer
  composer = new EffectComposer(renderer)
  // 创建 RenderPass
  const renderScene = new RenderPass(scene, camera)
  // 创建 UnrealBloomPass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(c_width, c_height),
    1.5,
    0.4,
    0.6
  )

  // bloomPass.threshold = 0
  // bloomPass.strength = 1
  // bloomPass.radius = 0.1
  console.log('bloomPass', bloomPass)
  const maskPass = new MaskPass(scene, camera)
  maskPass.inverse = false // 让 mask 区域外的部分生效

  const outputPass = new OutputPass(THREE.ReinhardToneMapping)
  const clearMaskPass = new ClearMaskPass()

  composer.addPass(renderScene)
  composer.addPass(bloomPass)

  composer.addPass(outputPass)
  composer.addPass(maskPass)
  composer.addPass(clearMaskPass)

  new GLTFLoader().load('/static/model/PrimaryIonDrive.glb', function (gltf) {
    const model = gltf.scene

    scene.add(model)
    model.scale.set(2, 2, 2)
    model.position.set(15, 10, -20)
    mixer3 = new THREE.AnimationMixer(model)
    const clip = gltf.animations[0]

    mixer3.clipAction(clip.optimize()).play()

    animate2()
  })
}
const animate2 = () => {
  requestAnimationFrame(animate2)

  const delta = clock.getDelta()

  mixer3.update(delta)
  // renderer.render(scene, camera)
  composer.render()
}
// 添加一个可以键盘WASD控制方向前进的机器人
let robot, mixer1, ambientLight, directionalLight

const addRobot = () => {
  showRobot.value = !showRobot.value
  if (showRobot.value) {
    ambientLight = new THREE.AmbientLight(0xffffff)
    scene.add(ambientLight)

    directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(50, 50, 50)
    scene.add(directionalLight)
    // robot
    const loader = new GLTFLoader()
    loader.load('/static/model/RobotExpressive.glb', function (gltf) {
      robot = gltf.scene

      if (loadModel1) {
        robot.scale.set(2, 2, 2)
        robot.position.set(-60, 0, -80)
      } else {
        robot.scale.set(2, 2, 2)
        robot.position.set(15, 0, -80)
      }

      robot.previousPosition = new THREE.Vector3()
      scene.add(robot)
      const animations = gltf.animations
      console.log('animations', animations)
      actions = {}
      mixer1 = new THREE.AnimationMixer(gltf.scene)
      for (let i = 0; i < animations.length; i++) {
        const clip = animations[i]
        const action = mixer1.clipAction(clip)
        actions[clip.name] = action
      }
      console.log('actions', actions)
      activeAction = actions['Dance']
      robotAction('Dance')
      animate1()
    })
  } else {
    scene.remove(ambientLight)
    scene.remove(robot)
    scene.remove(directionalLight)
  }
}
// 动作触发
const robotAction = (val) => {
  actions[val]
    .reset()
    .setEffectiveTimeScale(1)
    .setEffectiveWeight(1)
    .fadeIn(0.2) //动画逐渐淡入，即从动画的初始状态平滑地过渡到完全播放状态
    .play()
}

const checkCollision = (object, obstacles) => {
  // 实现碰撞检测逻辑
  // 返回 true 表示发生碰撞，否则返回 false
  const objectBox = new THREE.Box3().setFromObject(object)//创建一个 Box3 对象并计算包围盒 以包裹object
  let collision = false
  if(obstacles){
    obstacles.traverse((child) => {
    if (child.isMesh && child.name !== 'Plane007') {
      const obstacleBox = new THREE.Box3().setFromObject(child)
     
      if (objectBox.intersectsBox(obstacleBox)) {
        collision = true 
      }else{
       
      }
    }
  })
  }
 
 

  return collision
}
const v = new THREE.Vector3(0, 0, 3)
const a = 0.5 //加速度：调节按键加速快慢
const animate1 = () => {
  const deltaTime = clock.getDelta()
  robot.previousPosition.copy(robot.position)
  if (keyStates.W) {
    robot.rotation.y = 0
    robot.position.z += a
    const collision = checkCollision(robot, loadModel1)
    if (collision) {
      robot.position.z -= a
    } 
  }
  if (keyStates.A) {
    //向左运动
    robot.rotation.y = Math.PI / 2
    robot.position.x += a
    const collision = checkCollision(robot, loadModel1)
    if (collision) {
      robot.position.x -= a
    } 
  }
  if (keyStates.D) {
    //向右运动
    robot.rotation.y = -Math.PI / 2
    robot.position.x -= a
    const collision = checkCollision(robot, loadModel1)
    if (collision) {
      robot.position.x += a
    } 
  }
  if (keyStates.S) {
    robot.rotation.y = Math.PI
    robot.position.z -= a
    const collision = checkCollision(robot, loadModel1)
    if (collision) {
      robot.position.z += a
    } 
  }

  // if (keyStates.W||keyStates.D||keyStates.A||keyStates.S) {
  //   const collision = checkCollision(robot, loadModel1)
  //   console.log('collision',collision);
  //   if (collision) {
  //     // 撤销模型移动
    
  //     robot.position.copy(robot.previousPosition)
  //   } else {
  //     // 更新模型的 previousPosition
  //     robot.previousPosition = robot.position.clone()
  //   }
  // }
  mixer1.update(deltaTime) // 更新播放器相关的时间
  renderer.render(scene, camera)
  requestAnimationFrame(animate1)
}

const addDevice1 = () => {
  if (deviceObj1 == null) {
    var loader = new OBJLoader()
    loader.load('/static/model/小音箱.obj', function (obj) {
      obj.position.set(6, 0, 73)
      obj.scale.set(100, 100, 100) //网格模型缩放
      obj.children[0].material.color.set(0x00ff00) // 设置其中一个网格模型的颜色
      obj.name = 'deviceObj1'
      scene.add(obj)
      deviceObj1 = obj
    })
  }
}

const addDevice2 = () => {
  if (deviceObj2 == null) {
    var loader = new OBJLoader()
    loader.load('/static/model/小音箱.obj', function (obj) {
      obj.position.set(14, 0, -88)
      obj.scale.set(100, 100, 100) //网格模型缩放
      obj.children[0].material.color.set(0x00ff00) // 设置其中一个网格模型的颜色
      scene.add(obj)
      obj.name = 'deviceObj2'
      deviceObj2 = obj
    })
  }
}

const addDevice3 = () => {
  if (deviceObj3 == null) {
    var loader = new OBJLoader()
    loader.load('/static/model/小音箱.obj', function (obj) {
      obj.position.set(60, 0, 0)
      obj.rotation.y = Math.PI
      obj.scale.set(100, 100, 100) //网格模型缩放
      obj.children[0].material.color.set(0x00ff00) // 设置其中一个网格模型的颜色
      scene.add(obj)
      obj.name = 'deviceObj3'
      deviceObj3 = obj
    })
  }
}

const choseDevice = () => {
  if (deviceId.value == 1) {
    deviceObj1 && deviceObj1.children[0].material.color.set(0xff0000)
    addFonts1()
  } else if (deviceId.value == 2) {
    deviceObj2 && deviceObj2.children[0].material.color.set(0xff0000)

    // addFonts2();
  } else if (deviceId.value == 3) {
    deviceObj3 && deviceObj3.children[0].material.color.set(0xff0000)
    addFonts3()
  } else {
    deviceObj1 && deviceObj1.children[0].material.color.set(0x00ff00)
    deviceObj2 && deviceObj2.children[0].material.color.set(0x00ff00)
    deviceObj3 && deviceObj3.children[0].material.color.set(0x00ff00)

    redAnimationFrame && cancelAnimationFrame(redAnimationFrame)
    textMesh1 && scene.remove(textMesh1)
    textMesh1 = null
    textMesh2 && scene.remove(textMesh2)
    textMesh2 = null
    textMesh3 && scene.remove(textMesh3)
    textMesh3 = null
  }
}

const addFonts1 = () => {
  if (textMesh1 == null) {
    //我们使用canvas增加字体
    let canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 100
    let c = canvas.getContext('2d')
    // 矩形区域填充背景
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, 200, 100)
    c.beginPath()
    // 文字
    c.beginPath()
    c.translate(0, 20)
    c.fillStyle = '#000000' //文本填充颜色
    c.font = 'bold 14px 宋体' //字体样式设置
    // c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    // c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText('设备信息设备信息设备信息', 0, 0)

    let texture = new THREE.CanvasTexture(canvas)
    //矩形平面
    let geometry = new THREE.PlaneGeometry(20, 20)

    let material = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      map: texture, // 设置纹理贴图
      side: THREE.DoubleSide, //不设置此项的话，我们只能看到一面字体，当旋转角度后，另外一面不可见
    })
    // 创建一个矩形平面网模型，Canvas画布作为矩形网格模型的纹理贴图
    textMesh1 = new THREE.Mesh(geometry, material)
    textMesh1.position.set(6, 60, 73)
    scene.add(textMesh1)

    TxtAnimate()
  }
}

let device2Txt = '设备信息'
const addFonts2 = () => {
  if (textMesh2 == null) {
    //我们使用canvas增加字体
    let canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 100
    let c = canvas.getContext('2d')
    // 矩形区域填充背景
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, 200, 100)
    c.beginPath()
    // 文字
    c.beginPath()
    c.translate(0, 20)
    c.fillStyle = '#000000' //文本填充颜色
    c.font = 'bold 14px 宋体' //字体样式设置
    // c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    // c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText(device2Txt, 0, 0)

    let texture = new THREE.CanvasTexture(canvas)
    //矩形平面
    let geometry = new THREE.PlaneGeometry(20, 20)

    let material = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      map: texture, // 设置纹理贴图
      side: THREE.DoubleSide, //不设置此项的话，我们只能看到一面字体，当旋转角度后，另外一面不可见
    })
    // 创建一个矩形平面网模型，Canvas画布作为矩形网格模型的纹理贴图
    textMesh2 = new THREE.Mesh(geometry, material)
    textMesh2.position.set(14, 60, -88)
    scene.add(textMesh2)

    TxtAnimate()
  }
}

const addFonts3 = () => {
  if (textMesh3 == null) {
    //我们使用canvas增加字体
    let canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 100
    let c = canvas.getContext('2d')
    // 矩形区域填充背景
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, 200, 100)
    c.beginPath()
    // 文字
    c.beginPath()
    c.translate(0, 20)
    c.fillStyle = '#000000' //文本填充颜色
    c.font = 'bold 14px 宋体' //字体样式设置
    // c.textBaseline = "middle"; //文本与fillText定义的纵坐标
    // c.textAlign = "center"; //文本居中(以fillText定义的横坐标)
    c.fillText('设备信息设备信息设备信息', 0, 0)

    let texture = new THREE.CanvasTexture(canvas)
    //矩形平面
    let geometry = new THREE.PlaneGeometry(20, 20)

    let material = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      map: texture, // 设置纹理贴图
      side: THREE.DoubleSide, //不设置此项的话，我们只能看到一面字体，当旋转角度后，另外一面不可见
    })
    // 创建一个矩形平面网模型，Canvas画布作为矩形网格模型的纹理贴图
    textMesh3 = new THREE.Mesh(geometry, material)
    textMesh3.position.set(60, 60, 0)

    const { x, y, z } = camera.position
    textMesh3.lookAt(x, y, z)
    scene.add(textMesh3)

    TxtAnimate()
  }
}

const clock = new THREE.Clock()
let redAnimationFrame = null
const TxtAnimate = () => {
  const elapsedTime = clock.getElapsedTime()
  if (textMesh1) {
    textMesh1.rotation.y = elapsedTime
  }
  // if(textMesh2){
  //     textMesh2.rotation.y = elapsedTime;
  // }
  if (textMesh3) {
    const { x, y, z } = camera.position
    textMesh3.lookAt(x, y, z)
  }
  renderer.render(scene, camera)
  redAnimationFrame = requestAnimationFrame(TxtAnimate)
}

let showTxt2Ctrl = false
let clickPositons = []
let marker
let markers = []
const keyStates = {
  // 使用W、A、S、D按键来控制前、后、左、右运动
  // false表示没有按下，true表示按下状态
  W: false,
  A: false,
  S: false,
  D: false,
}
let viewBool = true //true表示第三人称，false表示第一人称
const addDomEventListener = () => {
  if (loadModel1 === null) {
    renderer.domElement.addEventListener('click', function (event) {
      const px = event.offsetX
      const py = event.offsetY
      const x = (px / c_width) * 2 - 1
      const y = -(py / c_height) * 2 + 1
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
      const intersects2 = raycaster.intersectObjects([deviceObj2])
      const intersects = raycaster.intersectObjects(scene.children, true) //点击场景
      const intersects1 = raycaster.intersectObjects([deviceObj1])
      const intersects3 = raycaster.intersectObjects([deviceObj3])
      // obj.position.set(60, 0, 0)
      if (intersects2.length > 0) {
        // showTxt2Ctrl = !showTxt2Ctrl;
        // if(showTxt2Ctrl){
        //     device2Txt = inputVal.value;
        //     addFonts2();
        //     diaShow.value = true;
        // }else{
        //     scene.remove(textMesh2);
        //     textMesh2 = null;
        // }

        diaShow.value = true
      }
      if (intersects.length > 0 && showClickDot.value) {
        const intersectionPoint = intersects[0].point
        intersectionPoint.y = 0
        const intersectionVector = new THREE.Vector3().copy(intersectionPoint)
        // 输出相交点的坐标
        // console.log("Intersection Point:", intersectionPoint);
        const markerGeometry = new THREE.SphereGeometry(0.5)
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        marker = new THREE.Mesh(markerGeometry, markerMaterial)
        marker.position.copy(intersectionPoint)
        pathVertices.push(intersectionVector)
        pathVertices2.push(intersectionVector)
        markers.push(marker)
        scene.add(marker)
      }
      if (intersects1.length > 0) {
        gsap.to(camera.position, {
          duration: 2,
          x: 50,
          y: 100,
          z: 100,
          onUpdate: function () {
            // 在每一帧更新相机的朝向
            camera.lookAt(6, 0, 73)
          },
          onComplete: () => {},
        })
        gsap.to(deviceObj1.children[0].material.color, {
          duration: 2,
          r: 1,
          g: 0,
          b: 0,
        })
      }

      if (intersects3.length > 0) {
        gsap.to(camera.position, {
          duration: 2,
          x: 50,
          y: 100,
          z: -50,
          onUpdate: function () {
            // 在每一帧更新相机的朝向
            camera.lookAt(60, 0, 0)
          },
          onComplete: () => {},
        })

        // camera.position.set(100, 100, 100) // 设置相机位置
        // camera.lookAt(6, 0, 73) //指向坐标原点
        //   gsap.to(sphereMaterial, { transparent: true, opacity: 1, duration: 2 })
      }
    })
  }

  document.addEventListener('keydown', (event) => {
    console.log('event.code', event.code)

    if (event.code === 'KeyW') keyStates.W = true
    if (event.code === 'KeyA') keyStates.A = true
    if (event.code === 'KeyS') keyStates.S = true
    if (event.code === 'KeyD') keyStates.D = true
    if (activeAction !== actions['Running']) {
      previousAction = activeAction
      activeAction = actions['Running']
      if (previousAction !== activeAction) {
        previousAction.fadeOut(0.5) //动画逐渐淡出，即从当前播放状态平滑地过渡到动画的结束状态
      }
      robotAction('Running')
    } else {
      // robotAction('Running')
    }
  })
  document.addEventListener('keyup', function (event) {
    // console.log('释放', activeAction)
    if (event.code === 'KeyW') keyStates.W = false
    if (event.code === 'KeyA') keyStates.A = false
    if (event.code === 'KeyS') keyStates.S = false
    if (event.code === 'KeyD') keyStates.D = false

    previousAction = activeAction
    activeAction = actions['Dance']
    if (previousAction !== activeAction) {
      previousAction.fadeOut(0.5)
    }
    robotAction('Dance')
  })
}

const submitDia = () => {
  diaShow.value = false
  if (textMesh2) {
    scene.remove(textMesh2)
    textMesh2 = null
  }
  device2Txt = '信息发送中……'
  addFonts2()

  deviceObj2 && deviceObj2.children[0].material.color.set(0xff0000)

  setTimeout(() => {
    if (textMesh2) {
      scene.remove(textMesh2)
      textMesh2 = null
    }
    device2Txt = '接收到信息：' + inputVal.value
    addFonts2()
    deviceObj2 && deviceObj2.children[0].material.color.set(0x00ff00)
  }, 2500)
}

const closeDia = () => {
  diaShow.value = false
}
</script>

<style lang="scss" scoped>
.myDia {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
}

.pitem:hover {
  color: blue;
}
</style>
