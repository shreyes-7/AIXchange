import * as service from "../services/license.service.js";

const send = (res, status, data, message) => res.status(status).json({ success: true, ...(message ? { message } : {}), data });

export const create = async (req, res, next) => { try { send(res, 202, await service.create(req.user, req.body)); } catch (error) { next(error); } };
export const sync = async (req, res, next) => { try { const result = await service.sync(req.user, req.body, req.body.operation || "create"); send(res, result.state === "PENDING" ? 202 : 200, result); } catch (error) { next(error); } };
export const get = async (req, res, next) => { try { send(res, 200, await service.get(Number(req.params.licenseId))); } catch (error) { next(error); } };
export const verify = async (req, res, next) => { try { send(res, 200, await service.verify(Number(req.params.licenseId))); } catch (error) { next(error); } };
export const list = async (req, res, next) => { try { send(res, 200, await service.list(req.query)); } catch (error) { next(error); } };
export const byAsset = async (req, res, next) => { try { send(res, 200, await service.byAsset(req.params.assetId, req.query)); } catch (error) { next(error); } };
export const byLicensor = async (req, res, next) => { try { send(res, 200, await service.byLicensor(req.params.address, req.query)); } catch (error) { next(error); } };
export const update = async (req, res, next) => { try { send(res, 202, await service.update(req.user, Number(req.params.licenseId), req.body)); } catch (error) { next(error); } };
export const revoke = async (req, res, next) => { try { send(res, 202, await service.revoke(req.user, Number(req.params.licenseId))); } catch (error) { next(error); } };
export const templates = async (req, res, next) => { try { send(res, 200, service.getTemplates()); } catch (error) { next(error); } };
export const template = async (req, res, next) => { try { send(res, 200, service.getTemplate(req.params.type.toUpperCase())); } catch (error) { next(error); } };
