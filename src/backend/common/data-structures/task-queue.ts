import { Deque } from 'js-sdsl';
import type { RejectCallback, ResolveCallback } from '../types/promise';

export abstract class AbstractTaskQueue<T> {
    protected readonly tasks: Deque<Promise<T>> = new Deque();

    protected readonly pending: Deque<[ResolveCallback<T>, RejectCallback]> =
        new Deque();

    get numPending() {
        return this.pending.length;
    }

    get numFinished() {
        return this.numTasks - this.numPending;
    }

    get numTasks() {
        return this.tasks.length;
    }

    get isEmpty() {
        return this.numTasks === 0;
    }

    get isBusy() {
        return this.numPending > 0;
    }

    get isIdle() {
        return this.numPending === 0;
    }

    *[Symbol.iterator]() {
        while (!this.isEmpty) {
            yield this.dequeue()!;
        }
    }

    async *[Symbol.asyncIterator]() {
        while (!this.isEmpty) {
            yield await this.dequeue()!;
        }
    }

    dequeue(): Promise<T> | undefined {
        if (this.isEmpty) {
            return;
        }

        return this.tasks.popFront();
    }

    protected startWork(task: Promise<T>) {
        this.addWorker();
        this.trackWork(task);
    }

    protected addWorker() {
        this.tasks.pushBack(
            new Promise((resolve, reject) =>
                this.pending.pushBack([resolve, reject])
            )
        );
    }

    protected trackWork(task: Promise<T>) {
        task.then((value) => {
            const [resolve, _reject] = this.pending.popFront()!;
            resolve(value);
        }).catch((reason) => {
            const [_resolve, reject] = this.pending.popFront()!;
            reject(reason);
        });
    }
}

export class TaskQueue<T> extends AbstractTaskQueue<T> {
    constructor(tasks?: Iterable<Promise<T>>) {
        super();

        if (tasks !== undefined) {
            this.enqueueAll(tasks);
        }
    }

    enqueue(task: Promise<T>) {
        this.startWork(task);
    }

    enqueueAll(tasks: Iterable<Promise<T>>) {
        for (const task of tasks) {
            this.enqueue(task);
        }
    }
}

export class LimitTaskQueue<T> extends AbstractTaskQueue<T> {
    static readonly DEFAULT_MAX_CONCURRENCY = 100;

    protected hasDone = false;

    constructor(
        protected readonly taskFactory: Iterator<Promise<T>>,
        protected readonly maxConcurrency: number = LimitTaskQueue.DEFAULT_MAX_CONCURRENCY
    ) {
        super();
        this.enqueueMany(this.maxConcurrency);
    }

    protected enqueue(task: Promise<T>) {
        this.startWork(task);
    }

    protected enqueueMany(n: number) {
        for (let i = 0; i < n; i++) {
            this.enqueueNext();
        }
    }

    protected enqueueNext() {
        if (this.hasDone) {
            return;
        }

        const { done, value: task } = this.taskFactory.next();
        if (done) {
            this.hasDone = true;
        } else {
            this.enqueue(task);
        }
    }

    protected trackWork(task: Promise<T>) {
        task.then((value) => {
            this.enqueueNext();
            const [resolve, _reject] = this.pending.popFront()!;
            resolve(value);
        }).catch((reason) => {
            this.enqueueNext();
            const [_resolve, reject] = this.pending.popFront()!;
            reject(reason);
        });
    }
}
