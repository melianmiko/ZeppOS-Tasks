interface TaskInterface {
    id: any;
    title: string;
    completed: boolean;

    setCompleted(completed: boolean): Promise<void>;
    setTitle(title: string): Promise<void>;
    delete(): Promise<void>;
    sync(): Promise<void>;
}

interface TaskListInterface {
    id: any;
    title: string;

    insertTask(title: string): Promise<void>;
    getTasks(withCompleted: boolean, pageToken: any): Promise<{
        tasks: TaskInterface[],
        nextPageToken: any,
    }>;
    getTask(id: any): TaskInterface;
}

interface HandlerInterface {
    getTaskLists(): Promise<TaskListInterface[]>;
    getTaskList(id: any): TaskListInterface;
}