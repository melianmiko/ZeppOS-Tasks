import {ListScreen} from "../../lib/mmk/ListScreen";
import {ScreenBoard} from "../../lib/mmk/ScreenBoard";
import {request} from "../Utils";

const { config, t } = getApp()._options.globalData

export class TaskEditScreen extends ListScreen {
    constructor(param, pageClass) {
        super();

        this.accentColor = 0x00a2b6;

        this.pageClass = pageClass;
        this.isSaving = false;

        param = JSON.parse(param);
        this.task = param.task;
        this.list = param.list;
        this.mode = param.mode;
    }

    init() {
        this.text({
            text: this.task.title,
            fontSize: this.fontSize + 2
        });
        this.offset(16);
        this.headline(t("Actions"));
        this.row({
            text: t("Edit"),
            icon: "icon_s/edit.png",
            callback: () => {
                this.board.visible = true;
                hmApp.setLayerY(0);
                hmUI.setLayerScrolling(false);
            }
        });
        this.deleteRow = this.row({
            text: t("Delete"),
            icon: "icon_s/delete.png",
            callback: () => this.doDelete()
        })
        this.offset();

        this.board = new ScreenBoard();
        this.board.title = "Edit task";
        this.board.value = this.task.title;
        this.board.confirmButtonText = t("Save");
        this.board.onConfirm = (v) => this.doOverrideTitle(v);
        this.board.visible = false;
    }

    doDelete() {
        if(this.isSaving) return;

        this.isSaving = true;
        this.deleteRow.setText(t("Deleting..."));

        const rqData = {
            action: "delete_task",
            list: this.list,
            id: this.task.id,
        };

        if(this.mode === "offline") {
            let storage = config.get("tasks", []);
            storage = storage.filter((i) => i.id !== this.task.id);

            config.set("tasks", storage);
            hmApp.goBack();
        } else if(this.mode === "cached") {
            const queue = config.get("request_queue", []);
            queue.push(rqData)

            const lastTasks = config.get("last_tasks");
            lastTasks.items = lastTasks.items.filter((i) => i.id !== this.task.id);

            config.update({
                request_queue: queue,
                last_tasks: lastTasks
            });
            hmApp.goBack();
        } else {
            request(rqData).then(() => hmApp.goBack());
        }
    }

    doOverrideTitle(value) {
        if(this.isSaving) return;

        this.isSaving = true;
        this.board.confirmButtonText = t("Saving, wait...");

        const rqData = {
            action: "set_task_title",
            list: this.list,
            id: this.task.id,
            title: value
        };

        if(this.mode === "offline") {
            let storage = config.get("tasks", []);
            for(let item of storage) {
                if(item.id !== this.task.id) continue;
                item.title = value;
                break;
            }

            config.set("tasks", storage);
            hmApp.goBack();
        } else if(this.mode === "cached") {
            const queue = config.get("request_queue", []);
            queue.push(rqData)

            const lastTasks = config.get("last_tasks");
            for(let item of lastTasks.items) {
                if(item.id !== this.task.id) continue;
                item.title = value;
                break;
            }

            config.update({
                request_queue: queue,
                last_tasks: lastTasks
            });
            hmApp.goBack();
        } else {
            request(rqData).then(() => hmApp.goBack());
        }
    }
}
