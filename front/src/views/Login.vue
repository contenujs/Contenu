<template>
	<div class="m-auto p-4 max-w-xs">
		<div>
			<h2 class="block text-lg leading-tight font-bold text-gray-800">Login</h2>
			<p class="mt-3 text-gray-600 text-sm">Enter the password to manage the content.</p>
			<div class="mb-6 mt-3">
				<input
					@keypress.enter="login"
					class="outline-none focus:border-primary-500 focus:border-2 appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2 leading-tight"
					type="password"
					placeholder="Password"
					v-model="loginPassword"
				/>
				<p
					v-for="error in loginError"
					class="text-red-500 text-xs italic mb-2"
					v-if="loginError"
				>{{error}}</p>
				<div class="text-center">
					<button
						@click="login()"
						class="mt-1 inline-flex items-center transition duration-100 ease-in-out outline-none focus:outline-none bg-primary-500 hover:bg-primary-600 text-white text-sm font-bold py-2 px-6 rounded"
					>
						<Loading v-if="loading" />
						{{loginText}}
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
			loginPassword: "",
			loading: false,
			loginText: "Login",
			loginError: null
		};
	},
	methods: {
		login() {
			this.loggingIn(true);
			this.$contenuAPI
				.login(this.loginPassword)
				.then(response => {
					this.loggingIn(false);
					this.$auth.setToken(response.data.token);
					this.$router.push("/");
				})
				.catch(error => {
					this.loggingIn(false);
					this.loading = false;
					this.loginError = error.data.message;
				});
		},
		loggingIn(bool) {
			this.loginError = "";
			this.loading = bool;
			this.loginText = bool ? "Logging in" : "Login";
		}
	}
};
</script>

<style>
</style>
