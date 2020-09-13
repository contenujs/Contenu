<template>
	<select
		class="typeChanger focus:outline-none"
		:class="{'-mt-4': value.__type == 'image'}"
		@change="change"
	>
		<option
			value="text"
			:selected="this.value.__type=='text'"
		>Text</option>
		<option
			value="textarea"
			:selected="this.value.__type=='textarea'"
		>Textarea</option>
		<option
			value="image"
			:selected="this.value.__type=='image'"
		>Image</option>
	</select>
</template>

<script>
export default {
	props: {
		data: {
			type: undefined,
			required: true,
		},
	},
	data() {
		return {
			value: this.data,
		};
	},
	methods: {
		change(event) {
			if (
				(this.value.__type != "image" &&
					event.target.value.toLowerCase() == "image") ||
				(this.value.__type == "image" &&
					event.target.value.toLowerCase() != "image")
			) {
				if (
					this.value.__type == "image" &&
					event.target.value.toLowerCase() != "image"
				) {
					if (this.value.__value) {
						this.$contenuAPI.removeFile(
							this.value.__value,
							this.$auth.generateAuthHeader()
						);
					}
				}

				this.value.__value = "";
				this.$emit("changed", "");
			}
			this.value.__type = event.target.value;
			this.$forceUpdate();
			this.$emit("typeChanged", this.value.__type);
		},
	},
};
</script>

<style>
</style>
