import {
  createMaintenanceService,
  getMaintenanceService,
  updateMaintenanceService,
} from "../services/maintenance.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";


export const createMaintenance = asyncHandler(async (req, res) => {
  if (!req.body) {
    throw new AppError("Maintenance data is required", 400);
  }

  const data = await createMaintenanceService(req.user, req.body);

  return created(res, data, "Maintenance request created");
});

export const getMaintenance = asyncHandler(async (req, res) => {
  const data = await getMaintenanceService(req.user);

  return success(res, data, "Maintenance fetched");
});


export const updateMaintenance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Maintenance ID is required", 400);
  }

  const data = await updateMaintenanceService(
    req.user,
    id,
    req.body
  );

  return success(res, data, "Maintenance updated");
});