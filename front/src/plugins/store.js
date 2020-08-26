class Store {
  data = undefined;
  key = "/";
  setData(data) {
    this.data = data;
  }
  getData() {
    return this.data;
  }
  setKey(key) {
    this.key = key;
  }
  getKey() {
    return this.key;
  }
}
export default {
  install(Vue) {
    Vue.prototype.$store = new Store();
  },
};
