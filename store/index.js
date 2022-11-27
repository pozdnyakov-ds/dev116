import LogoutDialogVue from "~/components/LogoutDialog.vue";

export const state = () => ({
  user: null,
  loggedIn: false,
});

export const mutations = {
  setUser(state, user) {
    console.log("setUser data: ", user);
    state.user = user;
    state.loggedIn = true;
    this.$storage.setUniversal("token", user.token);
    this.$storage.setUniversal("refresh_token", user.refresh_token);
    console.log("STATE User: ", state.user);
  },

  setUserPhoto(state, photo) {
    state.user.photo = photo;
  },

  logout(state) {
    this.$storage.removeUniversal("token");
    this.$storage.removeUniversal("refresh_token");
    this.loggedIn = false;
    this.user = null;
  },
};

export const actions = {
  async nuxtServerInit({ commit, dispatch, getters }) {
    const loggedIn = this.getters.getLoggedIn;
    const token = this.$storage.getUniversal("token")
      ? this.$storage.getUniversal("token")
      : null;

    if (loggedIn && token) {
      try {
        await this.$axios
          .get(process.env.BASE_URL + "/api/users/auth", { token: token })
          .then((resp) => {
            var user = resp.data.user;
            if (user) commit("setUser", user);
          });
      } catch (e) {
        await dispatch("refreshToken");
        console.log("Токен обновлен: ", this.getters.getLoggedIn);
      }
    } else {
      await dispatch("refreshToken");
      console.log("Токен обновлен: ", this.getters.getLoggedIn);
    }
  },

  async refreshToken({ commit }) {
    const refreshToken = this.$storage.getUniversal("refresh_token")
      ? this.$storage.getUniversal("refresh_token")
      : null;

    try {
      if (refreshToken) {
        await this.$axios
          .post(process.env.BASE_URL + "/api/auth/refresh/" + refreshToken)
          .then((resp) => {
            var userData = resp.data.user;
            if (userData && userData.token) {
              const scope = userData.scope.split(",");
              userData.scope = scope;
              commit("setUser", userData);
              console.log("Токен обновлен: ", this.getters.getLoggedIn);
            }
          });
      } else {
        console.log("Нет сохраненного Refresh-токена");
      }
    } catch (e) {
      console.log("Ошибка обновления токена", e);
    }
  },
};

export const getters = {
  getUser: (state) => {
    return state.user;
  },
  getLoggedIn: (state) => {
    return state.loggedIn;
  },
};
