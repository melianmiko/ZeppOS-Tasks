/**
 * @implements TaskInterface
 */
export class MicrosoftToDoTask {
  constructor(data, parent, handler) {
    this.id = data.id;
    this.title = data.title;
    this.completed = data.status === "completed";

    this.list = parent;
    this._handler = handler;
  }

  sync() {
    return this._handler.request({
      method: "GET",
      url: `/lists/${this.list.id}/tasks/${this.id}`,
    }).then((data) => {
      this.title = data.title;
      this.completed = data.status === "completed";
    });
  }

  delete() {
    return this._handler.request({
      method: "DELETE",
      url: `/lists/${this.list.id}/tasks/${this.id}`
    });
  }

  setCompleted(completed) {
    return this._handler.request({
      method: "PATCH",
      url: `/lists/${this.list.id}/tasks/${this.id}`,
      body: {
        status: completed ? "completed": "notStarted",
      }
    });
  }

  setTitle(title) {
    return this._handler.request({
      method: "PATCH",
      url: `/lists/${this.list.id}/tasks/${this.id}`,
      body: {
        title
      }
    });
  }
}