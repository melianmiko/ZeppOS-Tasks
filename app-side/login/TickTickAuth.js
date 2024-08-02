import {CALLBACK_URL, TICK_TICK_CLIENT_ID, TICK_TICK_CLIENT_SECRET} from "../Config";

const REQUIRED_SCOPE = "tasks:write tasks:read";

// noinspection JSUnusedGlobalSymbols
export class TickTickAuth {
  async onLoginRequest(_) {
    return {
      nextStage: "login_form_resp",
      url: `https://ticktick.com/oauth/authorize`+
        `?client_id=${TICK_TICK_CLIENT_ID}`+
        `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}`+
        `&scope=${encodeURIComponent(REQUIRED_SCOPE)}`+
        `&state=123&response_type=code`
    }
  }

  async onLoginResponse(response) {
    console.log("Exchanging auth key…");

    let body = "client_id=" + encodeURIComponent(TICK_TICK_CLIENT_ID) +
      "&scope=" + encodeURIComponent(REQUIRED_SCOPE) +
      "&code=" + encodeURIComponent(response) +
      "&redirect_uri=" + encodeURIComponent(CALLBACK_URL) +
      "&client_secret=" + encodeURIComponent(TICK_TICK_CLIENT_SECRET) +
      "&grant_type=authorization_code";

    const res = await fetch({
      method: "POST",
      url: "https://ticktick.com/oauth/token",
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
      renewToken: "",
    }
  }

  async renewToken() {
    console.error("Not supported");
  }
}