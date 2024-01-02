export class CachedTask {
    constructor(data, config, withLog) {
        this.id = data.id;
        this.title = data.title;
        this.completed = data.completed;

        this.config = config;
        this.withLog = withLog;
    }

    _getSelfIndex(tasks) {
        for(const i in tasks) {
            if(tasks[i].id === this.id)
                return i;
        }
        return null;
    }

    sync() {
        return Promise.resolve();
    }

    setCompleted(value) {
        const tasks = this.config.get("tasks");
        const log = this.config.get("log", []);

        const i = this._getSelfIndex(tasks);
        tasks[i].completed = value;

        if(this.withLog) 
            log.push({command: "set_completed", id: this.id, value});

        this.config.update({tasks, log});
        this.completed = value;
        return Promise.resolve();
    }

    setTitle(value) {
        const tasks = this.config.get("tasks");
        const log = this.config.get("log", []);

        const i = this._getSelfIndex(tasks);
        tasks[i].title = value;

        if(this.withLog) 
            log.push({command: "set_title", id: this.id, value});

        this.config.update({tasks, log});
        this.title = value;
        return Promise.resolve();
    }

    delete() {
        const log = this.config.get("log", []);
        let tasks = this.config.get("tasks");

        tasks = tasks.filter((item) => item.id !== this.id);

        if(this.withLog) 
            log.push({command: "delete", id: this.id});

        this.config.update({tasks, log});
        return Promise.resolve();
    }
}
