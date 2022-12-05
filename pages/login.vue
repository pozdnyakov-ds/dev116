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
				password: ''
			}
		}
	},
	methods: {
		async submitForm(userInfo) {
			try {
				const captchaToken = await this.$recaptcha.execute('login');
				console.log("Captcha token: ", captchaToken); 

				try {
					await this.$axios.post('/auth/login', {
						email: userInfo.email,
						password: userInfo.password,
						captcha_token: captchaToken
					}).then(async (response) => {
						this.error = response.data.error;
						this.message = response.data.message;
						var token = response.data.token;

						if (response.data.error == 0 && token && token.length > 0) {
							try {
								const headers = {
									'Authorization': 'Bearer ' + token
								}
								await this.$axios.get('/users/auth', {
										headers: headers
									})
									.then((resp) => {
									var user = resp.data.user;

									let scope = user.scope.split(',') || [];
									user.scope = scope;
									
									// Set auth user
									// console.log('LOGGED USER: ', user);
									this.$store.commit('setUser', user);
									
									this.$toast.success('Успешный вход');
									this.$router.push('/')
								});
							} catch (e) {
								//console.error("Ошибка USER API: ", e);
								this.$router.push('/')
							}
						} else {
							this.$toast.error('Ошибка данных ответа входа');
						}
					}).catch(e => {
						this.$toast.error('Ошибка API входа!');
						this.error = 2;
						this.message = 'Ошибка API входа';
					});

				} catch (e) {
					this.$toast.error('Ошибка входа!');
					this.error = 3;
					this.message = 'Ошибка входа';
				}
			} catch (error) {
				console.log('Recaptcha error:', error)
			}
		}
	},
	async mounted() {
		//console.log(this.$route.query);
		if (this.$route.query && this.$route.query.error == '1' && this.$route.query.message) {
			this.message = this.$route.query.message;
		}

		try {
			await this.$recaptcha.init();
		} catch (e) {
			console.error(e);
		}
	},
	beforeDestroy() {
		this.$recaptcha.destroy()
	},
}
</script>

<style scoped>
.error--text {
	color: red;
}
</style>