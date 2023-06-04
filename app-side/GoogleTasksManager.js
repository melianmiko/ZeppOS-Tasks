const BASE_URL = "https://tasks.googleapis.com/tasks/v1";

export class GoogleTasksManager {
	constructor() {
		this.token = "";
	}

	onTokenRenew() {}

	async fetch(options) {
		const fetchParams = {
			url: BASE_URL + options.url,
			method: options.method == "GET" ? "GET" : "POST",
			headers: {
				'Content-Type': 'application/json',
				'X-HTTP-Method-Override': options.method
			},
		}

		// Query params
		if(options.query) {
			fetchParams.url += "?";
			for(const key in options.query)
				fetchParams.url += key + "=" + encodeURIComponent(options.query[key]) + "&";
			fetchParams.url = fetchParams.url.substring(0, fetchParams.url.length - 1);
		}

		// Body
		if(options.body) {
			fetchParams.body = typeof options.body != "string" ? 
				JSON.stringify(options.body) : options.body;
		}

		// Do a fetch
		console.log(fetchParams.method, fetchParams.url, fetchParams);
		const res = await fetch(fetchParams);

		// Token refresh required
		if(res.status == 401 && !options.norefresh) {
			console.log("Trying to renew token...");
			this.token = await this.onTokenRenew();
			if(options.query && options.query.access_token)
				options.query.access_token = this.token;
			options.norefresh = true;
			return await this.fetch(options);
		}

		const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body
		return [res, data];
	}

	async getTaskLists() {
		const [res, data] = await this.fetch({
			method: "GET",
			url: "/users/@me/lists",
			query: {
				access_token: this.token,
				fields: "items(id,title)"
			}
		});

		if(res.status != 200) {
			console.error(data)
			throw new Error(`Can't get list of tasklists`);
		}

		console.log("task lists", data);
		return data.items;
	}

	async getTasksIn(listId, withCompleted, pageToken = null) {
		const query = {
			access_token: this.token,
			fields: "nextPageToken,items(id,title,status,position)"
		};
		if(withCompleted) {
			query.showCompleted = true;
			query.showHidden = true;
		}
		if(typeof pageToken === "string") {
			query.pageToken = pageToken;
		}

		const [res, data] = await this.fetch({
			method: "GET",
			url: `/lists/${listId}/tasks`,
			query
		});

		if(res.status != 200) {
			console.error(data);
			throw new Error(`Can't get list of tasks`);
		}

		data.items.sort((a, b) => a.position < b.position ? -1 : 1);
		for(const item of data.items) {
			item.completed = item.status == "completed";
			delete item.status;
			delete item.position;
		}

		console.log(data);
		return data;
	}

	async setComplete(listId, taskId, value) {
		const [res, data] = await this.fetch({
			method: "PATCH",
			url: `/lists/${listId}/tasks/${taskId}`,
			body: {
				status: value ? "completed" : "needsAction",
				hidden: value ? true : false
			},
			query: {
				access_token: this.token,
				fields: "status"
			}
		});

		if(res.status != 200) {
			console.error(data);
			throw new Error(`Can't modify task`);
		}

		console.log(data);
		return true;
	}

	async insertTask(listId, text) {
		const res = await this.fetch({
			method: "POST",
			url: `/lists/${listId}/tasks`,
			body: {
				status: "needsAction",
				title: text
			},
			query: {
				access_token: this.token
			}
		});

		return true;
	}
}