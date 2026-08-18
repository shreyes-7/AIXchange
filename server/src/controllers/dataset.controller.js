import * as datasetService from "../services/dataset.service.js";

const respond = (res, status, data, message) => res.status(status).json({ success: true, ...(message ? { message } : {}), data });

export const upload = async (req, res, next) => { try { respond(res, 201, await datasetService.encryptAndPin(req.file), "Dataset encrypted and pinned to IPFS."); } catch (error) { next(error); } };
export const create = async (req, res, next) => { try { respond(res, 201, await datasetService.create(req.user, req.body), "Dataset created."); } catch (error) { next(error); } };
export const list = async (req, res, next) => { try { respond(res, 200, await datasetService.list(req.query)); } catch (error) { next(error); } };
export const categories = async (req, res, next) => { try { respond(res, 200, await datasetService.categories()); } catch (error) { next(error); } };
export const get = async (req, res, next) => { try { respond(res, 200, await datasetService.get(req.params.id)); } catch (error) { next(error); } };
export const update = async (req, res, next) => { try { respond(res, 200, await datasetService.update(req.params.id, req.user, req.body), "Dataset updated."); } catch (error) { next(error); } };
export const remove = async (req, res, next) => { try { await datasetService.remove(req.params.id, req.user); return res.status(204).send(); } catch (error) { next(error); } };
export const preview = async (req, res, next) => { try { respond(res, 200, await datasetService.preview(req.params.id)); } catch (error) { next(error); } };
export const syncBlockchain = async (req, res, next) => { try { respond(res, 200, await datasetService.syncBlockchain(req.params.id, req.user, req.body), "Blockchain registration synchronized."); } catch (error) { next(error); } };
export const getReviews = async (req, res, next) => { try { respond(res, 200, await datasetService.reviews(req.params.id, Number(req.query.page || 1), Number(req.query.limit || 20))); } catch (error) { next(error); } };
export const addReview = async (req, res, next) => { try { respond(res, 201, await datasetService.addReview(req.params.id, req.user, req.body), "Review saved."); } catch (error) { next(error); } };
export const getVersions = async (req, res, next) => { try { respond(res, 200, await datasetService.versions(req.params.id)); } catch (error) { next(error); } };
export const addVersion = async (req, res, next) => { try { respond(res, 201, await datasetService.addVersion(req.params.id, req.user, req.body), "Dataset version created."); } catch (error) { next(error); } };
export const getVersion = async (req, res, next) => { try { respond(res, 200, await datasetService.getVersion(req.params.id, req.params.version)); } catch (error) { next(error); } };
