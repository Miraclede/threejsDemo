<template>
    <div class="thome">
        <div class="tLeft">
            <div class="navs">
                <div class="navs-item">
                    <span @click="jumpPage('/introduction/install')">1.入门教程</span>
                </div>
                <div class="navs-item">
                    <span @click="jumpPage('/introduction/mouseCtrl')">2.其他</span>
                </div>
                <!-- <div class="navs-item">
                    <span @click="jumpPage('/introduction/fullViewRoom')">3.全景房间</span>
                </div> -->
            </div>

        </div>
        <div class="tRight">
            <router-view />
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const $router = useRouter()

const jumpPage = (path)=>{
    if(path){
        $router.push(path)
    }
}

</script>

<style lang="scss" scoped>
.thome{
    display: flex;
    background-color: #eee;

    .tLeft{
        position: relative;
        flex-basis: 320px;
        margin: 50px 20px;
    }
    .tRight{
        min-height: 100vh;
        flex-basis: 1200px;
        background-color: #fff;
    }
}

.navs{
    position: sticky;
    top: 50px;
    padding: 8px;
    border-radius: 2px;
    box-shadow: 0 0 10px #eee;
    background-color: #fff;

    .navs-item{
        position: relative;
        height: 32px;
        line-height: 32px;
        border-bottom: 1px solid rgba(245, 245,245);
        cursor: pointer;

        span{
            font-size: 16px;
            font-weight: bolder;

            &:hover{
                color: blue;
            }
        }
    }
}
</style>
