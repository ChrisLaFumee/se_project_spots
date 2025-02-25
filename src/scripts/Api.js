// utils/Api.js

class Api {
  constructor(options) {
    // constructor body
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
        authorization: "c56e30dc-2883-4270-a59e-b2f7bae969c6",
      },
    }).then((res) => res.json());
  }
}

export default Api;
