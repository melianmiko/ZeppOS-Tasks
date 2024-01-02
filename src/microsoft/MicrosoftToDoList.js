import {MicrosoftToDoTask} from "./MicrosoftToDoTask";

/**
 * @implements TaskListInterface
 */
export class MicrosoftToDoList {
  constructor(data, handler) {
    this.id = data.id;
    this.title = data.displayName;
    this._handler = handler;
  }

  getTask(id) {
    return new MicrosoftToDoTask({id}, this, this._handler);
  }

  getTasks(withCompleted, pageToken) {
    let filter = "";
    if(!withCompleted) {
      filter = "&$filter=" + encodeURIComponent("status ne 'completed'");
    }

    return this._handler.request({
      method: "GET",
      url: `/lists/${this.id}/tasks?${pageToken ? pageToken : `$top=20${filter}`}`
    }).then((data) => {
      let nextPageToken = null;
      if(data["@odata.nextLink"])
        nextPageToken = data["@odata.nextLink"].substring(data["@odata.nextLink"].indexOf("?") + 1);
      return {
        tasks: data.value.map((row) => new MicrosoftToDoTask(row, this, this._handler)),
        nextPageToken,
      };
    })
  }

  insertTask(title) {
    return this._handler.request({
      method: "POST",
      url: `/lists/${this.id}/tasks`,
      body: {
        title
      }
    });
  }
}