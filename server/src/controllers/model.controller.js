import modelService from "../services/model.service.js";

const send = (res, status, data, message) =>
    res.status(status).json({ success: true, ...(message ? { message } : {}), data });

export const create = async (req, res, next) => {
    try {
        send(res, 202, await modelService.create(req.user, req.body), "Model registration transaction prepared.");
    } catch (error) {
        next(error);
    }
};

export const sync = async (req, res, next) => {
    try {
        const result = await modelService.sync(req.user, req.body);
        send(
            res,
            result.state === "PENDING" ? 202 : 200,
            result,
            result.state === "PENDING" ? "Transaction pending on blockchain." : "Blockchain state synchronized."
        );
    } catch (error) {
        next(error);
    }
};

export const get = async (req, res, next) => {
    try {
        send(res, 200, await modelService.get(req.params.id));
    } catch (error) {
        next(error);
    }
};

export const list = async (req, res, next) => {
    try {
        send(res, 200, await modelService.list(req.query));
    } catch (error) {
        next(error);
    }
};

export const search = async (req, res, next) => {
    try {
        send(res, 200, await modelService.search(req.query));
    } catch (error) {
        next(error);
    }
};

export const byOwner = async (req, res, next) => {
    try {
        send(res, 200, await modelService.byOwner(req.params.address, req.query));
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        send(res, 200, await modelService.update(req.user, req.params.id, req.body), "Model metadata updated.");
    } catch (error) {
        next(error);
    }
};

export const getVersions = async (req, res, next) => {
    try {
        send(res, 200, await modelService.getVersions(req.params.id));
    } catch (error) {
        next(error);
    }
};

export const getVersion = async (req, res, next) => {
    try {
        send(res, 200, await modelService.getVersion(req.params.id, req.params.version));
    } catch (error) {
        next(error);
    }
};

export const addVersion = async (req, res, next) => {
    try {
        send(res, 202, await modelService.addVersion(req.user, req.params.id, req.body), "Version transaction prepared.");
    } catch (error) {
        next(error);
    }
};

export const setStatus = async (req, res, next) => {
    try {
        send(res, 202, await modelService.setStatus(req.user, req.params.id, req.body.active), "Status update transaction prepared.");
    } catch (error) {
        next(error);
    }
};

export const transferOwnership = async (req, res, next) => {
    try {
        send(res, 202, await modelService.transferOwnership(req.user, req.params.id, req.body.newOwner), "Ownership transfer transaction prepared.");
    } catch (error) {
        next(error);
    }
};

export const verifyHash = async (req, res, next) => {
    try {
        send(res, 200, await modelService.verifyHash(req.params.id, req.body));
    } catch (error) {
        next(error);
    }
};

export const infer = async (req, res, next) => {
    try {
        send(res, 200, await modelService.infer(req.user, req.params.id, req.body), "Inference executed successfully.");
    } catch (error) {
        next(error);
    }
};
