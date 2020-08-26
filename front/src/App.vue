<template>
	<div
		id="app"
		class="m-auto relative max-w-xs p-3 pb-5"
	>
		<div class="relative">
			<Logo
				:stroke="openMenu"
				class="transition-all duration-500 ease-in-out absolute contenuController"
				:class="{ 'open' : openMenu}"
				@click="toggleMenu"
			/>
		</div>
		<transition
			mode="out-in"
			name="slide-left"
		>
			<div
				class="manager-plane m-auto bg-white max-w-xs absolute shadow-xl"
				v-if="openMenu"
			>
				<div class="header bg-primary-500 relative">
					<div
						class="p-5"
						:class="{ 'pb-3': $auth.isAuthorized()}"
					>
						<p class="ml-12 -m-1 text-xl text-white font-bold inline-block">Contenu</p>
						<span
							v-if="$auth.isAuthorized()"
							class="text-white underline block text-xs ml-12 -mt-1 cursor-pointer"
							@click="$route.name == 'management' ? $router.push('/reset_password') : $router.push('/')"
						>Settings</span>
						<div class="float-right inline-flex flex-row-reverse items-center">
							<closeIcon
								class="mr-1 p-1 fill-current mt-1 absolute text-white cursor-pointer close"
								width="20"
								height="20"
								@click="toggleMenu"
							></closeIcon>
						</div>
					</div>
					<div
						v-if="$auth.isAuthorized()"
						class="logoutBtn"
						@click="logout()"
					>
						<logoutIcon
							width="30"
							height="34"
							class="p-1 fill-current text-primary-500 cursor-pointer"
						/>
					</div>
				</div>
				<div class="p-4 pt-0 routerContent">
					<transition
						name="routerSlide"
						mode="out-in"
					>
						<router-view class="routerSlide" />
					</transition>
				</div>
			</div>
		</transition>
	</div>
</template>
<script>
import Logo from "./components/logo";
import closeIcon from "./assets/close.svg";
import settingsIcon from "./assets/settings.svg";
import logoutIcon from "./assets/logout.svg";
export default {
	components: {
		Logo,
		closeIcon,
		settingsIcon,
		logoutIcon
	},
	data() {
		return {
			openMenu: !this.inIframe(),
			closable: true
		};
	},
	created() {
		this.$contenuAPI.init().catch(error => {
			if (error.status == 405) this.$router.push("/setup");
		});
	},
	mounted() {
		if(this.$route.query.key)
			this.$store.setKey(this.$route.query.key);
		this.sendCssRules();
	},
	watch: {
		openMenu(val) {
			this.sendCssRules();
		}
	},
	methods: {
		toggleMenu() {
			if (this.closable) this.openMenu = !this.openMenu;
		},
		sendCssRules() {
			if (this.inIframe() && this.closable) {
				this.closable = false;
				let delay = 500;
				let rules = {
					right: 0,
					top: "10%",
					width: "110px",
					height: "100px",
					zIndex: "999999999"
				};
				if (this.openMenu) {
					rules = {
						width: "315px",
						height: "80%",
						zIndex: "999999999"
					};
					delay = 0;
				}
				setTimeout(() => {
					parent.postMessage(
						{ type: "cssRules", value: rules },
						document.referrer
					);
					this.closable = true;
				}, delay);
			}
		},
		inIframe() {
			try {
				return window.self !== window.top;
			} catch (e) {
				return true;
			}
		},
		logout() {
			this.$auth.removeToken();
			this.$router.push("/login");
		}
	}
};
</script>
<style lang="scss">
body {
	overflow: hidden;
}
#app {
	padding-top: 0;
}
.logoutBtn {
	position: absolute;
	right: 16px;
	@apply border-2 border-primary-500 bg-white;
	border-radius: 6px;
	bottom: -15px;
	z-index: 1;

	svg {
		margin-right: -2px;
		margin-bottom: -4px;
		padding: 6px;
	}
}
.close {
	top: 21px;
	right: 19px;
}
.routerContent {
	overflow: hidden;
	position: absolute;
	width: 100%;
	height: 100%;
	max-height: calc(100% - 71px);
}
.contenuController {
	cursor: pointer;
	// transform: scale(0.7);
	left: 100%;
	transform: translate(-100%);
	&.open {
		transform: translate(0) rotate(360deg) scale(0.45);
		left: 1px;
	}
	path:not(.stroke) {
		@apply fill-current text-primary-500;
	}
	top: 0;
	z-index: 9999;
}
.header {
	border-radius: 22px;
}
.manager-plane {
	margin-top: 13px;
	max-width: 380px;
	min-width: calc(100% - 26px);
	background-color: #fafafa;
	height: 90vh;
	overflow: auto;
	border-radius: 22px;
}
.slide-left-enter-active,
.slide-left-leave-active {
	transition: all 0.3s ease;
	position: absolute;
	margin-left: 0px;
}
.slide-left-enter,
.slide-left-leave-to {
	opacity: 0;
	margin-left: 60px;
	position: absolute;
}
.routerSlide {
	transition: all 0.2s cubic-bezier(0.55, 0, 0.1, 1);
	height: 100%;
}
.routerSlide-enter {
	opacity: 0;
	transform: translate(30px, 0);
}
.routerSlide-leave-active {
	opacity: 0;
	transform: translate(-30px, 0);
}
</style>
