<template>
	<div class="pt-4">
		<img
			class="outline-none \ inline\ appearance-none \ border \ border-gray-400 \ rounded-lg \ focus:border-primary-500 \ focus:border-2 w-full \ transition \ duration-100 \ ease-in-out \ py-1 \ px-1 \ text-gray-700 \ mt-1 \ text-md \ leading-tight"
			:src="src"
			@click="click"
			@dragenter="dragenter"
			@dragover="dragover"
			@drop="drop"
			@dragleave="dragleave"
		/>
		<div
			class="progress-bar mt-1 relative"
			v-if="value.uploading"
		>
			<div class="bg-primary-100 block h-3 bg-opacity-25 border border-primary-500 rounded w-100 bsolute z-10"></div>
			<div
				:style="{ width:  value.uploading.percent + '%' }"
				class="transition-all duration-75 ease-in-out bg-primary-100 block h-3 rounded absolute z-20 top-0"
			></div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		data: {
			type: undefined,
		},
	},
	data() {
		return {
			value: this.data,
			defaultImageUrl: "/static/default-image.png",
		};
	},
	watch: {
		value(n) {
			this.$emit("changed", n);
		},
	},
	computed: {
		src() {
			return this.value.__value.length > 0
				? this.$contenuAPI.apiUrl + "/files/" + this.value.__value
				: this.defaultImageUrl;
		},
	},
	methods: {
		click() {
			var input = document.createElement("input");
			input.type = "file";
			input.click();
			input.addEventListener(
				"change",
				(event) => {
					this.processImageUpload(event.path[0].files);
				},
				false
			);
		},
		dragenter(event) {
			event.preventDefault();
			event.stopPropagation();
			this.highlightElement(event.srcElement);
		},
		dragover(event) {
			event.preventDefault();
			event.stopPropagation();
			this.highlightElement(event.srcElement);
		},
		drop(event) {
			event.preventDefault();
			event.stopPropagation();
			this.processImageUpload(event.dataTransfer.files);
			this.unHighlightElement(event.srcElement);
		},
		dragleave(event) {
			event.preventDefault();
			event.stopPropagation();
			this.unHighlightElement(event.srcElement);
		},
		highlightElement(srcElement) {
			srcElement.classList.remove("border");
			srcElement.classList.add("border-2");
			srcElement.classList.add("border-primary-500");
			srcElement.classList.add("border-dashed");
		},
		unHighlightElement(srcElement) {
			srcElement.classList.add("border");
			srcElement.classList.remove("border-2");
			srcElement.classList.remove("border-primary-500");
			srcElement.classList.remove("border-dashed");
		},
		processImageUpload(files) {
			let m = "";
			if (files.length == 1) {
				// if file is image
				if (this.isFileImage(files[0])) {
					if (this.value.__type === "image") {
						var selectedFile = files[0];
						var reader = new FileReader();
						reader.onload = function (event) {
							// data.__value = event.target.result;
						};
						reader.readAsDataURL(selectedFile);
						this.value.uploading = {
							percent: 0,
						};
						const formData = new FormData();
						formData.append("file", files[0]);
						this.$contenuAPI.uploadFile(
							formData,
							this.$auth.generateAuthHeader(),
							(event) => {
								let p = Math.round((event.loaded / event.total) * 100);
								this.value.uploading.percent = p;
								this.$forceUpdate();
								if (p == 100) {
									delete this.value.uploading;
								}
							},
							(e) => {
								if (e.ok) {
									this.value.__value = e.file.filename;
									this.$emit("changed", {
										__value: this.value.__value,
										__type: "image",
									});
								}
							}
						);
					}
				} else {
					m = "Only images are acceptable.";
				}
			} else {
				if (files.length > 1) m = "Only 1 file is acceptable.";
			}
			if (m.length > 0) {
				this.$emit("error", m);
			}
		},
		isFileImage(file) {
			return file && file["type"].split("/")[0] === "image";
		},
	},
};
</script>

<style>
.field-name + .child img {
	max-height: 200px;
	object-fit: contain;
	cursor: pointer;
	min-width: 100%;
	min-height: 150px;
}
</style>
