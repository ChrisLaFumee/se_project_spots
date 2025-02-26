// utils/Api.js

class Api {
  constructor(options) {
    // constructor body
  }

  getInitialCards() {
    return fetch("https://around-api.en.tripleten-services.com/v1/cards", {
      headers: {
        authorization: "a41b184f-a3bd-4344-8359-a2d01db23146",
      },
    }).then((res) => res.json());
  }
}

export default Api;
