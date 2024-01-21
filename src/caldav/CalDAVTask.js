import {t} from "../../lib/mmk/i18n";

/**
 * @implements TaskInterface
 */
export class CalDAVTask {
  constructor(data, list, handler) {
    this.id = data.id;

    this.rawData = data.rawData;
    if(data.rawData) {
      this.title = this.rawData.VCALENDAR.VTODO.SUMMARY;
      this.completed = this.rawData.VCALENDAR.VTODO.STATUS === "COMPLETED";
    }

    this.list = list;
    this._handler = handler;
  }

  getCurrentTimeString() {
    const time = hmSensor.createSensor(hmSensor.id.TIME);
    return time.year.toString() +
      time.month.toString().padStart(2, "0") +
      time.day.toString().padStart(2, "0") +
      "T" + time.hour.toString().padStart(2, "0") +
      time.minute.toString().padStart(2, "0") +
      time.second.toString().padStart(2, "0");
  }

  setCompleted(completed) {
    this.completed = completed;
    this.rawData.VCALENDAR.VTODO.STATUS = completed ? "COMPLETED" : "NEEDS-ACTION";

    if(completed) {
      this.rawData.VCALENDAR.VTODO.COMPLETED = this.getCurrentTimeString();
      this.rawData.VCALENDAR.VTODO["PERCENT-COMPLETE"] = "100";
    } else {
      delete this.rawData.VCALENDAR.VTODO.COMPLETED;
      delete this.rawData.VCALENDAR.VTODO["PERCENT-COMPLETE"];
    }

    return this._handler.messageBuilder.request({
      package: "caldav_proxy",
      action: "replace_task",
      id: this.id,
      rawData: this.rawData,
    }, {timeout: 5000})
  }

  setTitle(title) {
    this.title = title;
    this.rawData.VCALENDAR.VTODO.SUMMARY = title;
    return this._handler.messageBuilder.request({
      package: "caldav_proxy",
      action: "replace_task",
      id: this.id,
      rawData: this.rawData,
    }, {timeout: 5000})
  }

  delete() {
    return this._handler.messageBuilder.request({
      package: "caldav_proxy",
      action: "delete_task",
      id: this.id,
    }, {timeout: 5000});
  }

  sync() {
    return this._handler.messageBuilder.request({
      package: "caldav_proxy",
      action: "read_task",
      id: this.id,
    }, {timeout: 5000}).then((data) => {
      this.rawData = data.rawData;
      this.title = this.rawData.VCALENDAR.VTODO.SUMMARY;
      this.completed = this.rawData.VCALENDAR.VTODO.STATUS === "COMPLETED";
    })
  }
}