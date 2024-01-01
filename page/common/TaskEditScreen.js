import {ListScreen} from "../../lib/mmk/ListScreen";
import {ScreenBoard} from "../../lib/mmk/ScreenBoard";
import {createSpinner} from "../Utils";

const { config, t, tasksProvider } = getApp()._options.globalData

export class TaskEditScreen extends ListScreen {
    constructor(param, pageClass) {
        super();

        this.accentColor = 0x00a2b6;

        this.pageClass = pageClass;
        this.isSaving = false;

        param = JSON.parse(param);
        this.task = tasksProvider.getTaskList(param.list_id).getTask(param.task_id);
    }

    init() {
        const hideSpinner = createSpinner();
        this.task.sync().then(() => {
            hideSpinner();
            this.build();
        })
    }

    build() {
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

        createSpinner();
        this.task.delete().then(() => {
            hmApp.goBack();
        });
    }

    doOverrideTitle(value) {
        if(this.isSaving) return;

        this.isSaving = true;
        this.board.confirmButtonText = t("Saving, wait...");
        this.task.setTitle(value).then(() => {
            hmApp.goBack();
        })
    }
}
