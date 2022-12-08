<template>
    <div>
        <h2><b>{{ $t('cab.title') }}</b></h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Totam, voluptas provident? Sit exercitationem dicta
            quis ab corporis libero, consequuntur deleniti nihil officiis illo eius tempore excepturi nemo, error
            deserunt quaerat.</p>
        <v-card style="padding: 10px;">
            <v-row>
                <v-col>
                    <v-form v-model="valid">
                        <v-container>
                            <v-row>
                                <v-col md="6">
                                    <v-text-field v-model="user.name" label="Имя" type="text" append-icon="mdi-mail"
                                        counter=64 outlined
                                        :rules="[required('Имя'), minLength('Имя', 5), maxLength('Имя', 64)]" />
                                </v-col>
                                <v-col md="6">
                                    <v-text-field v-model="user.surname" label="Фамилия" type="text"
                                        append-icon="mdi-mail" counter=64 outlined
                                        :rules="[required('Фамилия'), minLength('Фамилия', 5), maxLength('Фамилия', 64)]" />
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col md="6">
                                    <v-text-field v-model="user.email" label="Email" type="email" append-icon="mdi-mail"
                                        counter=64 outlined readonly disabled/>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col md="6">
                                    <v-text-field v-model="user.password" label="Пароль"
                                        :type="showPassword ? 'text' : 'password'"
                                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append="showPassword = !showPassword" counter=16 outlined
                                        :rules="[required('Пароль'), minLength('Пароль', 3), maxLength('Пароль', 16)]" />
                                </v-col>
                                <v-col md="6">
                                    <v-text-field v-model="user.passwordRepeat" label="Повторить пароль"
                                        :type="showPassword ? 'text' : 'password'"
                                        :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append="showPassword = !showPassword" counter=16 outlined
                                        :rules="[required('Пароль'), minLength('Пароль', 3), maxLength('Пароль', 16),
                                        comparePasswords('Пароль', user.password, user.passwordRepeat)]" />
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col md="3">
                                    <v-btn block @click.prevent="submitForm(user)" :disabled="!valid">Сохранить
                                    </v-btn>
                                </v-col>
                            </v-row>

                        </v-container>
                    </v-form>
                </v-col>
                <v-col class="col-3" style="width: 300px; min-width: 300px;
                 background-color: #eee; padding: 10px;">
                    <!-- FILE UPLOAD -->
                    <file-preview />
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            user: {
                name: this.$store.state.user && this.$store.state.user.name ? this.$store.state.user.name : 'Гость',
                surname: this.$store.state.user && this.$store.state.user.surname ? this.$store.state.user.surname : '',
                email: this.$store.state.user && this.$store.state.user.email ? this.$store.state.user.email : 'Ошибка', 
                photo: this.$store.state.user && this.$store.state.user.photo ? this.$store.state.user.photo : null,
                password: '',
                passwordRepeat: '',
                token: null
            },
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
        }
    },
    components: {},
    methods: {
        // ...mapGetters({
        //     getData: 'index/getData'
        // }),
        async submitForm(user) {
            // Обновить токен
            
            const t = this.$storage.getUniversal('token') || null;  
            user.token = t;

            const r = this.$axios.post('users/cab', user)
                .then(response => {
                    this.error = response.data.error;
                    this.message = response.data.message;
                    console.log("MESSAGE FROM API: ", response.data);

                    if (response.data.error == 0) {
                        this.$toast.success('Пользователь обновлен');
                        //this.$router.push('/cab');
                    } else {
                        this.$toast.error('Ошибка обновления пользователя');
                        //this.$router.push('/cab');
                    }
                })
                .catch(e => {
                    this.$toast.error('Ошибка обновления пользователя');
                    //this.$router.push('/cab');
                });
        }
    },
    middleware: 'auth/user',
    computed: {
        // url() {
        //     return 'https://randomuser.me/api/portraits/men/20.jpg';
        // },
        head() {
            return {
                meta: [{ name: 'robots', content: 'noindex,nofollow' }]
            }
        },
    },
    async mounted() {
        //this.$validator.validate();
        const r = await this.$axios.get('card/users');
        console.log("CARD DATA: ", r)
    }
}    
</script>

<style>
.col-md-6 {
    padding-bottom: 0px;
}
</style>