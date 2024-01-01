import {GoogleHandler} from "./google/GoogleHandler";
import {deviceName} from "../lib/mmk/DeviceIdentifier";
import { OfflineHandler } from "./cached/OfflineHandler";

export class TasksProvider {
    constructor(config, messageBuilder) {
        this.config = config;
        this.messageBuilder = messageBuilder;
        this._handler = false;
    }

    _createHandler(data) {
        switch(data.provider) {
            case "google":
                return new GoogleHandler(data.token);
        }
    }

    init() {
        if(this._handler) return Promise.resolve();

        if(this.config.get("forever_offline")) {
            this._handler = new OfflineHandler(this.config);
            return Promise.resolve();
        }

        return this.messageBuilder.request({
            package: "tasks_login",
            deviceName,
        }, {}).then((data) => {
            if(data.error) throw new Error(data.error);
            console.log(JSON.stringify(data));
            this._handler = this._createHandler(data);
            return true;
        })
    }

    getTaskLists() {
        return this._handler.getTaskLists();
    }

    getTaskList(id) {
        return this._handler.getTaskList(id);
    }
}