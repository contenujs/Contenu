<template>
	<div class="m-auto p-4 max-w-xs">
		<div class>
			<router-link
				to="/"
				class="underline text-gray-500 text-sm mb-2 inline-block"
			>Back</router-link>

			<!-- <span
				class="underline text-gray-500 text-sm mb-2 block float-right cursor-pointer"
				@click="logout()"
			>Logout</span>-->

			<h2 class="block text-lg leading-tight font-bold text-gray-800">Reset password</h2>
			<p class="mt-3 text-gray-600">To change the password, fill the fileds below.</p>
			<div class="mb-6 mt-3">
				<input
					@keypress.enter="resetPassword"
					class="outline-none appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-1 leading-tight border-gray-400 focus:shadow-md focus:border-primary-500 focus:border-2"
					type="password"
					v-model="currentPassword"
					placeholder="Current Password"
				/>

				<p
					v-if="currentPasswordError"
					class="text-red-500 text-xs italic"
				>{{currentPasswordError}}</p>
				<input
					@keypress.enter="resetPassword"
					class="outline-none appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 mb-1 leading-tight border-gray-400 focus:shadow-md focus:border-primary-500 focus:border-2"
					type="password"
					v-model="newPassword"
					placeholder="New Password"
				/>

				<p
					v-if="newPasswordError"
					class="text-red-500 text-xs italic"
				>{{newPasswordError}}</p>

				<input
					@keypress.enter="resetPassword"
					class="outline-none appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 mb-1 leading-tight border-gray-400 focus:shadow-md focus:border-primary-500 focus:border-2"
					type="password"
					v-model="confirmPassword"
					placeholder="Repeat New Password"
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
						@click="resetPassword"
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
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
			loading: false,
			buttonText: "Reset password",
			confirmPasswordError: null,
			newPasswordError: null,
			currentPasswordError: null,
			error: null,
			success: null
		};
	},
	methods: {
		resetPassword() {
			this.restartingPassword(false);
			if (
				!this.currentPassword.length ||
				!this.confirmPassword.length ||
				!this.newPassword.length
			) {
				if (!this.currentPassword.length)
					this.currentPasswordError = "This field is required.";

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
			this.restartingPassword(true);
			this.$contenuAPI
				.resetPassword(
					{
						type:"reset_password",
						currentPassword: this.currentPassword,
						password: this.newPassword
					},
					this.$auth.generateAuthHeader()
				)
				.then(response => {
					this.restartingPassword(false);
					// this.$auth.setToken(response.data.token);
					// this.$router.push("/");
					this.resetFields();
					this.success = response.data.message;
				})
				.catch(error => {
					this.restartingPassword(false);
					this.loading = false;
					this.error = error.data.message;
				});
		},
		restartingPassword(bool) {
			this.loading = bool;
			this.buttonText = bool ? "Proccessing" : "Reset password";
			this.currentPasswordError = null;
			this.confirmPasswordError = null;
			this.newPasswordError = null;
			this.error = null;
			this.success = null;
		},
		resetFields() {
			this.currentPassword = "";
			this.confirmPassword = "";
			this.newPassword = "";
		}
	}
};
</script>
