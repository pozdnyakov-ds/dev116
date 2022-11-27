<template>
    <div>
        <v-app-bar color="#eee" elevate-on-scroll>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

            <v-toolbar-title style="width: 300px;">
                <nuxt-link :to="localePath('index')"><img src="/img/logo.png" alt="Dev116 Logo" style="width: 150px;">
                </nuxt-link>
            </v-toolbar-title>

            <template>
                <!-- v-slot:extension  -->
                <v-tabs v-model="tab" color="green">
                    <v-tab>
                        <nuxt-link key=0 :to="localePath('index')" exact>{{ $t('index.title') }}</nuxt-link>
                    </v-tab>
                    <v-tab>
                        <nuxt-link key=1 :to="localePath('about')">{{ $t('about.title') }}</nuxt-link>
                    </v-tab>
                    <v-tab>
                        <nuxt-link key=2 :to="localePath('products')">{{ $t('products.title') }}</nuxt-link>
                    </v-tab>
                    <v-tab>
                        <nuxt-link key=3 :to="localePath('services')">{{ $t('services.title') }}</nuxt-link>
                    </v-tab>
                    <v-tab>
                        <nuxt-link key=4 :to="localePath('contacts')">{{ $t('contacts.title') }}</nuxt-link>
                    </v-tab>
                </v-tabs>
            </template>

            <v-spacer></v-spacer>

            <v-btn icon>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>

            <v-btn icon v-if="$store.state.loggedIn">
                <nuxt-link to="/admin">
                    <v-icon>mdi-lock</v-icon>
                </nuxt-link>
            </v-btn>

            <v-btn icon v-if="$store.state.loggedIn">
                <nuxt-link to="/cab">
                    <v-icon>mdi-account</v-icon>
                </nuxt-link>
            </v-btn>

            <client-only>
            <v-btn icon v-if="$store.state.loggedIn">
                <nuxt-link to="#">
                    <v-icon @click="logoutButton">mdi-logout</v-icon>
                </nuxt-link>
            </v-btn>
            </client-only>

            <v-btn icon v-if="!$store.state.loggedIn">
                <nuxt-link to="/login">
                    <v-icon>mdi-login</v-icon>
                </nuxt-link>
            </v-btn>

            <div style="margin-left: 10px;">
                <nuxt-link v-if="$i18n.locale !== 'en'" :to="switchLocalePath('en')">ENG</nuxt-link>
                <nuxt-link v-if="$i18n.locale !== 'ru'" :to="switchLocalePath('ru')">RUS</nuxt-link>
            </div>
        </v-app-bar>

        <v-navigation-drawer app left absolute temporary v-model="drawer" style="width: 200px;">
            <v-list-item-group>

                <v-card v-if="$store.state.loggedIn" style="margin: 10px; padding: 10px;">
                    <v-avatar size="100" color="gray" rounded="1" style="margin-bottom: 10px;">
                        <v-img :src="userPhoto" :alt="userName"></v-img>
                    </v-avatar><br>
                    <span>{{ userName }}</span>
                    <span style="font-size: 90%;">{{ userEmail }}</span>
                </v-card>

                <v-list-item style="min-height: 36px;">
                    <nuxt-link :to="localePath('index')" exact>{{ $t('index.title') }}</nuxt-link>
                </v-list-item>

                <v-list-item style="min-height: 36px;">
                    <nuxt-link :to="localePath('about')">{{ $t('about.title') }}</nuxt-link>
                </v-list-item>

                <v-list-item style="min-height: 36px;">
                    <nuxt-link :to="localePath('products')">{{ $t('products.title') }}</nuxt-link>
                </v-list-item>

                <v-list-item style="min-height: 36px;">
                    <nuxt-link :to="localePath('services')">{{ $t('services.title') }}</nuxt-link>
                </v-list-item>

                <v-list-item style="min-height: 36px;">
                    <nuxt-link :to="localePath('contacts')">{{ $t('contacts.title') }}</nuxt-link>
                </v-list-item>

            </v-list-item-group>
        </v-navigation-drawer>

        <LogoutDialog v-model="showLogoutDialog"></LogoutDialog>

    </div>
</template>

<script>
import LogoutDialog from "~/components/LogoutDialog";

export default {
    components: {
        LogoutDialog
    },
    data: () => ({
        drawer: false,
        tab: null,
        showLogoutDialog: false,
        pages: ['/', '/about', '/products', '/services', '/contacts'],
    }),
    mounted() {
        const root = this.$route.path;
        for (var i = 0; i < this.pages.length; i++) {
            if (root.includes(this.pages[i])) this.tab = i;
        }
    },
    watch: {
        '$route'(to, from) {
            const root = to.path;
            for (var i = 0; i < this.pages.length; i++) {
                if (root.includes(this.pages[i])) this.tab = i;
            }
        }
    },
    methods: {
        logoutButton() {
            this.showLogoutDialog = true;
            //this.$router.push('/login');
        }
    },
    computed: {
        userName() {
            const name = (this.$store.state.user && this.$store.state.user.name)
                ? this.$store.state.user.name
                : "Гость";
            return name;
        },
        userEmail() {
            const email = (this.$store.state.user && this.$store.state.user.email)
                ? this.$store.state.user.email
                : "";
            return email;
        },
        userPhoto() {
            const photo = (this.$store.state.user && this.$store.state.user.photo)
                ? '/avatars/' + this.$store.state.user.photo
                : "/img/user/no-photo.png";
            return photo;
        }
    }
}
</script>

<style scoped>
a {
    text-decoration: none;
    color: #333;
}

.nuxt-link-active {
    text-decoration: none;
    color: #4CAF50;
}

.v-navigation-drawer {
    background-color: #eee;
}
</style>