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
    return undefined;
  }

  getTasks(withCompleted, pageToken) {
    return Promise.resolve({nextPageToken: undefined, tasks: []});
  }

  insertTask(title) {
    return Promise.resolve(undefined);
  }
}