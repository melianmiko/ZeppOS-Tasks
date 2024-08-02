export class TickTickTask {
    constructor(data, parent, handler) {
        this.id = data.id;
        this.title = data.title;
        this.completed = data.status === 1;
        this.list = parent;

        this._handler = handler;
    }

    sync() {
        return this._handler.request({
            method: "GET",
			url: `/project/${this.list.id}/task/${this.id}`,
			query: {
				access_token: this._handler.token,
			}
        }).then((data) => {
            this.title = data.title;
            this.completed = data.status === 0;
        })
    }

    setCompleted(value) {
        if(value !== true) {
            throw new Error("TickTick API can't un-complete task.");
        }

        this.completed = value;
        return this._handler.request({
			method: "POST",
			url: `/project/${this.list.id}/task/${this.id}/complete`,
            body: '',
        })
    }

    setTitle(title) {
        this.title = title;
        return this._handler.request({
			method: "POST",
			url: `/task/${this.id}`,
			body: {
                taskId: this.id,
                projectId: this.list.id,
				title
			},
			query: {
				access_token: this._handler.token,
				fields: "status",
			}
        })
    }

    delete() {
        return this._handler.request({
			method: "DELETE",
			url: `/project/${this.list.id}/task/${this.id}`,
        })
    }
}