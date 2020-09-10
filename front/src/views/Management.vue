<template>
	<div class="management m-auto max-w-xs rounded-lg mt-5">
		<div
			class="loading mt-4"
			v-if="loading"
		>
			<div class="flex justify-center w-full">
				<Loading />
			</div>
			<span class="text-sm text-gray-500 text-center block mt-3">Loading content</span>
		</div>
		<div
			v-else
			class="relative w-full h-full"
		>
			<p class="font-semibold">Content manager</p>
			<span
				class="text-xs text-gray-600 block pb-3"
				v-if="lastUpdate"
			>Last modified {{lastUpdate}}</span>
			<span
				class="text-xs text-gray-600 block pb-3"
				v-else
			>This is your first edition</span>
			<div
				class="inputsGroup overflow-auto absolute"
				:class="{notSaved: !saved}"
			>
				<InputGroup
					v-if="inputGroups"
					ref="inputGroup "
					:inputs="inputs"
					@valueChangedPath="valueChanged"
					@typeChangedPath="typeChanged"
				/>
			</div>
			<div
				v-if="Object.keys(inputs).length == 0"
				class="text-center mt-2"
			>
				<svg
					class="fill-current text-gray-500 m-auto"
					width="50"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					version="1.1"
					x="0px"
					y="0px"
					viewBox="0 0 96 120"
					enable-background="new 0 0 96 96"
					xml:space="preserve"
				>
					<g>
						<polygon points="92.662,64.486 73.232,47 22.768,47 3.338,64.486 0.662,61.514 21.232,43 74.768,43 95.338,61.514     " />
					</g>
					<g>
						<path
							d="M90,96H6c-3.309,0-6-2.691-6-6V61h32v2c0,4.963,4.037,9,9,9h14c4.963,0,9-4.037,9-9v-2h32v29   C96,93.309,93.309,96,90,96z M4,65v25c0,1.103,0.897,2,2,2h84c1.103,0,2-0.897,2-2V65H67.847C66.882,71.223,61.488,76,55,76H41   c-6.488,0-11.882-4.777-12.847-11H4z"
						/>
					</g>
					<g>
						<rect
							x="23.981"
							y="20.5"
							transform="matrix(0.5369 0.8437 -0.8437 0.5369 33.1077 -15.3114)"
							width="13.038"
							height="4"
						/>
					</g>
					<g>
						<rect
							x="64.5"
							y="15.981"
							transform="matrix(0.8437 0.5368 -0.5368 0.8437 22.4731 -32.1821)"
							width="4"
							height="13.038"
						/>
					</g>
					<g>
						<rect
							x="46"
							y="14"
							width="4"
							height="13"
						/>
					</g>
				</svg>
				<span class="text-gray-500 text-sm">There is no object accessed from front-end</span>
			</div>
			<div
				class="text-center saveBtn"
				:class="{open : !saved}"
			>
				<button
					@click="submitChanges()"
					class="mt-1 inline-flex items-center transition duration-100 ease-in-out outline-none focus:outline-none bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold py-2 px-6 rounded"
				>
					<Loading
						v-if="btnLoading"
						class="fill-current w-4 h-4 mr-2"
					/>
					{{submitText}}
				</button>
			</div>
		</div>
		<!-- {{inputs}} -->
	</div>
</template>

<script>
import InputGroup from "../components/InputGroup";
import Loading from "../assets/loading.svg";
export default {
	components: {
		InputGroup,
		Loading,
	},
	data() {
		return {
			saved: this.$store.dataIsPublished,
			loading: true,
			inputs: {},
			btnLoading: false,
			submitText: "Publish",
			submitError: null,
			inputGroups: true,
			lastUpdate: null,
		};
	},
	created() {
		if (!this.$auth.isAuthorized()) this.$router.push("/login");

		if (this.$store.getData() === undefined) {
			this.$contenuAPI
				.getData(this.$auth.generateAuthHeader(), this.$store.getKey())
				.then((response) => {
					this.loading = false;
					this.lastUpdate = this.$dayjs(
						response.data.content.updated_at
					).fromNow();
					this.inputs = this.processData(response.data.content);
					this.$store.setData(this.inputs);
					this.requestForNewFields();
				})
				.catch((err) => {
					if (err.status == 401) {
						this.loading = false;
						this.$auth.removeToken();
						this.$router.push("/login");
					} else if (err.status == 403) {
						this.$router.push("/setup");
					}
				});
		} else {
			this.loading = false;
			this.inputs = this.$store.getData();
			this.requestForNewFields();
		}
	},
	mounted() {
		window.addEventListener(
			"message",
			(event) => {
				if (event.data.type == "newField") {
					let data = this.newFieldsHandler(
						event.data.data,
						this.$store.getData()
					);
					this.inputs = data;
					this.$store.setData(this.inputs);
					this.inputGroups = false;
					setTimeout(() => {
						this.inputGroups = true;
					});
				}
			},
			false
		);
	},
	methods: {
		requestForNewFields() {
			if (this.inIframe())
				parent.postMessage({ type: "newFields" }, document.referrer);
		},
		newFieldsHandler(data, currentData) {
			for (let key in data) {
				if (typeof currentData[key] === "undefined") {
					if (Object.keys(data[key]).length == 0) {
						currentData[key] = { __value: "" };
					} else {
						delete currentData.__type;
						delete currentData.__value;
						currentData[key] = {};
						currentData[key] = this.newFieldsHandler(
							data[key],
							currentData[key]
						);
					}
				} else {
					if (typeof currentData[key] === "object") {
						if (Object.keys(currentData[key]).length >= 3) {
							delete currentData[key].__value;
							delete currentData[key].__type;
						}
					}
					if (typeof data[key] === "object")
						currentData[key] = this.newFieldsHandler(
							data[key],
							currentData[key]
						);
				}
			}
			return currentData;
		},
		processData(data) {
			let content = {};
			for (let key in data) {
				if (typeof data[key] === "object") {
					if (key === "__value") {
						content = this.processData(data[key]);
					} else {
						content[key] = {};
						content[key] = this.processData(data[key]);
					}
				} else {
					if (key == "__value" || key == "__type") content[key] = data[key];
				}
			}
			return content;
		},
		submitChanges() {
			this.saving(true);
			this.$contenuAPI
				.saveData(
					{ content: this.$store.getData(), key: this.$store.getKey() },
					this.$auth.generateAuthHeader()
				)
				.then((response) => {
					this.saving(false);
					this.saved = true;
					this.$store.setDataIsPublished(true);
				})
				.catch((error) => {
					this.saving(false);
				});
		},
		saving(bool) {
			this.submitError = "";
			this.btnLoading = bool;
			this.submitText = bool ? "Saving" : "Publish";
		},
		changeDeepValue(obj, path, value) {
			let p = path.split(".");
			if (p.length == 0) return obj;
			if (p.length == 1) {
				if (path == "__value") obj[path] = value;
				else obj[path].__value = value;
				return obj;
			}
			if (p.length > 1) {
				let key = p[0];
				p.splice(0, 1);
				obj[key] = this.changeDeepValue(obj[key], p.join("."), value);
			}
			return obj;
		},
		changeDeepType(obj, path, type) {
			let p = path.split(".");
			if (p.length == 0) return obj;
			if (p.length == 1) {
				obj[path].__type = type;
				return obj;
			}
			if (p.length > 1) {
				let key = p[0];
				p.splice(0, 1);
				obj[key] = this.changeDeepType(obj[key], p.join("."), type);
			}
			return obj;
		},
		valueChanged(path, data) {
			this.saved = false;
			this.$store.setDataIsPublished(false);
			let obj = this.$store.getData();
			if (data.__type === "image") {
				this.$store.setData(
					this.changeDeepValue(obj, path + ".__value", data.__value)
				);
			} else this.$store.setData(this.changeDeepValue(obj, path, data));
			if (this.inIframe())
				parent.postMessage(
					{
						type: "dataUpdate",
						path,
						data,
					},
					document.referrer
				);
		},
		typeChanged(path, data) {
			this.saved = false;
			this.$store.setDataIsPublished(false);
			let obj = this.$store.getData();
			this.$store.setData(this.changeDeepType(obj, path, data));
		},
		inIframe() {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		},
	},
};
</script>

<style lang="scss">
.loading {
	svg {
		width: 50px;
		height: 50px;
		path {
			@apply fill-current text-gray-500;
		}
	}
}
.inputsGroup {
	max-height: calc(100% - 90px);
	transition: max-height 0.1s ease;
	width: 100%;
	&.notSaved {
		max-height: calc(100% - 114px);
	}
}
.saveBtn {
	position: absolute;
	bottom: 15px;
	width: 100%;
	background-color: #fafafa;
	height: 0px;
	overflow: hidden;
	transition: height 0.3s ease;
	&.open {
		height: 43px;
	}
}
</style>
