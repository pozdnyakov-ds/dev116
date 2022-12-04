<template>
    <v-app>
        <v-card class="overflow-hidden">

            <Header></Header>

            <v-main style="padding: 0px; height: 100vh;">
                <v-container fluid>

                    <Nuxt />

                </v-container>
            </v-main>

            <Footer></Footer>

        </v-card>

    </v-app>
</template>

<script>
export default {
    components: {
    },
    methods: {
    },
    computed: {
    }
}
</script>

<style>
.page-enter-active, .page-leave-active {
    transition: opacity 0.3s;
}

.page-enter, .page-leave-active {
    opacity: 0;
}
</style>