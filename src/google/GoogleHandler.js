import {clientFetch as fetch} from "../../lib/mmk/FetchForward";
import {reportError, reportRequestFailure} from "../ErrorReportTool";
import {GoogleTaskList} from "./GoogleTaskList";
import {buildQueryURL} from "../Tools";

const BASE_URL = "https://tasks.googleapis.com/tasks/v1";

export class GoogleHandler {
    constructor(token) {
        this.token = token;
    }

    getTaskList(id) {
        return new GoogleTaskList({id, title: ""}, this);
    }

    getTaskLists() {
        return this.request({
            method: "GET",
            url: "/users/@me/lists",
            query: {
                access_token: this.token,
            }
        }).then((data) => {
            return data.items.map((item) => new GoogleTaskList(item, this));
        })
    }

    request(options, noCrash=false) {
        const fetchParams = {
            method: options.method === "GET" ? "GET" : "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-HTTP-Method-Override': options.method
            },
            timeout: 5000,
        }

        // Query params
        let url = BASE_URL + options.url
        if(options.query) {
            url += "?";
            for(const key in options.query)
                url += key + "=" + encodeURIComponent(options.query[key]) + "&";
            url = url.substring(0, url.length - 1);
        }

        // Body
        if(options.body) {
            fetchParams.body = typeof options.body != "string" ?
                JSON.stringify(options.body) : options.body;
        }

        let status = 0;
        return fetch(buildQueryURL(BASE_URL + options.url, options.query), fetchParams).then((res) => {
            status = res.status;
            return status === 204 ? {} : res.json()
        }).then((data) => {
            if((status < 200 || status >= 400) && !noCrash) {
                // noinspection JSCheckFunctionSignatures
                reportRequestFailure(fetchParams, status, data, this.token);
                throw new Error(status + ": " + (data.error ? data.error.message : "Request failed..."));
            }
            return data;
        });
    }
}
