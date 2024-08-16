<template>
    <div>
        <div class="tcontent">
            <div class="tools-div">
                <button @click="setAxisHelper" class="tool-btn">坐标辅助线</button>
                <button @click="setGridHelper" class="tool-btn">低纹辅助线</button>
                <button @click="exportCo2Model" class="tool-btn">导入模型</button>
                <button @click="createPiping" class="tool-btn green">创建管道</button>
                <!-- <button @click="doPipingCircle" class="tool-btn green">开始管道运输</button> -->
                <!-- <button @click="stopPipingCircle" class="tool-btn green">停止管道运输</button> -->
            </div>
        </div>
        <div class="tcontent">
            <div id="webgl3"></div>
        </div>
        <div class="tcontent">
            <div class="tools-div">
                <h4 style="font-weight:bolder;">小小tips</h4>
                <p>1.外部模型，推荐使用 Blender 编辑器创建</p>
                <p>2.导入模型使用的 GLTFLoader 导入 glft 和 glb，除此之外，还有stl,obj,fbx等模型。</p>
                <p style="padding-left:10px;">加载模型时，要先引入模型函数，比如glft的函数在路径 three/examples/jsm/loaders/GLTFLoader.js，其他模型类似</p>
                <p style="padding-left:10px;">
                    <img src="../../assets/imgs/导入.png" alt=""/>
                </p>
                <p>3.文字引入方式，要先加载字体（https://www.100font.com/ ），再把字体转成json格式（https://gero3.github.io/facetype.js/）</p>
                <p style="padding-left:10px;">
                    <img src="../../assets/imgs/字体.png" alt=""/>
                </p>
                <p>4.频繁来回切换的文字，可以用mesh.visible的显示隐藏来切换，因为文字模型不能改字的值，只能销毁再创建</p>
                <p>5.贴图模型，需注意贴图的文件路径，模型和贴图最好放在同一目录下</p>
            </div>
        </div>

        <el-dialog v-model="dialogVisible" title="Tips" width="40%">
            <div>{{ imgSrc }}
                <!-- <img :src="require(imgSrc)" alt=""/> -->
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let scene = null; //场景
let c_width = 1200; //场景的宽
let c_height = 600; //场景的高
let camera = null; //相机
let renderer = null; //渲染器
let raycaster = new THREE.Raycaster(); //创建一个射线，鼠标点击时使用
let valveObj1 = null; //co2设备的阀门

let dialogVisible = ref(false)
let imgSrc = ref('')

const showImg = (imgPath)=>{
    imgSrc.value = imgPath;
    dialogVisible.value = true;
}

/**创建场景 */
const initScene = ()=>{
    scene = new THREE.Scene();
}

/**创建相机 */
const initCamera = ()=>{
    // let camera = new THREE.OrthographicCamera(-c_s*c_k, c_s*c_k, c_s, -c_s, 1, 2000);//正交投影相机对象,地图时使用
    camera = new THREE.PerspectiveCamera(); //透视相机，模拟人眼
    camera.position.set(-250, 250, 0);// 设置相机位置
    camera.lookAt(0, 0, 0);//指向坐标原点
}

/**创建光源 */
const initLights = ()=>{
    // 点光源
    // var pointLights = new THREE.PointLight(0xff00ff, 1); //点光源
    // pointLights.position.set(0,200,200); //光源位置
    // scene.add(pointLights); //点光源添加到场景中
    // // 点光源辅助观察
    // const pointLightHelper = new THREE.PointLightHelper(pointLights, 10);
    // scene.add(pointLightHelper);
    // 平行光
    const directionalLights = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights.position.set(0, 200, 200);
    scene.add(directionalLights);
    const directionalLights2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights2.position.set(0, 200, -200);
    scene.add(directionalLights2);
    const directionalLights3 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights3.position.set(200, 200, 0);
    scene.add(directionalLights3);
    const directionalLights4 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLights4.position.set(-200, 200, 0);
    scene.add(directionalLights4);
    // // 平行光辅助观察
    // const dirLightHelper = new THREE.DirectionalLightHelper(directionalLights, 5,0xff0000);
    // scene.add(dirLightHelper);
    //环境光
    var ambientLights = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLights);
}

/**创建渲染 */
const initRender = ()=>{
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(c_width, c_height); //设置渲染区域尺寸
    renderer.setClearColor(0xb9d3ff, 1); //设置背景颜色
    document.getElementById('webgl3').appendChild(renderer.domElement);
    doRendering();
    new OrbitControls(camera, renderer.domElement);//创建控件对象
}
/**鼠标操作后渲染 */
const doRendering = ()=>{
    renderer.render(scene,camera);//执行渲染操作
    requestAnimationFrame(doRendering);
}
/**辅助坐标系 */
const setAxisHelper = ()=>{
    var axisHelper = new THREE.AxesHelper(450); // 参数450表示坐标系大小，可以根据场景大小去设置
    scene.add(axisHelper);
}

/**底部网格 */
const setGridHelper = ()=> {
    const gridHelpers = new THREE.GridHelper(600, 60, 0xdddddd, 0xdddddd);
    scene.add(gridHelpers)
}

/**入口 */
onMounted(()=>{
    initScene();
    initCamera();
    initLights();
    initRender();
    // setAxisHelper();
    // setGridHelper();

    addDomEventListener();
    // exportCo2Model();
})

//导入gltf模型
const exportCo2Model = ()=>{
    const loader = new GLTFLoader();
    loader.load('/static/model/二氧化碳主机.glb', function ( gltf ) {
        // console.log('控制台查看加载gltf文件返回的对象结构',gltf);
        // console.log('gltf对象场景属性',gltf.scene);
        gltf.scene.scale.set(10,10,10);//网格模型缩放
        // 返回的场景对象gltf.scene插入到threejs场景中
        gltf.scene.traverse(function (item) {
            if(item.name == '阀门1'){
                valveObj1 = item
            }
        })
        scene.add( gltf.scene );
    })

    //文字
    addFonts();
}

//添加文字
let textMesh1 = null;
let textMesh2 = null;
const addFonts = ()=>{
    const fontLoaders = new FontLoader();
    fontLoaders.load('/static/font/FZShuSong-Z01S_Regular.json',(font)=>{
        const fontGeometry = new TextGeometry('关',{
            font: font, //.ttf字体文件转换而来， https://www.100font.com/  https://gero3.github.io/facetype.js/
            size: 4, //Float,字体大小,默认100
            height: 0.05, //Float，挤出文本的厚度，默认50
            curveSegments: 12, //Integer(表示文本的)曲线上点的数量，默认12
            bevelEnabled: true, //Boolean,是否开启斜角，默认false
            bevelThickness: 0.01, //Float,文本斜角的深度，默认20
            bevelSize: 0, //Float,斜角与原始文本轮廓之间的延伸距离，默认8
            bevelSegments: 3, //Integer,斜角的分段数，默认3
        })
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
        });
        textMesh1 = new THREE.Mesh(fontGeometry, material)
        textMesh1.position.set(-4, 60, 62)
        textMesh1.name = 'textNames'
        scene.add(textMesh1)
    })
    fontLoaders.load('/static/font/FZShuSong-Z01S_Regular.json',(font)=>{
        const fontGeometry = new TextGeometry('开',{
            font: font, //.ttf字体文件转换而来
            size: 4, //Float,字体大小,默认100
            height: 0.05, //Float，挤出文本的厚度，默认50
            curveSegments: 12, //Integer(表示文本的)曲线上点的数量，默认12
            bevelEnabled: true, //Boolean,是否开启斜角，默认false
            bevelThickness: 0.01, //Float,文本斜角的深度，默认20
            bevelSize: 0, //Float,斜角与原始文本轮廓之间的延伸距离，默认8
            bevelSegments: 3, //Integer,斜角的分段数，默认3
        })
        const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
        });
        textMesh2 = new THREE.Mesh(fontGeometry, material)
        textMesh2.position.set(-4, 60, 62)
        textMesh2.name = 'textNames2'
        textMesh2.visible = false
        scene.add(textMesh2)
    })
    
}

// 监听操作，因为有元素的监听，所有函数要在渲染后执行
let color1Ctrl = false
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
        const intersects = raycaster.intersectObjects([valveObj1]);
        // intersects.length大于0说明，说明选中了模型
        if (intersects.length > 0) {
            color1Ctrl = !color1Ctrl
            if(color1Ctrl){
                valveObj1.material.color.set(0x00ff00);
                textMesh1.visible = false
                textMesh2.visible = true
                doPipingCircle();
            }else{
                valveObj1.material.color.set(0xae2727);
                textMesh1.visible = true
                textMesh2.visible = false
                stopPipingCircle();
            }
        }
    })
}


let pipingMesh = null;
let pipingTexture = null;
const createPiping = ()=>{
    const pointsArr = [
        [0, 0, 30],
        [0, 0, 40],
        [0, -10, 50],
        [0, -20, 60],
    ];

    let pointsArr2 = pointsArr.map((point) => new THREE.Vector3(...point));
    const path2 = new THREE.CurvePath();
    for (let i = 0; i < pointsArr2.length - 1; i++) {
        // 每两个点之间形成一条三维直线
        const lineCurve = new THREE.LineCurve3(pointsArr2[i], pointsArr2[i + 1]); 
        // curvePath有一个curves属性，里面存放组成该三维路径的各个子路径
        path2.curves.push(lineCurve); 
    }

    // 2. 创建管道体
    const tubeGeometry = new THREE.TubeGeometry(path2, 1000, 0.5, 10, false);
    const texLoader = new THREE.TextureLoader();
    pipingTexture = texLoader.load('/static/imgs/orange.png');
    pipingTexture.wrapS = THREE.RepeatWrapping
    pipingTexture.wrapT = THREE.RepeatWrapping
    pipingTexture.repeat.x = 110;
    pipingTexture.repeat.y = 1;
    pipingTexture.offset.y = 0.5;

    // 3. 创建管道材质
    const tubeMaterial = new THREE.MeshPhongMaterial({
        map: pipingTexture, // 颜色贴图
        transparent: true,
        color: 0x47d8fa,
        side: THREE.DoubleSide,
    });

    pipingMesh = new THREE.Mesh( tubeGeometry, tubeMaterial );
    pipingMesh.position.y = 35;
    pipingMesh.position.x = 0;
    pipingMesh.rotateZ(3.14);
    pipingMesh.scale.set(2, 2, 2);
    // 4. 把几何体（管道）和 材质 生成的网格物体添加到场景中
    scene.add( pipingMesh );
    // doPipingCircle();
}

//管道流动
let pipingAnimate = null;
const doPipingCircle = ()=>{
    pipingTexture.offset.x -= 0.04;
    renderer.render(scene,camera);//执行渲染操作
    pipingAnimate = requestAnimationFrame(doPipingCircle);
}
//停止管道流动
const stopPipingCircle = ()=>{
    pipingAnimate && cancelAnimationFrame(pipingAnimate)
}


</script>

<style lang="scss" scoped>

</style>