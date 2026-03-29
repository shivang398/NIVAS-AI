import {
  getSystemStatusService,
  getAlertsService,
} from "../services/noc.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { success } from "../utils/response.js";


export const getSystemStatus = asyncHandler(async (req, res) => {
  const data = await getSystemStatusService();

  return success(res, data, "System status fetched");
});


export const getAlerts = asyncHandler(async (req, res) => {
  const data = await getAlertsService();

  return success(res, data, "Alerts fetched");
});