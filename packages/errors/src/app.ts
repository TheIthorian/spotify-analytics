export class AppError<T = undefined> extends Error {
    name: string;
    data: T | undefined;

    status = 500;
    logError = false;

    constructor(message: string, name: string, opts: { data?: T; details?: string } = {}) {
        super(message);
        this.data = opts.data;
        this.name = name;

        if (this.logError) {
        }
    }

    toJson() {
        return {
            message: this.message,
            name: this.name,
            ...this.data,
        };
    }
}

export class ResourceNotFoundError extends AppError<object> {
    status = 404;
    constructor(message: string, data: object = {}) {
        super(message, ResourceNotFoundError.name, { data });
    }
}

export class UnableToCreateResourceError extends AppError<object> {
    status = 500;
    constructor(details: string, data: object = {}) {
        super('Unable to create resource', UnableToCreateResourceError.name, { data, details });
    }
}

export class NotImplementedError extends AppError<object> {
    status = 501;
    constructor(message: string) {
        super(message, NotImplementedError.name);
    }
}
