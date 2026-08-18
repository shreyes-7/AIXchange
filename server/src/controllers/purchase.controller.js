import * as service from "../services/purchase.service.js";
import { fetchAuthorizedDataset } from "../services/download.service.js";

const send = (res, status, data, message) => res.status(status).json({ success: true, ...(message ? { message } : {}), data });

export const initiate = async (req, res, next) => { try { send(res, 202, await service.initiate(req.user, req.body)); } catch (error) { next(error); } };
export const sync = async (req, res, next) => { try { const result = await service.sync(req.user, req.body); send(res, result.state === "CONFIRMED" ? 200 : 202, result); } catch (error) { next(error); } };
export const listMine = async (req, res, next) => { try { send(res, 200, await service.listMine(req.user, req.query)); } catch (error) { next(error); } };
export const get = async (req, res, next) => { try { send(res, 200, await service.get(req.user, req.params.purchaseId)); } catch (error) { next(error); } };
export const status = async (req, res, next) => { try { send(res, 200, await service.status(req.user, req.params.transactionHash)); } catch (error) { next(error); } };
export const purchaseStatus = async (req, res, next) => { try { const result = await service.get(req.user, req.params.purchaseId); send(res, 200, { purchaseId: result.purchaseId, status: result.status, transactionHash: result.transactionHash }); } catch (error) { next(error); } };
export const datasetHistory = async (req, res, next) => { try { send(res, 200, await service.listDatasetPurchases(req.user, req.params.datasetId || req.params.id, req.query)); } catch (error) { next(error); } };
export const download = async (req, res, next) => { try { const result = await fetchAuthorizedDataset(req.user, req.params.id, req.query.licenseId); res.set({ "Content-Type": result.mimeType || "application/octet-stream", "Content-Disposition": `attachment; filename="${result.fileName}"`, "Content-Length": String(result.buffer.length), "Cache-Control": "private, no-store" }); return res.status(200).send(result.buffer); } catch (error) { next(error); } };
