export class LogExecutor {
    constructor(log, taskList) {
        this.log = log;
        this.taskList = taskList;
        this.idOverride = {};
    }

    start() {
        if(this.log.length === 0) return Promise.resolve();

        const record = this.log.shift();
        switch(record.command) {
            case "insert_task":
                return this._log_insert_task(record);
            case "set_completed":
                return this._log_set_completed(record);
            case "set_title":
                return this._log_set_title(record);
            case "delete":
                return this._log_delete(record);
            default:
                console.log(`WARN: Unprocessable command: ${record.command}`);
                return this.start();
        }
    }

    _log_insert_task(record) {
        const {id, title} = record;
        console.log(`LOG_EXEC: Will create task "${title}", virtual_id=cached:${id}`);

        return this.taskList.insertTask(title).then((d) => {
            console.log(`LOG_EXEC: Map cached:${id} -> ${d.id}`);
            this.idOverride[`cached:${id}`] = d.id;
            return this.start();
        })
    }

    _log_set_completed(record) {
        let {id, value} = record;
        if(this.idOverride[id]) id = this.idOverride[id];

        console.log(`LOG_EXEC: Will set task ${id} to completed=${value}`);
        return this.taskList.getTask(id).setCompleted(value).then(() => {
            return this.start();
        }).catch((e) => {
            console.log(e);
        });
    }

    _log_set_title(record) {
        let {id, value} = record;
        if(this.idOverride[id]) id = this.idOverride[id];

        console.log(`LOG_EXEC: Will set task ${id} to title=${value}`);
        return this.taskList.getTask(id).setTitle(value).then(() => {
            return this.start();
        })
    }

    _log_delete(record) {
        let {id} = record;
        if(this.idOverride[id]) id = this.idOverride[id];

        console.log(`LOG_EXEC: Will delete task ${id}`);
        return this.taskList.getTask(id).delete().then(() => {
            return this.start();
        })
    }
}
