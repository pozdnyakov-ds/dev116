<template>
<v-app fluid fill-height style="background-color: #eee">
    <v-layout align-center justify-center>
        <v-flex xs4>
            <v-container fluid>
                <nuxt-link to="/"><v-img src="img/header/logo_center.png"></v-img></nuxt-link>
                <Nuxt/>
            </v-container>
        </v-flex>
    </v-layout>
</v-app>
</template>

<script>
    export default {
        
    }
</script>

<style scoped>

</style>