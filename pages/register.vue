<template>
	<div style="background: #fff; border: 1px solid #ccc; 
        border-radius: 5px; padding: 10px;">

        <v-form v-model="valid">
            <v-container>

            <p style="text-align: center;"><b>Регистрация нового пользователя</b></p>
        
            <div class="input-group mb-3">
                <v-text-field v-model="userInfo.name" label="Имя" type="text" append-icon="mdi-account-circle" counter=25
                    outlined :rules="[required('Имя'), minLength('Имя', 3), maxLength('Имя', 25)]" />
            </div>
        
            <div class="input-group mb-3">
                <v-text-field v-model="userInfo.email" label="Email" type="email" append-icon="mdi-mail" counter=64 outlined
                    :rules="[required('Email'), minLength('Email', 5), maxLength('Email', 64)]" />
            </div>
        
            <div class="input-group mb-3">
                <v-text-field v-model="userInfo.password" label="Пароль" :type="showPassword ? 'text' : 'password'"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword"
                    counter=16 outlined :rules="[required('Пароль'), minLength('Пароль', 3), maxLength('Пароль', 16)]" />
            </div>
        
            <div class='row'>
                <div class="col-12">
                    <v-btn block @click.prevent="submitForm(userInfo)" :disabled="!valid">Регистрация</v-btn>
                </div>
            </div>

            <div class="col-12" style="text-align: center;">
                <nuxt-link to="/login" style="text-decoration: none;">Войти</nuxt-link>
            </div>
        
            <div v-if="message" class="row" style="text-align: center; padding: 0px;">
                <div class='col-12'><span style="color: red; font-size: 90%;">{{ message }}</span></div>
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
            userInfo: {
                name: 'Dmitry',
                email: '2903015@gmail.com',
                password: ''
            }
        }
    },
    methods: {
        async submitForm(userInfo) {
            try {
                const r = await this.$axios.post('/user', userInfo)
                    .then(response => {
                        this.error = response.data.error;
                        this.message = response.data.message;
                        if (response.data.error == 0) {
                            console.log('Регистрация успешна!', response);
                            this.$toast.success('Регистрация успешна!');
                            this.$router.push('/login');
                        } else { 
                            this.$toast.error('Ошибка регистрации!');
                        }
                    })
                    .catch(e => {
                        this.$toast.error('Ошибка регистрации!');
                        this.error = 2;
                        this.message = 'Ошибка регистрации';
                    });
            } catch (e) {
                this.$toast.error('Ошибка регистрации!');
                this.error = 3;
                this.message = 'Ошибка регистрации';
            }
        }
    },
}
</script>

<style scoped>
.error--text {
    color: red;
}
</style>