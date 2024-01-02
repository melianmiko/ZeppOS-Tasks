import { CachedTask } from "./CachedTask";

export class CachedTaskList {
    constructor(config, withLog=false) {
        this.id = "cached";
        this.title = "My tasks";

        this.config = config;
        this.withLog = withLog;
    }

    insertTask(title) {
        const nextIndex = this.config.get("next_id", 0);
        const log = this.config.get("log", []);
        let tasks = this.config.get("tasks");

        tasks = [
            {id: `cached:${nextIndex}`, title, completed: false},
            ...tasks
        ];

        if(this.withLog) 
            log.push({command: "insert_task", id: nextIndex, title});

        this.config.update({
            next_id: nextIndex + 1,
            tasks,
            log
        })

        return Promise.resolve();
    }

    getTask(id) {
        for(const task of this.config.get("tasks")) {
            if(task.id === id)
                return new CachedTask(task, this.config, this.withLog);
        }

        return null;
    }

    getTasks(withCompleted) {
        let tasks = [];
        for(let task of this.config.get("tasks"))
            if(!task.completed || withCompleted)
                tasks.push(new CachedTask(task, this.config, this.withLog))

        return Promise.resolve({
            tasks,
            nextPageToken: null,
        })
    }
}
