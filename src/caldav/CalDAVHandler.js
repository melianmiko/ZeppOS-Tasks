import {CalDAVTaskList} from "./CalDAVTaskList";

/**
 * @implements HandlerInterface
 */
export class CalDAVHandler {
  constructor(messageBuilder) {
    this.messageBuilder = messageBuilder;
  }

  getTaskList(id) {
    return new CalDAVTaskList({id}, this);
  }

  getTaskLists() {
    return this.messageBuilder.request({
      package: "caldav_proxy",
      action: "get_task_lists",
    }, {timeout: 5000}).then((d) => {
      if(d.error) throw new Error(d.error);
      return d.map((r) => new CalDAVTaskList(r, this));
    })
  }
}