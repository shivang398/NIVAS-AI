import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse(req.body);
    req.body = parsedData; 
    next();
  } catch (err) {
    if (err.errors) {
      const errorMessages = err.errors.map((e) => `${e.path?.join?.(".") || "field"}: ${e.message}`).join(", ");
      return next(new AppError(`Validation Failed - ${errorMessages}`, 400));
    }
    return next(new AppError(err.message || "Validation Error", 400));
  }
};
