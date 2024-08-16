/* * @Description: 3d地图 * @Author: qinxp * @Date: 2022-01-11 17:02:52 * @Last Modified by: qinxp * @Last Modified time: 2022-01-18 16:32:04 */
<template>
	<div ref="box" class="china-chart">
		<div id="provinceInfo"></div>
	</div>
</template>
<script setup>
// import { init } from "echarts";
import { init } from "echarts";
import lineMap from "./map";
import { onMounted, ref, watch, getCurrentInstance } from "vue";
// import { de } from "element-plus/es/locale";

var mapObj = null;
const box = ref(null);
const { proxy } = getCurrentInstance();


const props = defineProps({
	tagData: {
		type: Array,
		default: () => [],
	},
});

onMounted(() => {
    // console.log(123,proxy.tagData);
	initData();
});

const initData = () => {
	mapObj = new lineMap(box.value, document.querySelector("#provinceInfo"), {
		tagClick: tagClick(),
	});
	mapObj.init();
	mapObj.setTag(proxy.tagData);
};

const tagClick = (v) => {
	console.log(888,v)
	proxy.$emit("tagClick", v);
};

// props: {
//     tagData: {
//         type: Array,
//         default: () => []
//     }
// };
// watch: {
//     tagData(v) {
//         this.mapObj.setTag(v)
//     }
// };

// beforeDestroy() {
//     this.mapObj.destroyed()
// },

// }
</script>
<style lang="scss" scoped>
.china-chart {
	position: relative;
	width: 100%;
	height: 100%;
	// mask-image: radial-gradient(yellow 60%, transparent 80%);
	#provinceInfo {
		position: absolute;
		color: #fff;
		user-select: none;
	}
}
</style>
