class ContenuAPI {
  apiUrl = process.env.NODE_ENV == "production" ? "http://localhost:8080/api" : "/api";
  login(password) {
    return this.apiFetch(
      "/auth",
      {
        type: "login",
        password,
      },
      "POST"
    );
  }
  resetPassword(data, headers) {
    return this.apiFetch("/auth", data, "POST", headers);
  }
  getData(headers, key = "/") {
    return this.apiFetch("/data?key=" + key, {}, "GET", headers);
  }
  init() {
    return this.apiFetch("/init", {}, "GET");
  }
  saveData(data, headers) {
    return this.apiFetch("/data", data, "POST", headers);
  }
  removeFile(fileName, headers) {
    return this.apiFetch("/remove/" + fileName, {}, "POST", headers);
  }
  uploadFile(formData, headers, updateFn, completeFn) {
    var ajax = new XMLHttpRequest();
    ajax.upload.addEventListener("progress", updateFn, false);
    ajax.open("POST", this.apiUrl + "/upload");
    ajax.setRequestHeader("authorization", headers.authorization);
    ajax.send(formData);
    ajax.onreadystatechange = function() {
      if (ajax.readyState === 4) {
        completeFn(JSON.parse(ajax.response));
      }
    };
  }
  apiFetch(url, data, method, headers = {}) {
    return new Promise(async (resolve, reject) => {
      let options = {
        method: method,
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      };
      if (method.toLowerCase() == "post") options.body = JSON.stringify(data);
      await fetch(this.apiUrl + url, options).then(async (response) => {
        response.data = await response.json();
        if (response.status >= 400 && response.status < 600) reject(response);
        resolve(response);
      });
    });
  }
}
export default {
  install(Vue) {
    Vue.prototype.$contenuAPI = new ContenuAPI();
  },
};
