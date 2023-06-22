import {onError} from "./onError";

const BASE_URL = "https://tasks.googleapis.com/tasks/v1";

export class GoogleTasksManager {
	constructor() {
		this.token = "";
	}

	onTokenRenew() {}

	async fetch(options, noCrash = false) {
		const fetchParams = {
			url: BASE_URL + options.url,
			method: options.method === "GET" ? "GET" : "POST",
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
		const res = await fetch(fetchParams);
		const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body

		// Token refresh required
		if(res.status === 401 && !options.norefresh) {
			console.log("Trying to renew token...");
			this.token = await this.onTokenRenew();
			if(options.query && options.query.access_token)
				options.query.access_token = this.token;
			options.norefresh = true;
			return await this.fetch(options);
		} else if((res.status < 200 || res.status >= 400) && !noCrash) {
			let report = `Failed to fetch: ${fetchParams.method} ${fetchParams.url}`;
			report += `\nHeaders: ${JSON.stringify(fetchParams.headers)}`;
			report += `\nStatus code: ${res.status}`;

			// Add Google-API errors, if present
			if(data.error)
				report += `\nGoogle API errors: ${JSON.stringify(data.error)}`;

			// Exclude personal data
			report = report.replaceAll(this.token, "ACCESS_TOKEN");

			onError(report);
			throw new Error(res.status + ": " + (data.error ? data.error.message : "Request failed..."));
		}

		return [res, data];
	}

	async getTaskLists() {
		const [_, data] = await this.fetch({
			method: "GET",
			url: "/users/@me/lists",
			query: {
				access_token: this.token,
				fields: "items(id,title)"
			}
		});

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

		const [_, data] = await this.fetch({
			method: "GET",
			url: `/lists/${listId}/tasks`,
			query
		});

		data.items.sort((a, b) => a.position < b.position ? -1 : 1);
		for(const item of data.items) {
			item.completed = item.status === "completed";
			delete item.status;
			delete item.position;
		}

		return data;
	}

	async setComplete(listId, taskId, value) {
		await this.fetch({
			method: "PATCH",
			url: `/lists/${listId}/tasks/${taskId}`,
			body: {
				status: value ? "completed" : "needsAction",
				hidden: !!value
			},
			query: {
				access_token: this.token,
				fields: "status"
			}
		});

		return true;
	}

	async insertTask(listId, text) {
		await this.fetch({
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