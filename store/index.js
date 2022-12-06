function jwtCheck(token) {
  var jwt = require("jsonwebtoken");
  if (!token) {
    return false;
  }
  try {
    const jwtData = jwt.decode(token);
    const expires = jwtData.exp || 0;
    return new Date().getTime() / 1000 < expires;
  } catch (e) {
    return false;
  }
}

export const state = () => ({
  user: null,
  loggedIn: false,
});

export const mutations = {
  setUser(state, user) {
    let tempUser = user;
    if (!Array.isArray(user.scope)) {
      let scope = user.scope.split(",") || [];
      tempUser.scope = scope;
    }

    state.user = tempUser;
    state.loggedIn = true;

    this.$storage.setUniversal("token", user.token);
    this.$storage.setUniversal("refresh_token", user.refresh_token);
  },

  setUserPhoto(state, photo) {
    state.user.photo = photo;
  },

  logout(state) {
    this.$storage.removeUniversal("token");
    this.$storage.removeUniversal("refresh_token");
    state.loggedIn = false;
    state.user = null;
  },
};

export const actions = {
  async nuxtServerInit({ dispatch }) {
    const token = this.$storage.getUniversal("token") || null;
    //const refreshToken = this.$storage.getUniversal("refresh_token") || null;
    if (token && token.length > 0) {
      // console.log(
      //   "CHECK TOKENS (Main & Refresh): ",
      //   jwtCheck(token),
      //   jwtCheck(refreshToken)
      // );
      await dispatch("autoLogin");
    }
  },

  async autoLogin({ commit, dispatch }) {
    const token = this.$storage.getUniversal("token")
      ? this.$storage.getUniversal("token")
      : null;

    console.info("START AUTOLOGIN...");
    if (token && jwtCheck(token)) {
      try {
        const headers = {
          Authorization: "Bearer " + token,
        };
        await this.$axios
          .get(process.env.BASE_URL + "/api/users/auth", {
            headers: headers,
          })
          .then((resp) => {
            var user = resp.data.user;
            //console.info("MAIN TOKEN USER: ", user);

            if (user) {
              commit("setUser", user);
            } else {
              dispatch("refreshToken");
            }
          });
      } catch (e) {
        console.error("MAIN TOKEN EXPIRE!");
        await dispatch("refreshToken");
      }
    } else {
      console.error("MAIN TOKEN EXPIRE OR NOT EXIST!");
      await dispatch("refreshToken");
    }
  },

  async refreshToken({ commit }) {
    const refreshToken = this.$storage.getUniversal("refresh_token")
      ? this.$storage.getUniversal("refresh_token")
      : null;

    console.info("START AUTO REFRESH...");
    try {
      if (refreshToken && jwtCheck(refreshToken)) {
        const headers = {
          Authorization: "Bearer " + refreshToken,
        };
        let resp = await this.$axios.get(
          process.env.BASE_URL + "/api/auth/refresh",
          {
            headers: headers,
          }
        );
        var userData = resp.data.user;
        if (userData && userData.token) {
          // console.info("REFRESH TOKEN USER: ", userData);
          commit("setUser", userData);
        }
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
