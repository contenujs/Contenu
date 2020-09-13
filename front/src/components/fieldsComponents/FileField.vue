<template>
	<div class="pt-4 fileField relative">
		<div
			class="content outline-none appearance-none border border-gray-400 rounded-lg focus:border-primary-500 focus:border-2 w-full transition duration-100 ease-in-out py-1 px-1 text-gray-700 mt-1 text-md leading-tight"
		>
			<img
				class="rounded"
				@click="value.__value.length > 0 ? open(src) : click()"
				:src="src"
				@dragenter="dragenter"
				@dragover="dragover"
				@drop="drop"
				@dragleave="dragleave"
			/>
		</div>
		<div
			class="btns absolute top-0 mt-8 right-0 mr-3"
			v-if="this.value.__value.length > 0"
		>
			<button class="focus:outline-none p-0 border text-gray-400 border-gray-400 rounded hover:text-primary-500 hover:border-primary-500 transition duration-75">
				<ChangeIcon
					class="outline-none fill-current transition-all duration-75"
					style="padding: 2px; padding-bottom: 0;"
					@click="click"
				/>
			</button>
			<button class="focus:outline-none p-0 border text-gray-400 border-gray-400 rounded hover:text-primary-500 hover:border-primary-500 transition duration-75">
				<DownloadIcon
					class="fill-current transition-all duration-75"
					style="padding: 2px;"
					@click="open(src + '?download=1')"
				/>
			</button>
			<button class="focus:outline-none p-0 border text-gray-400 border-gray-400 rounded hover:text-primary-500 hover:border-primary-500 transition duration-75">
				<DeleteIcon
					class="fill-current transition-all duration-75"
					@click="deleteFile()"
				/>
			</button>
		</div>
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
import DownloadIcon from "../../assets/download.svg";
import DeleteIcon from "../../assets/delete.svg";
import ChangeIcon from "../../assets/change.svg";

export default {
	props: {
		data: {
			type: undefined,
		},
	},
	components: {
		DownloadIcon,
		DeleteIcon,
		ChangeIcon,
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
		open(url) {
			window.open(url, "_blank");
		},
		deleteFile() {
			this.$contenuAPI.removeFile(
				this.value.__value,
				this.$auth.generateAuthHeader()
			);
			this.value.__value = "";
			this.$emit("changed", {
				__value: "",
				__type: "image",
			});
		},
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
.fileField .btns svg {
	height: 20px;
	width: 20px;
}
</style>
