export class GoogleTask {
    constructor(data, parent, handler) {
        this.id = data.id;
        this.title = data.title;
        this.completed = data.status == "completed";
        this.list = parent;

        this._handler = handler;
    }

    sync() {
        return this._handler.request({
            method: "GET",
			url: `/lists/${this.list.id}/tasks/${this.id}`,
			query: {
				access_token: this._handler.token,
			}
        }).then((data) => {
            this.title = data.title;
            this.completed = data.status == "completed";
        })
    }

    setCompleted(value) {
        this.completed = value;
        return this._handler.request({
			method: "PATCH",
			url: `/lists/${this.list.id}/tasks/${this.id}`,
			body: {
				status: value ? "completed" : "needsAction",
				hidden: !!value,
			},
			query: {
				access_token: this._handler.token,
				fields: "status",
			}
        })
    }

    setTitle(title) {
        this.title = title;
        return this._handler.request({
			method: "PATCH",
			url: `/lists/${this.list.id}/tasks/${this.id}`,
			body: {
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
			url: `/lists/${this.list.id}/tasks/${this.id}`,
			query: {
				access_token: this._handler.token,
			}
        })
    }
}