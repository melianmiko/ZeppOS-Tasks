import {CALLBACK_URL, MS_APP_ID, MS_SECRET} from "../Config";

const REQUIRED_SCOPE = "offline_access Tasks.ReadWrite";

// noinspection JSUnusedGlobalSymbols
export class MicrosoftAuth {
  async onLoginRequest(_) {
    // [url, require_response]
    return [`https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize`+
      `?client_id=${MS_APP_ID}`+
      `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}`+
      `&scope=${encodeURIComponent(REQUIRED_SCOPE)}`+
      `&response_type=code&response_mode=query`, true];
  }

  async onLoginResponse(response) {
    console.log("Exchanging auth key...");

    let body = "client_id=" + encodeURIComponent(MS_APP_ID) +
      "&scope=" + encodeURIComponent(REQUIRED_SCOPE) +
      "&code=" + encodeURIComponent(response) +
      "&redirect_uri=" + encodeURIComponent(CALLBACK_URL) +
      "&client_secret=" + encodeURIComponent(MS_SECRET) +
      "&grant_type=authorization_code";

    const res = await fetch({
      method: "POST",
      url: "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body
    });

    // noinspection JSCheckFunctionSignatures,DuplicatedCode
    const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body
    console.log(data);

    if(res.status !== 200) {
      console.error("Failed");
      return ["", ""];
    }

    // noinspection JSUnresolvedReference
    return {
      accessToken: data.access_token,
      accessTokenExpire: Date.now() + (data.expires_in * 1000),
      renewToken: data.refresh_token,
    }
  }

  async renewToken(refreshToken) {
    let body = "client_id=" + encodeURIComponent(MS_APP_ID) +
      "&scope=" + encodeURIComponent(REQUIRED_SCOPE) +
      "&refresh_token=" + encodeURIComponent(refreshToken) +
      "&client_secret=" + encodeURIComponent(MS_SECRET) +
      "&grant_type=refresh_token";

    const res = await fetch({
      method: "POST",
      url: "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body
    });

    // noinspection JSCheckFunctionSignatures,DuplicatedCode
    const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body

    // noinspection JSUnresolvedReference
    return {
      accessToken: data.access_token,
      accessTokenExpire: Date.now() + (data.expires_in * 1000),
    }
  }
}