class Auth {
  setToken(token) {
    window.localStorage.setItem("contenu_token", token);
  }
  removeToken() {
    window.localStorage.removeItem("contenu_token");
  }
  getToken(){
      return window.localStorage.getItem("contenu_token");
  }
  isAuthorized() {
    return this.getToken() ? true : false;
  }
  generateAuthHeader(){
    return {
        authorization : "Bearer "+ this.getToken()
    }
  }
}
export default {
  install(Vue) {
    Vue.prototype.$auth = new Auth();
  }
};
