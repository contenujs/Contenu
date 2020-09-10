class Store {
  data = undefined;
  key = "/";
  dataIsPublished = true;
  setDataIsPublished(data) {
    this.dataIsPublished = data;
  }
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
