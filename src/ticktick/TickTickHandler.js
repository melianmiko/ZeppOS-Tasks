import {clientFetch as fetch} from "../../lib/mmk/FetchForward";
import {reportRequestFailure} from "../ErrorReportTool";
import {TickTickTaskList} from "./TickTickTaskList";
import {buildQueryURL} from "../Tools";

const BASE_URL = "https://ticktick.com/open/v1";

export class TickTickHandler {
    constructor(token) {
        this.token = token;
        this.cantListCompleted = true; // tick tick api is freaking trash
    }

    getTaskList(id) {
        return new TickTickTaskList({id, title: ""}, this);
    }

    getTaskLists() {
        return this.request({
            method: "GET",
            url: "/project"
        }).then((data) => {
            return data.map((item) => new TickTickTaskList(item, this));
        })
    }

    request(options, noCrash=false) {
        const fetchParams = {
            method: options.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`,
            },
            timeout: 5000,
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
                throw new Error(status + ": " + (data.error ? data.error.message : "Request failed…"));
            }
            return data;
        });
    }
}
