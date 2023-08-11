import { AppError } from './app';

type UsernameNotFoundErrorData = {
    username: string;
};

export class UsernameNotFoundError extends AppError<UsernameNotFoundErrorData> {
    status = 404;
    constructor(message: string, data: UsernameNotFoundErrorData) {
        super(message, UsernameNotFoundError.name, { data });
    }
}
