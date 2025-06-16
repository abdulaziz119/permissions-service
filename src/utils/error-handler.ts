import { UNPROCESSABLE_ENTITY } from "http-status-codes";
import {ErrorEnum} from "../models/error.enum";

export const errorHandler = (err, req, res, next) => {

    if (err.error && err.error.details) {
        let errors = {};
        for (const item of err.error.details) {
            errors[`${item.context.key}`] = item.message;
        }
        console.log('Error: =========== > ', errors);
        res.status(UNPROCESSABLE_ENTITY).json({ status: UNPROCESSABLE_ENTITY, message: ErrorEnum.invalidData, errors: err.error.details })

    } else {
        console.log('Error: =========== > ', err);
        next();
    }

};