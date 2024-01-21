export class CalDAVAuth {
  async onLoginRequest(_) {
    return {
      nextStage: "login_form_nextcloud",
      url: "",
    };
  }

  async onLoginResponse(response) {
    return {
      accessToken: response,
      accessTokenExpire: Infinity,
      renewToken: response,
    };
  }

  async renewToken(refreshToken) {
    return {
      accessToken: refreshToken,
      accessTokenExpire: Infinity,
    }
  }
}