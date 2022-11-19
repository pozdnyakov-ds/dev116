<template>
    <div>
        <h2><b>{{ $t('admin.title') }}</b></h2>

        <p style="color: red;">{{ $auth.user.name }} <br>
            {{ $auth.user.scope }}</p>

        <p><b>Пользователи системы </b></p>

        <div v-if="loading" class="loading-page"></div>

        <v-card>
            <v-data-table 
                :headers="headers"
                :items="usersTable">
                <template slot="item.status" slot-scope="{ item }">
                    <v-simple-checkbox v-model="item.status" @click="updateUserStatus(item)"></v-simple-checkbox>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>

<script>
import axios from "axios";

export default {
    layout: 'default',
    // async asyncData({ app }) {
    //     const { data } = await app.$axios.get('/users');
    //     return { users: data }
    // },
    mounted() { 
        this.loading = true;
        axios.get('/api/users')
            .then(response => {
                this.users = response.data;
                this.users.forEach(user => {
                    let statusBoolean = (user.status == 1) ? true : false;
                    this.usersTable.push({
                        id: user.id, name: user.name, surname: user.surname, email: user.email,
                        status: statusBoolean
                    });
                });
                console.log('Users: ', this.usersTable);
                this.loading = false;
            })
            .catch(error => {
                console.error("Ошибка получения списка пользователей: ", error);
                this.loading = false;
            });

    },
    components: {},    
    middleware: 'auth/admin',
    methods: {
        async updateUserStatus(user) { 
            this.loading = true;
            try {
                const r = await this.$axios.post('/users/status', user)
                    .then(response => {
                        this.error = response.data.error;
                        this.message = response.data.message;
                        if (response.data.error == 0) {
                            //console.log('Статус обновлен', response);
                            this.$toast.success('Статус обновлен');
                        } else {
                            this.$toast.error('Ошибка обновления статуса!');
                        }
                    })
                    .catch(e => {
                        this.$toast.error('Ошибка обновления статуса!');
                        this.error = 2;
                        this.message = 'Ошибка обновления статуса';
                    });
                this.loading = false;
            } catch (e) {
                this.$toast.error('Ошибка обновления статуса!');
                this.error = 3;
                this.message = 'Ошибка обновления статуса';
                this.loading = false;
            }
        }
    },
    data() { 
        return {
            users: [],
            usersTable: [],
            loading: false
        }
    },
    head() {
        return {
            meta: [{ name: 'robots', content: 'noindex,nofollow' }]
        };
    },
    computed: {
        headers() { 
            return [
                { text: 'Имя', value: 'name' },
                { text: 'Фамилия', value: 'surname' },
                { text: 'Email', value: 'email' },
                { text: 'Авторизован', value: 'status' }
            ]
        }
    }
}
</script>

<style scoped>
table.v-table tbody tr {
    background-color: aquamarine;
}
</style>