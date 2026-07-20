import { Request, Response, NextFunction } from "express";
import { httpRequestsTotal } from "./metrics";

export function metricsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.on("finish", () => {
        httpRequestsTotal.inc({
            method: req.method,
            route: req.route?.path || req.path,
            statusCode: res.statusCode.toString(),
        });
    });

    next();
}