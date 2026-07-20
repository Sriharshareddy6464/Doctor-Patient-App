import client from "prom-client";

export const register = new client.Registry();

client.collectDefaultMetrics({
    register,
});

export const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total HTTP requests",
    labelNames: ["method", "route", "statusCode"],
});

register.registerMetric(httpRequestsTotal);