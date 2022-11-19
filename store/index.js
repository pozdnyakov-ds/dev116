export const state = () => ({
  user: null,
});

export const mutations = {
  setUser(state, user) {
    state.user = user;
  },
  setComplexUser(state, user) {
    if (user && user.token) {
      this.$auth.setUser(user);
      this.commit("auth/SET", { key: "loggedIn", value: true });

      this.$axios.setToken(user.token);
      this.$storage.setUniversal("token", user.token);
      this.$storage.setUniversal("refresh_token", user.refresh_token);
    }
  },
  setUserPhoto(state, photo) {
    state.user.photo = photo;
  }
};

export const actions = {
  async nuxtServerInit({ commit, dispatch, getters }) {
    const loggedIn = this.$auth.loggedIn;
    const token = this.$storage.getUniversal("token")
      ? this.$storage.getUniversal("token")
      : null;

    if (loggedIn && token) {
      try {
        this.$axios.setHeader("Authorization", "Bearer " + token);
        await this.$axios
          .get(process.env.BASE_URL + "/api/users/auth")
          .then((resp) => {
            var user = resp.data.user;
            if (user) this.$auth.setUser(user);
          });
      } catch (e) {
        await dispatch("refreshToken");
        // commit('setComplexUser', this.getters['getUser']);
        // console.log('Токен обновлен: ', this.$auth.loggedIn);
      }
    } else {
      await dispatch("refreshToken");
      // commit('setComplexUser', this.getters['getUser']);
      // console.log('Токен обновлен: ', this.$auth.loggedIn);
    }
  },

  async refreshToken({ commit }) {
    const refreshToken = this.$storage.getUniversal("refresh_token")
      ? this.$storage.getUniversal("refresh_token")
      : null;

    try {
      //console.log("Начало обновления токена: ", refreshToken);
      if (refreshToken) {
        await this.$axios
          .post(process.env.BASE_URL + "/api/auth/refresh/" + refreshToken)
          .then((resp) => {
            var userData = resp.data.user;
            if (userData && userData.token) {
              const scope = userData.scope.split(",");
              userData.scope = scope;
              commit("setUser", userData);
              commit("setComplexUser", this.getters["getUser"]);
              //console.log("Токен обновлен: ", this.$auth.loggedIn);
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
};
