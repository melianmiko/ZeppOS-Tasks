import {TickTickTask} from "./TickTickTask";

export class TickTickTaskList {
  constructor(data, handler) {
    this._handler = handler;

    this.id = data.id;
    this.title = data.name;
  }

  insertTask(title) {
    return this._handler.request({
      method: "POST",
      url: `/task`,
      body: {
        title,
        projectId: this.id,
      },
    });
  }

  getTask(id) {
    return new TickTickTask({id}, this, this._handler);
  }

  getTasks() {
    return this._handler.request({
      method: "GET",
      url: `/project/${this.id}/data`,
    }).then((data) => {
      const tasks = data.tasks
          .sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1)
          .map((item) => new TickTickTask(item, this, this._handler));

      return {
        tasks: tasks,
        nextPageToken: data.nextPageToken,
      }
    })
  }
}