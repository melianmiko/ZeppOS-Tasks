import {OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, CALLBACK_URL} from "../Config";

const REQUIRED_SCOPE = "https://www.googleapis.com/auth/tasks";

export class GoogleAuth {
  async onLoginRequest(_) {
    // [url, require_response]
    return [`https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CLIENT_ID}`+
            `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}`+
            `&response_type=code`+
            `&scope=${encodeURIComponent(REQUIRED_SCOPE)}`+
            `&access_type=offline`+
            `&prompt=consent`, true];
  }

  async onLoginResponse(response) {
    console.log("Exchanging auth key...");

    let body = "client_id=" +encodeURIComponent(OAUTH_CLIENT_ID);
    body += "&client_secret=" + encodeURIComponent(OAUTH_CLIENT_SECRET);
    body += "&redirect_uri=" + encodeURIComponent(CALLBACK_URL);
    body += "&code=" + encodeURIComponent(response);
    body += "&grant_type=authorization_code";

    const res = await fetch({
      method: "POST",
      url: "https://oauth2.googleapis.com/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body
    });

    const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body
    console.log(data);

    if(res.status !== 200) {
      console.error("Failed");
      return ["", ""];
    }

    return {
      accessToken: data.access_token,
      accessTokenExpire: Date.now() + (data.expires_in * 1000),
      renewToken: data.renew_token,
    }
  }

  async renewToken(refreshToken) {
    let body = "client_id=" +encodeURIComponent(OAUTH_CLIENT_ID);
    body += "&client_secret=" + encodeURIComponent(OAUTH_CLIENT_SECRET);
    body += "&refresh_token=" + encodeURIComponent(refreshToken);
    body += "&grant_type=refresh_token";

    console.log("RENEW", body);
    const res = await fetch({
      method: "POST",
      url: "https://oauth2.googleapis.com/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body
    console.log(data);

    if(res.status !== 200) {
      console.error("Failed");
      return false;
    }

    return {
      accessToken: data.access_token,
      accessTokenExpire: Date.now() + (data.expires_in * 1000),
    }
  }
}