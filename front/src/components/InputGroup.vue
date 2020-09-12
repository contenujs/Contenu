<script>
import colapse from "./Colapse";
import InputField from "./fieldsComponents/InputField";
import TextareaField from "./fieldsComponents/TextareaField";
import FileField from "./fieldsComponents/FileField";
import TypeSelect from "./TypeSelect";
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
			errors: [],
			errorTimeout: 2500,
		};
	},
	components: {
		colapse,
		InputField,
		TextareaField,
		FileField,
		TypeSelect,
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
							h("TypeSelect", {
								attrs: {
									tabindex: "-1",
								},
								props: {
									data,
								},
								on: this.dataTypeEvents(data, key, lastKeyName),
							}),
							h("div", [
								h(this.inputType(data.__type), {
									props: this.dataTypeProps(data, key),
									on: this.dataTypeEvents(data, key, lastKeyName),
								}),
							]),
						]);
					}
				}
			}
			return content;
		},
		dataTypeProps(data, key) {
			if (data.__type == "image")
				return {
					data,
				};
			return {
				data: data[key],
			};
		},
		dataTypeEvents(data, key, lastKeyName) {
			return {
				changed: (value) => {
					data[key] = value;
					this.$emit("valueChangedPath", lastKeyName, value);
				},
				typeChanged: (value) => {
					data.__type = value;
					this.$forceUpdate();
					this.$emit("typeChangedPath", lastKeyName, data.__type);
				},
				error: (value) => {
					this.errors.push(value);
					setTimeout(() => {
						this.errors = this.errors.filter((item) => {
							if (item != value) return item;
						});
					}, this.errorTimeout);
				},
			};
		},
		inputType(type) {
			if (type) {
				switch (type) {
					case "textarea":
						return "TextareaField";
						break;
					case "image":
						return "FileField";
						break;
					default:
						return "InputField";
						break;
				}
			}
			return "InputField";
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
