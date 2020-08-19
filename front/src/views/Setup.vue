<template>
	<div class="m-auto p-4 max-w-xs">
		<div class>
			<h2 class="block text-lg leading-tight font-bold text-gray-800">Setup Contenu</h2>
			<p class="mt-3 text-gray-600">To setup Contenu, you need to choose a password to manage content.</p>
			<div class="mb-6 mt-3">
				<input
					class="outline-none appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight"
					type="password"
					placeholder="Password"
					v-model="newPassword"
					@keypress.enter="setup"
				/>
				<p
					v-if="newPasswordError"
					class="text-red-500 text-xs italic"
				>{{newPasswordError}}</p>
				<input
					class="outline-none appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight"
					type="password"
					placeholder="Confirm password"
					v-model="confirmPassword"
					@keypress.enter="setup"
				/>
				<p
					v-if="confirmPasswordError"
					class="text-red-500 text-xs italic"
				>{{confirmPasswordError}}</p>

				<p
					v-for="e in error"
					class="text-red-500 text-xs italic mb-2"
					v-if="error"
				>{{e}}</p>

				<p
					class="text-green-500 text-xs mb-2"
					v-if="success"
				>{{success}}</p>
				<div class="text-center">
					<button
						@click="setup"
						class="mt-4 inline-flex items-center transition duration-100 ease-in-out outline-none focus:outline-none bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold py-2 px-6 rounded"
					>
						<Loading v-if="loading" />
						{{buttonText}}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>


<script>
import Loading from "../assets/loading.svg";
export default {
	components: {
		Loading
	},
	data() {
		return {
			newPassword: "",
			confirmPassword: "",
			loading: false,
			buttonText: "Setup and login",
			confirmPasswordError: null,
			newPasswordError: null,
			error: null,
			success: null
		};
	},
	created() {
		this.$contenuAPI.init().then(data => {
			if (this.$auth.isAuthorized()) this.$router.push("/");
			else this.$router.push("/login");
		});
	},
	methods: {
		setup() {
			this.settingup(false);
			if (!this.confirmPassword.length || !this.newPassword.length) {
				if (!this.newPassword.length)
					this.newPasswordError = "This field is required.";

				if (!this.confirmPassword.length)
					this.confirmPasswordError = "This field is required.";

				return;
			}

			if (this.newPassword != this.confirmPassword) {
				this.confirmPasswordError = "Confirm password doesn't match";
				return;
			}
			this.settingup(true);
			this.$contenuAPI
				.resetPassword({
					type:"register",
					password: this.newPassword
				})
				.then(response => {
					this.settingup(false);
					this.$auth.setToken(response.data.token);
					this.$router.push("/");
				})
				.catch(error => {
					this.settingup(false);
					this.loading = false;
					this.error = error.data.message;
				});
		},
		settingup(bool) {
			this.loading = bool;
			this.buttonText = bool ? "Proccessing" : "Setup and login";
			this.confirmPasswordError = null;
			this.newPasswordError = null;
			this.error = null;
			this.success = null;
		},
		resetFields() {
			this.confirmPassword = "";
			this.newPassword = "";
		},
		login() {
			this.$router.push("/");
		}
	}
};
</script>
