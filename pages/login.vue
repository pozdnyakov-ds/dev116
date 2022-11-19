<template>
	<div style="background: #fff; border: 1px solid #ccc; 
        border-radius: 5px; padding: 10px;">
		
		<v-form v-model="valid">
			<v-container>

				<p style="text-align: center;"><b>Войти в панель управления</b></p>

				<div class="input-group mb-3">
					<v-text-field v-model="userInfo.email" label="Email" type="email" append-icon="mdi-mail" counter=64
						outlined :rules="[required('Email'), minLength('Email', 5), maxLength('Email', 64)]" />
				</div>

				<div class="input-group mb-3">
					<v-text-field v-model="userInfo.password" label="Пароль" :type="showPassword ? 'text' : 'password'"
						:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword"
						counter=16 outlined
						:rules="[required('Пароль'), minLength('Пароль', 3), maxLength('Пароль', 16)]" />
				</div>

				<div class="col-12" style="padding: 0px;">
					<v-btn block @click.prevent="submitForm(userInfo)" :disabled="!valid">Войти</v-btn>
				</div>

				<div class="col-12" style="text-align: center;">
					<nuxt-link to="/register" style="text-decoration: none;">Регистрация</nuxt-link>
				</div>

				<div class="col-12" style="text-align: center; padding: 0px; padding-buttom: 0px;">
					<nuxt-link to="/forgot" style="text-decoration: none;">Забыл пароль</nuxt-link>
				</div>

				<div v-if="message" class="row" style="text-align: center;">
					<div class='col-12'><span style="color: red; font-size: 90%;">{{ message }}</span></div>
				</div>

			</v-container>

		</v-form>
	</div>
</template>

<script>
export default {
	layout: 'login',
	data() {
		return {
			strategy: 'local',
			valid: false,
			error: 0,
			message: '',
			showPassword: false,
			required(propertyType) {
				return v => v && v.length > 0 || `Нужно указать ${propertyType}`
			},
			minLength(propertyType, minLength) {
				return v => v && v.length >= minLength || `${propertyType} должно быть минимум ${minLength} символов!`
			},
			maxLength(propertyType, maxLength) {
				return v => v && v.length <= maxLength || `${propertyType} должно быть меньше ${maxLength} символов!`
			},
			userInfo: {
				email: '2903015@gmail.com',
				password: '555'
			}
		}
	},
	methods: {
		async submitForm(userInfo) {
			try {
				await this.$auth.loginWith('local', {
					data: {
						email: userInfo.email,
						password: userInfo.password
					}
				}).then(async (response) => {
					this.error = response.data.error;
					this.message = response.data.message;

					if (response.data.error == 0 && response.data.token && response.data.token.length > 0) {
						try {
							this.$axios.setHeader("Authorization", "Bearer " + response.data.token);
							this.$axios.get('/users/auth').then((resp) => {
								var user = resp.data.user;

								let scope = user.scope.split(',') || [];
								user.scope = scope;
								//console.log("USER DATA: ", user);

								// Set Axios token
								this.$axios.setToken(user.token);

								// Set localStorage Tokens
								this.$storage.setUniversal('token', user.token)
								this.$storage.setUniversal('refresh_token', user.refresh_token)
								
								// Set auth user
								this.$auth.setUser(user);
								
								this.$toast.success('Успешный вход');
								this.$router.push('/')
							});
						} catch (e) {
							//console.error("Ошибка USER API: ", e);
							this.$router.push('/')
						}
					} else {
						this.$toast.error('Ошибка входа');
					}
				}).catch(e => {
					this.$toast.error('Ошибка входа!');
					this.error = 2;
					this.message = 'Ошибка входа';
				});

			} catch (e) {
				this.$toast.error('Ошибка входа!');
				this.error = 3;
				this.message = 'Ошибка входа';
			}
		}
	},
	mounted() {
		//console.log(this.$route.query);
		if (this.$route.query && this.$route.query.error == '1' && this.$route.query.message) {
			this.message = this.$route.query.message;
		}
	}
}
</script>

<style scoped>
.error--text {
	color: red;
}
</style>