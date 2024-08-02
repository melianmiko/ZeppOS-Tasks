import {GoogleAuth} from "./GoogleAuth";
import {MicrosoftAuth} from "./MicrosoftAuth";
import {CalDAVAuth} from "./CalDAVAuth";
import {TickTickAuth} from "./TickTickAuth";

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
            case "tick_tick":
                return new TickTickAuth();
            case "caldav":
                return new CalDAVAuth();
        }
    }

    async appGetAuthData(request) {
        const storage = settings.settingsStorage;
        if(storage.getItem("login_status") !== '"logged_in"')
            return {error: "login_first"}

        // Save extra data
        settings.settingsStorage.setItem("device_name", request.deviceName);

        const accessToken = storage.getItem("access_token");
        const accessTokenLifetime = storage.getItem("access_token_expire");
        if(Date.now() >= accessTokenLifetime || !accessToken || !accessTokenLifetime) {
            const result = await this._renewToken();
            if(result !== true) return {error: result};
        }

        return {
            provider: this._getAuthProviderName(),
            token: storage.getItem("access_token"),
        };
    }

    async settingsBeginLogin() {
        const storage = settings.settingsStorage;
        const {url, nextStage} = await this._getAuthProvider().onLoginRequest((data) => {
            if(data === null) return settings.settingsStorage.setItem("login_status", '"logged_out"');
            this.settingsProcessAuthToken(data)
        });

        storage.setItem("login_url", url);
        storage.setItem("login_status", JSON.stringify(nextStage));
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

        try {
            const refreshToken = storage.getItem("refresh_token");
            if(!refreshToken) return "No refresh token stored, please log-out and login again";
            const result = await this._getAuthProvider().renewToken(refreshToken);
            if(result === false) return "Can't authorized, try again later or re-login to cloud account";

            storage.setItem("access_token", result.accessToken);
            storage.setItem("access_token_deadline", result.accessTokenExpire);
        } catch(e) {
            console.log(e);
            return "Can't authorize due to unknown error.";
        }

        return true;
    }
}
