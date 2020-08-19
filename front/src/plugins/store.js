class Store {
  data = undefined;
  contentKey = "/";
  setData(data) {
    this.data = data;
  }
  getData() {
    return this.data;
  }
  setContentKey(key) {
    this.contentKey = key;
  }
  getContentKey() {
    return this.contentKey;
  }
}
export default {
  install(Vue) {
    Vue.prototype.$store = new Store();
  },
};
