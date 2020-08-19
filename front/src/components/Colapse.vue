<script>
export default {
	data() {
		return {
			open: true
		};
	},
	props: {
		children: {
			required: true
		},
		val: {
			required: true
		}
	},
	render: function(h) {
		return h(
			"div",
			{
				class: {
					"m-auto px-2 pt-1 max-w-xs mt-2 mb-2": !Array.isArray(this.children),
					"hasChildren m-auto p-2 ml-2 pr-0 pb-0 pt-0 mb-1 mt-2 max-w-xs border-l-2": Array.isArray(
						this.children
					),
					closed: !this.open
				}
			},
			[
				h(
					"div",
					{
						class: Array.isArray(this.children)
							? "parent flex cursor-pointer"
							: "field-name",
						on: {
							click: () => {
								if (Array.isArray(this.children)) {
									let sum = 0;

									let el = this.$el.children[1];
									sum += el.scrollHeight;
									while (el != undefined) {
										for (let index in el.children) {
											if (
												el.children[index].classList &&
												el.children[index].classList.contains("hasChildren")
											) {
												if (
													el.children[index].children[1].classList.contains(
														"closed"
													)
												)
													sum += el.scrollHeight;
											}
										}

										el = el.children[1];
									}
									if (this.$el.children[1].style.maxHeight.length === 0)
										this.$el.children[1].style.maxHeight = sum + "px";

									setTimeout(() => {
										if (this.open) {
											this.$el.children[1].style.maxHeight = 0;
										} else {
											this.$el.children[1].style.maxHeight = sum + "px";
										}
										this.open = !this.open;
									});
								}
							}
						}
					},

					!Array.isArray(this.children)
						? [
								h(
									"span",
									{
										class: "pr-2 capitalize font-sans text-sm"
									},
									this.val
								)
						  ]
						: [
								h("button"),
								h(
									"span",
									{
										class: "pr-2 capitalize font-sans text-sm ml-1 font-light"
									},
									this.val
								)
						  ]
				),
				h(
					"div",
					{
						class: { child: true, closed: !this.open }
					},
					[this.children]
				)
			]
		);
	}
};
</script>
<style lang="scss">
$button-border: #e1e1e1;
$parent-text-color: #808192;
.child {
	transition: max-height 0.5s ease-in-out;
	overflow: hidden;
}
.hasChildren.closed button {
	&::before {
		display: none;
	}
}
.parent {
	margin-left: -16px;
	& > button {
		outline: none;
		position: relative;
		width: 14px;
		height: 14px;
		padding: 2px;
		border-radius: 3px;
		border: 2px solid $button-border;
		background-color: #fff;

		&:before,
		&:after {
			content: "";
			position: absolute;
			background-color: $button-border;
			transition: transform 0.25s ease-out;
		}

		/* Vertical line */
		&:before {
			top: 10%;
			left: 44%;
			width: 2px;
			height: 80%;
		}

		/* horizontal line */
		&:after {
			top: 44%;
			left: 10%;
			width: 80%;
			height: 2px;
		}
	}
	& > span {
		color: $parent-text-color;
		line-height: 14px;
	}
}
</style>
