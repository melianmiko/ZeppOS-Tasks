import {GoogleTask} from "./GoogleTask";

export class GoogleTaskList {
  constructor(data, handler) {
    this._handler = handler;

    this.id = data.id;
    this.title = data.title;
  }

  insertTask(title) {
    return this._handler.request({
      method: "POST",
      url: `/lists/${this.id}/tasks`,
      body: {
        status: "needsAction",
        title,
      },
      query: {
        access_token: this._handler.token
      },
    });
  }

  getTask(id) {
    return new GoogleTask({id}, this, this._handler);
  }

  getTasks(withCompleted, pageToken) {
    const query = {access_token: this._handler.token};
    if (withCompleted) {
      query.showCompleted = true;
      query.showHidden = true;
    }
    if (typeof pageToken === "string") {
      query.pageToken = pageToken;
    }

    return this._handler.request({
      method: "GET",
      url: `/lists/${this.id}/tasks`,
      query
    }).then((data) => {
      data.items.sort((a, b) => a.position < b.position ? -1 : 1);
      console.log(JSON.stringify(data.items));
      data.items = data.items.map((item) => new GoogleTask(item, this, this._handler))
      console.log(JSON.stringify(data.items));
      return {
        tasks: data.items,
        nextPageToken: data.nextPageToken,
      }
    })
  }
}