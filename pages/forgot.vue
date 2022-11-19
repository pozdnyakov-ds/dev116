<template>
	<div style="background: #fff; border: 1px solid #ccc; 
        border-radius: 5px; padding: 10px;">

        <v-form v-model="valid">
            <v-container>
        
                <p style="text-align: center;"><b>Сбросить пароль</b></p>
        
                <div class="input-group mb-3">
                    <v-text-field v-model="userInfo.email" label="Email" type="email" append-icon="mdi-mail" counter=64 outlined
                        :rules="[required('Email'), minLength('Email', 5), maxLength('Email', 64)]" />
                </div>
        
                <div class='row'>
                    <div class="col-12">
                        <v-btn block @click.prevent="submitForm(userInfo)" :disabled="!valid">Сбросить</v-btn>
                    </div>
                </div>

                <div class="col-12" style="text-decoration: none; text-align: center;">
                    <nuxt-link to="/login">Назад</nuxt-link>
                </div>
        
                <div v-if="message" class='row'>
                    <div class='col-12'><span style="text-align: center; color: red; font-size: 90%;">{{ message }}</span></div>
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
                email: '2903015@gmail.com',
            }
        }
    },
    methods: {
        async submitForm(userInfo) {
            try {
                const r = await this.$axios.post('/forgot', userInfo)
                    .then(response => {
                        this.error = response.data.error;
                        this.message = response.data.message;
                        if (response.data.error == 0) {
                            this.$toast.success('Выслано подтверждение на почту');
                            this.$router.push('/login');
                        } else {
                            this.$toast.error('Ошибка сброса пароля!');
                        }
                    })
                    .catch(e => {
                        this.$toast.error('Ошибка сброса пароля!');
                        this.error = 2;
                        this.message = 'Ошибка сброса пароля!';
                    });
            } catch (e) {
                this.$toast.error('Ошибка сброса пароля!');
                this.error = 3;
                this.message = 'Ошибка сброса пароля!';
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