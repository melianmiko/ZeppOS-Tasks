export class CalDAVAuth {
  async onLoginRequest(_) {
    return ["", true];
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