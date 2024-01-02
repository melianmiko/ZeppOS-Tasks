import {GoogleAuth} from "./GoogleAuth";
import {MicrosoftAuth} from "./MicrosoftAuth";

export class LoginProvider {
    _getAuthProviderName() {
        return JSON.parse(settings.settingsStorage.getItem("login_provider"));
    }

    _getAuthProvider() {
        switch(this._getAuthProviderName()) {
            case "google":
                return new GoogleAuth();
            case "microsoft":
                return new MicrosoftAuth();
        }
    }

    async appGetAuthData(request) {
        const storage = settings.settingsStorage;
        if(storage.getItem("login_status") !== '"logged_in"')
            return {error: "login_first"}

        // noinspection ES6MissingAwait
        this._getAuthProvider().onAdditionalDataAvailable(request);

        const accessTokenLifetime = storage.getItem("access_token_expire");
        if(Date.now() >= accessTokenLifetime)
            await this._renewToken();

        return {
            provider: this._getAuthProviderName(),
            token: storage.getItem("access_token"),
        };
    }

    async settingsBeginLogin() {
        const storage = settings.settingsStorage;
        const [url, needRespond] = await this._getAuthProvider().onLoginRequest((data) => {
            if(data === null) return settings.settingsStorage.setItem("login_status", '"logged_out"');
            this.settingsProcessAuthToken(data)
        });

        storage.setItem("login_url", url);
        storage.setItem("login_status", needRespond ? '"login_form_resp"' : '"login_form"');
    }

    async settingsProcessAuthToken(data) {
        const storage = settings.settingsStorage;
        if(data === "") return;

        // Set status
        storage.setItem("login_status", '"logging_in"');
        storage.setItem("auth_token", "");

        // Perform login
        const result = await this._getAuthProvider().onLoginResponse(data);
        storage.setItem("access_token", result.accessToken);
        storage.setItem("access_token_expire", result.accessTokenExpire);
        storage.setItem("refresh_token", result.renewToken);
        storage.setItem("login_status", '"logged_in"');
    }

    async _renewToken() {
        const storage = settings.settingsStorage;
        const refreshToken = settings.settingsStorage.getItem("refresh_token");

        const result = await this._getAuthProvider().renewToken(refreshToken);
        storage.setItem("access_token", result.accessToken);
        storage.setItem("access_token_deadline", result.accessTokenExpire);
    }
}
