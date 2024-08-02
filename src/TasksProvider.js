import {GoogleHandler} from "./google/GoogleHandler";
import {deviceName} from "../lib/mmk/DeviceIdentifier";
import { OfflineHandler } from "./cached/OfflineHandler";
import {CachedTaskList} from "./cached/CachedTaskList";
import {LogExecutor} from "./cached/LogExecutor";
import {MicrosoftHandler} from "./microsoft/MicrosoftHandler";
import {CalDAVHandler} from "./caldav/CalDAVHandler";
import {TickTickHandler} from "./ticktick/TickTickHandler";

export class TasksProvider {
    constructor(config, messageBuilder) {
        this.config = config;
        this.messageBuilder = messageBuilder;
        this._handler = false;
    }

    get cantListCompleted() {
        return this._handler.cantListCompleted;
    }

    _createHandler(data) {
        switch(data.provider) {
            case "google":
                return new GoogleHandler(data.token);
            case "microsoft":
                return new MicrosoftHandler(data.token);
            case "tick_tick":
                return new TickTickHandler(data.token);
            case "caldav":
                return new CalDAVHandler(this.messageBuilder);
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
            action: "get_data",
            deviceName,
        }, {}).then((data) => {
            if(data.error) throw new Error(data.error);
            console.log(JSON.stringify(data));
            this._handler = this._createHandler(data);
            return true;
        })
    }

    setupOffline() {
        this._handler = new OfflineHandler(this.config);
        this.config.update({
            forever_offline: true,
            tasks: [],
            log: [],
        });
    }

    /**
     * Create cache data for offline work
     * @param {any} listId ID of list used for cache
     * @param {TaskInterface[]} tasks Exiting tasks
     */
    createCacheData(listId, tasks) {
        if(this.config.get("forever_offline", false))
            throw new Error("Cache data will override offline data.");

        const cacheData = [];
        for(const task of tasks)
            cacheData.push({
                title: task.title,
                completed: task.completed,
                id: task.id,
            })

        this.config.update({
            tasks: cacheData,
            cacheListID: listId,
            log: [],
        });
    }

    getCachedTasksList() {
        return new CachedTaskList(this.config, !this.config.get("forever_offline", false));
    }

    getTaskLists() {
        return this._handler.getTaskLists();
    }

    getTaskList(id) {
        if(id === "cached") return this.getCachedTasksList();
        return this._handler.getTaskList(id);
    }

    execCachedLog() {
        const log = this.config.get("log", []);
        if(log.length === 0) return Promise.resolve();

        const actualTaskList = this._handler.getTaskList(this.config.get("cacheListID"));
        const executor = new LogExecutor(log, actualTaskList);
        return executor.start().then(() => {
            this.config.update({log: []});
        })
    }
}