<template>
  <textarea rows="4"
  class="outline-none \
  inline\
  appearance-none \
  border \
  border-gray-400 \
  rounded-lg  \
  focus:border-primary-500 \
  focus:border-2 w-full \
  transition \
  duration-100 \
  ease-in-out \
  py-1 \
  px-1 \
  text-gray-700 \
  mt-1 \
  text-md \
  leading-tight"
  v-model="value"/>
</template>

<script>
export default {
	props:{
		data:{
			type: undefined
		},
	},
	data(){
		return {
			value : this.data
		}
	},
	watch:{
		value(n){
			this.$emit("changed", n);
		}
	}
}
</script>

<style>

</style>
