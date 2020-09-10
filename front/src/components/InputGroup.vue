<script>
import colapse from "./Colapse";
export default {
	props: {
		inputs: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			definedTypes: ["Text", "Textarea", "Image"],
			defaultImageUrl: "/static/default-image.png",
			errors: [],
			errorTimeout: 2500,
		};
	},
	components: {
		colapse,
	},
	methods: {
		processData(data, h, lastKeyName) {
			let content = [];
			for (let key in data) {
				if (typeof data[key] === "object") {
					let children = this.processData(
						data[key],
						h,
						lastKeyName.length ? lastKeyName + "." + key : key
					);
					content.push(
						h("colapse", {
							props: {
								children,
								val: key,
							},
						})
					);
				} else {
					if (key == "__value") {
						return h("div", [
							h(
								"select",
								{
									attrs: {
										tabindex: "-1",
									},
									class: "typeChanger focus:outline-none",
									on: {
										change: (event) => {
											if (
												(data.__type != "image" &&
													event.target.value.toLowerCase() == "image") ||
												(data.__type == "image" &&
													event.target.value.toLowerCase() != "image")
											) {
												if (
													data.__type == "image" &&
													event.target.value.toLowerCase() != "image"
												) {
													this.$contenuAPI.removeFile(
														data.__value,
														this.$auth.generateAuthHeader()
													);
												}

												data.__value = "";
												this.$emit("valueChangedPath", lastKeyName, "");
											}
											data.__type = event.target.value.toLowerCase();
											this.$forceUpdate();
											this.$emit("typeChangedPath", lastKeyName, data.__type);
										},
									},
								},
								this.definedTypes.map((item) => {
									return h(
										"option",
										{
											attrs: {
												selected: data.__type == item.toLowerCase(),
											},
										},
										item
									);
								})
							),
							h("div", [
								h(this.inputType(data.__type), {
									class:
										"outline-none inline appearance-none border border-gray-400 rounded-lg  focus:border-primary-500 focus:border-2 w-full transition duration-100 ease-in-out py-1 px-1 text-gray-700 mt-1 text-md leading-tight",
									domProps: {
										value: data[key],
									},
									attrs: this.typeAttrs(data),
									on: this.dataTypeEvents(data, key, lastKeyName),
								}),
								data.uploading
									? h(
											"div",
											{
												class: "progress-bar mt-1 relative",
											},
											[
												h("div", {
													class:
														"bg-primary-100 block h-3 bg-opacity-25 border border-primary-500 rounded w-100 bsolute z-10",
												}),
												h("div", {
													class:
														"transition-all duration-75 ease-in-out bg-primary-100 block h-3 rounded absolute z-20 top-0",
													style: {
														width: data.uploading.percent + "%",
													},
												}),
											]
									  )
									: null,
							]),
						]);
					}
				}
			}
			return content;
		},
		dataTypeEvents(data, key, lastKeyName) {
			if (
				data.__type == "text" ||
				data.__type == "textarea" ||
				typeof data.__type == "undefined"
			)
				return {
					keyup: (event) => {
						data[key] = event.target.value;

						this.$emit("valueChangedPath", lastKeyName, event.target.value);
					},
				};
			if (data.__type == "image")
				return {
					click: () => {
						var input = document.createElement("input");
						input.type = "file";
						input.click();
						input.addEventListener(
							"change",
							(event) => {
								this.processImageUpload(event.path[0].files, data, lastKeyName);
							},
							false
						);
					},
					dragenter: (event) => {
						event.preventDefault();
						event.stopPropagation();
						this.highlightElement(event.srcElement);
					},
					dragover: (event) => {
						event.preventDefault();
						event.stopPropagation();
						this.highlightElement(event.srcElement);
					},
					drop: (event) => {
						event.preventDefault();
						event.stopPropagation();
						this.processImageUpload(
							event.dataTransfer.files,
							data,
							lastKeyName
						);
						this.unHighlightElement(event.srcElement);
					},
					dragleave: (event) => {
						event.preventDefault();
						event.stopPropagation();
						this.unHighlightElement(event.srcElement);
					},
				};
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
		processImageUpload(files, data, lastKeyName) {
			let m = "";
			if (files.length == 1) {
				// if file is image
				if (this.isFileImage(files[0])) {
					if (data.__type === "image") {
						var selectedFile = files[0];
						var reader = new FileReader();
						reader.onload = function (event) {
							// data.__value = event.target.result;
						};
						reader.readAsDataURL(selectedFile);
						data.uploading = {
							percent: 0,
						};
						const formData = new FormData();
						formData.append("file", files[0]);
						this.$contenuAPI.uploadFile(
							formData,
							this.$auth.generateAuthHeader(),
							(event) => {
								let p = Math.round((event.loaded / event.total) * 100);
								data.uploading.percent = p;
								this.$forceUpdate();
								if (p == 100) {
									delete data.uploading;
								}
							},
							(e) => {
								if (e.ok) {
									data.__value = e.file.filename;
									this.$emit("valueChangedPath", lastKeyName, {
										__value: data.__value,
										__type: "image",
									});
									this.$forceUpdate();
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
				this.errors.push(m);
				setTimeout(() => {
					this.errors = this.errors.filter((item) => {
						if (item != m) return item;
					});
				}, this.errorTimeout);
			}
		},
		isFileImage(file) {
			return file && file["type"].split("/")[0] === "image";
		},
		inputType(type) {
			if (type) {
				switch (type) {
					case "textarea":
						return "textarea";
						break;
					case "image":
						return "img";
						break;
					default:
						return "input";
						break;
				}
			}
			return "input";
		},
		typeAttrs(data) {
			if (data.__type == "textarea") {
				return { rows: 4 };
			}
			if (data.__type == "image") {
				return {
					src:
						data.__value.length > 0
							? this.$contenuAPI.apiUrl + "/files/" + data.__value
							: this.defaultImageUrl,
				};
			}
		},
	},
	render(h) {
		return h(
			"div",
			{
				class: "m-auto max-w-xs rounded-lg",
			},
			[
				this.errors.length > 0
					? h(
							"div",
							{
								class:
									"rounded-lg bg-red-500 text-sm text-white p-2 absolute z-20 w-100",
							},
							[
								...this.errors.map((item) => {
									return h("p", item);
								}),
							]
					  )
					: null,
				this.processData(this.inputs, h, ""),
			]
		);
	},
};
</script>
<style lang="scss">
$button-border: #e1e1e1;
$parent-text-color: #808192;
.field-name {
	span {
		color: $parent-text-color;
	}
}
.field-name + .child {
	margin-top: -17px;
}
.field-name + .child img {
	max-height: 200px;
	object-fit: contain;
	cursor: pointer;
	min-width: 100%;
	min-height: 150px;
}
select.typeChanger {
	border: 1px solid #acadb9;
	color: #acadb9;
	// width: 15px;
	line-height: 13px;
	height: 15px;
	font-weight: 700;
	font-size: 9px;
	border-radius: 4px;
	float: right;
}
</style>
