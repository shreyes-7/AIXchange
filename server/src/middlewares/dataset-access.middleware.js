import accessControl from "../services/access-control.service.js";

const requireDatasetAccess = async (req, res, next) => {
    try {
        req.datasetAccess = await accessControl.authorize(req.user, req.params.datasetId || req.params.id, req.query.licenseId);
        next();
    } catch (error) { next(error); }
};

export default requireDatasetAccess;
