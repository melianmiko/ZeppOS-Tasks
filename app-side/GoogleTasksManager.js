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

		// Token refresh required
		if(res.status === 401 && !options.norefresh) {
			console.log("Trying to renew token...");
			this.token = await this.onTokenRenew();
			if(options.query && options.query.access_token)
				options.query.access_token = this.token;
			options.norefresh = true;
			return await this.fetch(options);
		} else if(res.status === 204) {
			return [res, null];
		} else if((res.status < 200 || res.status >= 400) && !noCrash) {
			const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body
			let report = `Failed to fetch: ${fetchParams.method} ${fetchParams.url}`;
			report += `\nHeaders: ${JSON.stringify(fetchParams.headers)}`;
			report += `\nStatus code: ${res.status}`;

			if(data.error)
				report += `\nGoogle API errors: ${JSON.stringify(data.error)}`;

			// Exclude personal data
			report = report.replaceAll(this.token, "ACCESS_TOKEN");
			
			if(options.method == "PATCH" && data.error && data.error.status == "INVALID_ARGUMENT") {
				console.log("Got ignored PATCH error");
				// idk why this happend hand how to fix it. Refer to Google =)
			} else {
				onError(report);
			}

			throw new Error(res.status + ": " + (data.error ? data.error.message : "Request failed..."));
		}

		const data = typeof res.body === 'string' ?  JSON.parse(res.body) : res.body
		return [res, data];
	}

	async getTaskLists() {
		const [_, data] = await this.fetch({
			method: "GET",
			url: "/users/@me/lists",
			query: {
				access_token: this.token,
				// fields: "items(id,title)",
			}
		});

		const out = [];
		for(const item of data.items) {
			out.push({
				id: item.id,
				title: item.title,
			})
		}

		return out;
	}

	async getTasksIn(listId, withCompleted, pageToken = null) {
		const query = {
			access_token: this.token,
			// fields: "nextPageToken,items(id,title,status,position)"
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

		const out = [];
		for(const item of data.items) {
			out.push({
				id: item.id,
				title: item.title,
				completed: item.status === "completed",
			})
		}

		return {
			nextPageToken: data.nextPageToken,
			items: out,
		};
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

	async changeTitle(listId, taskId, value) {
		await this.fetch({
			method: "PATCH",
			url: `/lists/${listId}/tasks/${taskId}`,
			body: {
				title: value
			},
			query: {
				access_token: this.token,
				fields: "status"
			}
		});

		return true;
	}

	async deleteTask(listId, taskId) {
		await this.fetch({
			method: "DELETE",
			url: `/lists/${listId}/tasks/${taskId}`,
			query: {
				access_token: this.token
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