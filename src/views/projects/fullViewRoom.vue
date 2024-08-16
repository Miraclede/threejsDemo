<template>
  <div class="container">
    <div class="view-container" ref="canvasContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import gsap from 'gsap'
const canvasContainer = ref(null)

const dataList = [
  {
    image: new URL('../../assets/imgs/livingRoom.jpg', import.meta.url).href,
    tipsList: [
      {
        position: { x: -200, y: -4, z: -147 },
        content: {
          title: '进入厨房',
          text: '',
          image: 1,
          showTip: false,
          showTitle: true,
        },
      },
      {
        position: { x: -100, y: 0, z: -231 },
        content: {
          title: '信息点2',
          text: '77989',
          showTip: true,
          showTitle: false,
        },
      },
      {
        position: { x: 150, y: -50, z: -198 },
        content: {
          title: '信息点3',
          text: 'qwdcz',
          showTip: true,
          showTitle: false,
        },
      },
      {
        position: { x: 210, y: 11, z: -140 },
        content: {
          title: '信息点4',
          text: '大豆食心虫侦察十大大苏打大大大大大大大',
          showTip: true,
          showTitle: false,
        },
      },
      {
        position: { x: 208, y: -12, z: 140 },
        content: {
          title: '信息点5',
          text: 'eq',
          showTip: true,
          showTitle: false,
        },
      },
      {
        position: { x: 86, y: -9, z: 236 },
        content: {
          title: '进入房间',
          text: '',
          showTip: false,
          showTitle: true,
        },
      },
    ],
  },
  {
    image: new URL('../../assets/imgs/kitchen.jpg', import.meta.url).href,
    tipsList: [
      {
        position: { x: -199, y: -24, z: 145 },
        content: {
          title: '进入大厅',
          text: '',
          image: 0,
          showTip: false,
          showTitle: true,
        },
      },
    ],
  },
 
]
const tipsSpriteList = []

let scene = null
let camera = null
let renderer = null
let controls = null
let sphere = null

// 创建场景
let initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x101010)
}
// 创建相机
let initCamera = (val1, val2) => {
  camera = new THREE.PerspectiveCamera(45, val1 / val2, 0.1, 1000)
  // camera.position.set(50, 0, 40)
  camera.position.set(0, 0, 0.01)
}

// 创建渲染器
let initRenderer = (val1, val2) => {
  renderer = new THREE.WebGLRenderer()
  renderer.setSize(val1, val2)
  canvasContainer.value.appendChild(renderer.domElement)
}
// 创建控制器 提供用户在全景房间中自由查看的能力
let initControls = (val) => {
  controls = new OrbitControls(camera, val)
  controls.minDistance = 1
  controls.maxDistance = 100
  controls.enablePan = false
}

let initContent = () => {
  const sphereGeometry = new THREE.SphereGeometry(16, 20, 50)
  sphereGeometry.scale(16, 16, -16)
  const texture = new THREE.TextureLoader().load(dataList[0].image)
  const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture })
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(sphere)
  addTipsSprite()
}
//点精灵
const addTipsSprite = (index = 0) => {
  let tipTexture = new THREE.TextureLoader().load(
    new URL('../../assets/imgs/tip.png', import.meta.url).href
  )
  let material = new THREE.SpriteMaterial({ map: tipTexture })
  tipsSpriteList.length = 0
  dataList[index].tipsList.forEach((item) => {
    let sprite = new THREE.Sprite(material)
    sprite.scale.set(10, 10, 10)
    sprite.position.set(item.position.x, item.position.y, item.position.z)
    sprite.content = item.content
    tipsSpriteList.push(sprite)
    scene.add(sprite)
  })
}
const render = () => {
  controls.update()
  renderer.render(scene, camera)
  renderer.sortObjects = false
  requestAnimationFrame(render)
}

const onResize = () => {
  let element = canvasContainer.value
  camera.aspect = element.clientWidth / element.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(element.clientWidth, element.clientHeight)
}

const onMouseClick = (e) => {
  e.preventDefault()
  let element = canvasContainer.value
  let raycaster = new THREE.Raycaster()
  let mouse = new THREE.Vector2()
  mouse.x = (e.clientX / element.clientWidth) * 2 - 1
  mouse.y = -(e.clientY / element.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  let intersects = raycaster.intersectObjects(tipsSpriteList)
  console.log('intersects', intersects)
  console.log('Ray direction:', raycaster.ray.direction, mouse)
  if (intersects.length > 0 && intersects[0].object.content.showTitle) {
    changeContentAndtips(intersects[0].object.content.image)
    // this.handleTooltipHide(e);
  }
}
const changeContentAndtips = (index) => {
  console.log('scene.children',scene.children);
  scene.children = scene.children.filter(
    (item) => String(item.type) !== 'Sprite'
  )

  tipsSpriteList.length = 0
  let texture = new THREE.TextureLoader().load(dataList[index].image)
  let sphereMaterial = new THREE.MeshBasicMaterial({
    map: texture,
 
  })
  sphere.material = sphereMaterial;
  camera.updateProjectionMatrix();
  addTipsSprite(index);
}
const onMousemove = (e) => {
  e.preventDefault()
  let element = canvasContainer.value
  let raycaster = new THREE.Raycaster()
  let mouse = new THREE.Vector2()
  mouse.x = (e.clientX / element.clientWidth) * 2 - 1
  mouse.y = -(e.clientY / element.clientHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  let lettipsSprite = []
  let intersects = raycaster.intersectObjects(lettipsSprite, true)
  // console.log('intersects',intersects);
}
onMounted(() => {
  const { clientWidth, clientHeight } = canvasContainer.value
  initScene()
  initCamera(clientWidth, clientHeight)
  initControls(canvasContainer.value)
  initContent()
  initRenderer(clientWidth, clientHeight)
  render()

  window.addEventListener('resize', onResize(), false)
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.value.setSize(window.innerWidth, window.innerHeight)
  })
  window.addEventListener('click', onMouseClick)
  renderer.domElement.addEventListener('mousemove', onMousemove, false)

  // const changeContentAndtips = (index) => {
  //   scene.value.children = scene.value.children.filter(
  //     (item) => String(item.type) !== 'Sprite'
  //   )
  //   tipsSpriteList.value = []
  //   let texture = new THREE.TextureLoader().load(dataList[index].image)
  //   let sphereMaterial = new THREE.MeshBasicMaterial({
  //     map: texture,
  //     transparent: true,
  //     opacity: 0,
  //   })
  //   sphere.material = sphereMaterial
  //   gsap.to(sphereMaterial, { transparent: true, opacity: 1, duration: 2 })
  //   camera.updateProjectionMatrix()
  //   addTipsSprite(index)
  // }
})
</script>

<style lang="scss">
.container {
  height: 100vh;
  width: 100%;
  .view-container {
    height: 100%;
  }
}
</style>
