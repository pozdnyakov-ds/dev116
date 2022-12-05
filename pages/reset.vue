<template>
	<div style="background: #fff; border: 1px solid #ccc; 
        border-radius: 5px; padding: 10px;">
                
                <v-form v-model="valid">
                    <v-container>

                    <p style="text-align: center;"><b>Создать новый пароль</b></p>

                    <div class="input-group mb-3">
                        <v-text-field v-model="userInfo.email" label="Email" type="email" append-icon="mdi-mail" counter=64 outlined
                            :rules="[required('Email'), minLength('Email', 5), maxLength('Email', 64)]" disabled/>
                    </div>

                    <div class="input-group mb-3">
                        <v-text-field v-model="userInfo.password" label="Пароль" :type="showPassword ? 'text' : 'password'"
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword" counter=16
                            outlined :rules="[required('Пароль'), minLength('Пароль', 3), maxLength('Пароль', 16)]" />
                    </div>

                    <div class="input-group mb-3">
                        <v-text-field v-model="userInfo.repeatPassword" label="Повторить пароль" :type="showPassword ? 'text' : 'password'"
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword" counter=16
                            outlined :rules="[required('Пароль'), minLength('Пароль', 3), maxLength('Пароль', 16), comparePasswords('Пароль', userInfo.password, userInfo.repeatPassword)]" />
                    </div>

                    <div class='row'>
                        <div class="col-12">
                            <v-btn block @click.prevent="submitForm(userInfo)" :disabled="!valid">Подтвердить</v-btn>
                        </div>
                    </div>

                    <div class="col-12">
                        <nuxt-link to="/login" style="text-decoration: none; text-align: center;">Назад</nuxt-link>
                    </div>

                    <div v-if="message" class='row'>
                        <div class='col-12'><span style="color: red; font-size: 90%; text-align: center;">{{ message }}</span></div>
                    </div>

                    </v-container>
                </v-form>
    </div>
</template>

<script>
export default {
    layout: 'login',
    components: {},
    data() {
        return {
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
            comparePasswords(propertyType, p1, p2) {
                return v => p1 == p2 || `Пароли не совпадают!`
            },
            userInfo: {
                email: this.$route.query.email || '',
                token: this.$route.query.token || '',
                password: '',
                repeatPassword: ''
            }
        }
    },
    methods: {
        async submitForm(userInfo) {
            try {
                const captchaToken = await this.$recaptcha.execute('login');
                userInfo["captchaToken"] = captchaToken;
                
                const r = await this.$axios.post('/auth/reset', userInfo)
                    .then(response => {
                        this.error = response.data.error;
                        this.message = response.data.message;
                        if (response.data.error == 0) {
                            this.$toast.success('Пароль успешно изменен');
                            this.$router.push('/login');
                        } else {
                            this.$toast.error('Ошибка изменения пароля!');
                        }
                    })
                    .catch(e => {
                        this.$toast.error('Ошибка изменения пароля!');
                        this.error = 2;
                        this.message = 'Ошибка изменения пароля!';
                    });
            } catch (e) {
                this.$toast.error('Ошибка изменения пароля!');
                this.error = 3;
                this.message = 'Ошибка изменения пароля!';
            }
        }
    },
}
</script>

<style scoped>
    .error--text {
        color: red;
    }
    .v-text-field__slot {
        border: 1px solid #ccc;
        border-radius: 3px;
    }
</style>