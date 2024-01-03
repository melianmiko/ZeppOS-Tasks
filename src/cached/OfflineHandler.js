import { CachedTaskList } from "./CachedTaskList";

export class OfflineHandler {
    constructor(config) {
        this.config = config;
    }

    getTaskLists() {
        return Promise.resolve([this.getTaskList("")]);
    }

    getTaskList() {
        return new CachedTaskList(this.config);
    }
}
