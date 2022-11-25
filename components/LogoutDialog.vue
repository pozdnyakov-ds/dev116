<template>
    <div>
        <v-dialog v-model="show" persistent max-width="290">
            <v-card>
                <v-card-title class="text-h5">
                    Выйти из учётной <br>записи?
                </v-card-title>
                <v-card-text>Let Google help apps determine location. This means sending anonymous location data to Google, even
                    when no apps are running.</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click.stop="logout">
                        Да
                    </v-btn>
                    <v-btn color="green darken-1" text @click.stop="show=false">
                        Нет
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    props: {
        value: Boolean
    },
    computed: {
        show: { 
            get() {
                return this.value
            },
            set(value) { 
                this.$emit('input', value)
            }
        }
    },
    methods: {
        async logout() { 
            this.$store.commit('logout');
            this.show = false;
        }
    }
}
</script>

<style scoped>

</style>