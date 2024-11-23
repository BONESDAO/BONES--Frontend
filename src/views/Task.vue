<script setup>
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {useGlobalStore} from "@/store/global";
import request from "@/config.js";

let id = 0;

const router = useRouter();
const store = useGlobalStore();
const tasks = ref([]);

// 跳转到第三方页面完成任务
const doTask = (completed, url, tid, rewards) => {
	if(completed === 0){ // 尚未完成
		request.post("/task/complete", {
			id,
			tid,
			skull: rewards
		})
		.then(function (response) {
			if(response.status === 200){
				const data = response.data;
				if(data.success){
					window.open(url, "_blank");
					getTasks();
				}
			}
		})
		
	}
}

// 获取任务列表
const getTasks = () => {
	// 获取所有任务
	request.get("/task/list", {
		params: {
			id
		}
	})
	.then(function (response) {
		if(response.status === 200){
			const data = response.data;
			if(data.success){
				tasks.value = [];
				data.tasks.forEach((item)=>{
					tasks.value.push({
						tid: item.tid,
						title: item.title,
						details: item.details,
						rewards: parseInt(item.rewards),
						url: item.url,
						completed: item.completed,
					});
				});
			}
		}
	})
}

const back = () => {
	router.back();
}

onMounted(()=>{
	id = store.userId;
	getTasks();
})
</script>

<template>
  <div class="root">
    <div class="container">
      <div class="header">
        <button class="button" @click="back">Back</button>
        <div class="title" style="font-weight: bold;">Tasks</div>
      </div>
	    <div :class="{'task': true, 'completed': task.completed}" :key="task.tid" v-for="task in tasks"
	         @click="doTask(task.completed, task.url, task.tid, task.rewards)">
		    <template v-if="task.completed">
			    <div class="label1" style="font-weight: bold;">{{task.title}}</div>
			    <div class="checkbox checked">
				    <svg viewBox="0 0 24 24" width="16" height="16" >
					    <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z"></path>
				    </svg>
			    </div>
		    </template>
		    <template v-else>
			    <div class="label2" style="font-weight: bold;">{{task.title}}</div>
			    <div class="checkbox">
				    <svg viewBox="0 0 24 24" width="16" height="16" >
					    <path d="M9 16.2l-4.2-4.2-1.4 1.4 5.6 5.6 12-12-1.4-1.4z"></path>
				    </svg>
			    </div>
		    </template>
	    </div>
    </div>
  </div>

</template>

<style scoped>
@import "../assets/css/task.css";
</style>
