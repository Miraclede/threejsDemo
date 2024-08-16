<template>
	<div class="map">
		<Map :tagData="tagData" @tagClick="onClick" />
	</div>
</template>

<script setup>
import Map from "@/views/mytest/module/component/Map/index.vue";
import { onMounted, ref, watch, getCurrentInstance } from "vue";
import * as THREE from "three";
import * as d3 from "d3";

var scene = null;

const tagData = [
	{ cityId: "110100", cityName: "北京", value: ["116.405289", "39.904987"], projectCount: 3, deviceCount: 1 },
	{ cityId: "441200", cityName: "肇庆", value: ["112.616609", "23.20106"], projectCount: 14, deviceCount: 107 },
	{ cityId: "460100", cityName: "海口", value: ["110.208472", "20.031379"], projectCount: 3, deviceCount: 20 },
	{ cityId: "440100", cityName: "广州", value: ["113.34669", "23.147482"], projectCount: 4, deviceCount: 50 },
	{ cityId: "440800", cityName: "湛江", value: ["110.420038", "21.193235"], projectCount: 3, deviceCount: 37 },
	{ cityId: "530700", cityName: "丽江", value: ["100.233025", "26.872108"], projectCount: 1, deviceCount: 0 },
	{ cityId: "445100", cityName: "潮州", value: ["116.592724", "23.488789"], projectCount: 2, deviceCount: 31 },
	{ cityId: "440600", cityName: "佛山", value: ["113.207172", "23.134999"], projectCount: 3, deviceCount: 34 },
];

const onClick = (d) => {
	console.log(123, d);
	// alert(d.cityName);
};

// const queryGeojson = () => {
// 	return new Promise((resolve, reject) => {
// 		fetch("https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000_full")
// 			.then((res) => res.json())
// 			.then((data) => {
// 				console.log(456, data);
// 				resolve(data);
// 			})
// 			.catch((err) => {
// 				reject(err);
// 			});
// 	});
// };

// // 获取地图数据
// queryGeojson().then((data) => {
// 	console.log(567, data);
// });

onMounted(() => {});
</script>

<style lang="scss">
.map {
	width: 100%;
	height: 100vh;
	background-color: #345678;
}
</style>
