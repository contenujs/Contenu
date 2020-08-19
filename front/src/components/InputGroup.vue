<script>
import colapse from "./Colapse";
export default {
	props: {
		inputs: {
			type: Object,
			required: true
		}
	},
	components: {
		colapse
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
								val: key
							}
						})
					);
				} else {
					if (key == "__value") {
						return h("div", [
							h(
								"button",
								{
                  					attrs: {
                    				tabindex: "-1"
                  				},
									class: "typeChanger focus:outline-none",
									on: {
										click: () => {
											if (typeof data.__type === "undefined")
												data.__type = "text";
											if (data.__type == "textarea") data.__type = "text";
											else data.__type = "textarea";
											this.$forceUpdate();
											this.$emit("typeChangedPath", lastKeyName, data.__type);
										}
									}
								},
								"T"
							),
							h(data.__type == "textarea" ? "textarea" : "input", {
								class:
									"outline-none appearance-none border border-gray-400 rounded-lg  focus:border-primary-500 focus:border-2 w-full transition duration-100 ease-in-out py-1 px-1 text-gray-700 mt-1 text-md leading-tight",
								domProps: {
									value: data[key]
								},
								attrs: {
									rows: 4
								},
								on: {
									keyup: event => {
										data[key] = event.target.value;

										this.$emit(
											"valueChangedPath",
											lastKeyName,
											event.target.value
										);
									}
								}
							})
						]);
					}
				}
			}
			return content;
		}
	},
	render(h) {
		return h(
			"div",
			{
				class: "m-auto max-w-xs rounded-lg"
			},
			[this.processData(this.inputs, h, "")]
		);
	}
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
button.typeChanger {
	border: 1px solid #acadb9;
	color: #acadb9;
	width: 15px;
	line-height: 13px;
	height: 15px;
	font-weight: 700;
	font-size: 9px;
	border-radius: 4px;
	float: right;
}
</style>
