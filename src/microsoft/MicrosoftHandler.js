import {clientFetch as fetch} from "../../lib/mmk/FetchForward";
import {reportRequestFailure} from "../ErrorReportTool";
import {buildQueryURL} from "../Tools";
import {MicrosoftToDoList} from "./MicrosoftToDoList";

const BASE_URL = "https://graph.microsoft.com/v1.0/me/todo";

// noinspection DuplicatedCode
/**
 * @implements HandlerInterface
 */
export class MicrosoftHandler {
  constructor(token) {
    this.token = token;
  }

  getTaskList(id) {
    return new MicrosoftToDoList({id}, this);
  }

  getTaskLists() {
    return this.request({
      method: "GET",
      url: "/lists"
    }).then((data) => {
      return data.value.map((row) => new MicrosoftToDoList(row, this));
    })
  }

  request(options, noCrash=false) {
    const fetchParams = {
      method: options.method === "GET" ? "GET" : "POST",
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${this.token}`,
      },
      timeout: 5000,
    }

    // Method
    if(options.method !== "GET" && options.method !== "POST")
      fetchParams.headers["X-HTTP-Method"] = options.method;

    // Body
    if(options.body) {
      fetchParams.body = typeof options.body != "string" ?
        JSON.stringify(options.body) : options.body;
    }

    let status = 0;
    let url = buildQueryURL(BASE_URL + options.url, options.query);
    return fetch(url, fetchParams).then((res) => {
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
