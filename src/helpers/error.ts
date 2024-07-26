import { Request, Response, NextFunction, } from 'express';

const catchError = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error: Error) => {
            res.status(500).json({ message: 'Server Error!', success: false });
            next(error);
        });
    }
}

module.exports = catchError;