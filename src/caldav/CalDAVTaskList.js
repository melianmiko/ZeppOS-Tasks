import {CalDAVTask} from "./CalDAVTask";

/**
 * @implements TaskListInterface
 */
export class CalDAVTaskList {
  constructor(data, handler) {
    this.id = data.id;
    this.title = data.title;

    this._handler = handler;
  }

  getTask(id) {
    return new CalDAVTask({id}, this, this._handler);
  }

  getTasks(withCompleted, pageToken) {
    return this._handler.messageBuilder.request({
      package: "caldav_proxy",
      action: "list_tasks",
      listId: this.id,
      completed: pageToken === "completed",
    }, {timeout: 5000}).then((d) => {
      if(d.error) throw new Error(d.error);
      return {
        tasks: d.map((r) => new CalDAVTask(r, this, this._handler)),
        nextPageToken: (withCompleted && !pageToken) ? "completed" : "",
      };
    })
  }

  insertTask(title) {
    return this._handler.messageBuilder.request({
      package: "caldav_proxy",
      action: "insert_task",
      listId: this.id,
      title
    }, {timeout: 5000}).then((d) => {
      if(d.error) throw new Error(d.error);
      return true;
    })
  }
}