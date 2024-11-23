<script setup>
	import {ref, watch} from "vue";
	const props = defineProps(["type", "message", "text"]);
	
	const textColor = ref("#aca9b7");
	
	const show = defineModel({ default: false });
	
	watch(show, () => {
		if (show.value) {
			if (props.type === "success") {
				textColor.value = "#9bcb76";
			} else if (props.type === "error") {
				textColor.value = "#f56c93";
			} else if (props.type === "warning") {
				textColor.value = "#e6a23c";
			}
			setTimeout(() => {
				show.value = false
			}, props.time || 2000)
		}
	});
</script>

<template>
	<transition name="fade">
		<div v-if="show">
			<div
				:style="{ background: 'black', color: textColor, textAlign: 'center', height: '25px', lineHeight: '25px' }"
			>
				{{ text }}
			</div>
		</div>
	</transition>
</template>

<style scoped>

</style>
