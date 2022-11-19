<template>
    <v-footer app color="#333" style="color: white; padding: 0px;">

        <v-card-text style="text-align: center; background-color: #aaa;">
            <v-btn v-for="icon in icons" :key="icon" class="mx-4 white--text" icon>
                <v-icon size="24px">
                    {{ icon }}
                </v-icon>
            </v-btn>
        </v-card-text>
        
        <v-card-text class="white--text pt-0" style="text-align: center;">
            Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet. Mauris cursus commodo interdum.
            Praesent ut risus eget metus luctus accumsan id ultrices nunc.
        </v-card-text>
        
        <v-divider></v-divider>
        
        <v-card-text class="white--text" style="text-align: center; margin: 0px;">
            2020-{{ new Date().getFullYear() }}&nbsp;—&nbsp;<strong>Dev116.ru</strong>
        </v-card-text>

    </v-footer>
</template>

<script>
    export default {
    data: () => ({
        icons: [
            'mdi-facebook',
            'mdi-twitter',
            'mdi-linkedin',
            'mdi-instagram',
        ],
    }),
    }
</script>

<style scoped>
.v-card__text {
    padding: 0px;
}
</style>