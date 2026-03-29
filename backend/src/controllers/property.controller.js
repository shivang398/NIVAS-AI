import {
  createPropertyService,
  getPropertiesService,
  getPropertyByIdService,
  updatePropertyService,
  deletePropertyService,
} from "../services/property.service.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { success, created } from "../utils/response.js";
import { AppError } from "../utils/AppError.js";


export const createProperty = asyncHandler(async (req, res) => {
  const { body, files, user } = req;

  if (!body) {
    throw new AppError("Property data is required", 400);
  }

  const images = files?.map((f) => f.filename) || [];

  const data = await createPropertyService(
    body,
    user.id,
    images
  );

  return created(res, data, "Property created");
});

export const getProperties = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await getPropertiesService(page, limit);

  return success(res, data, "Properties fetched");
});

export const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await getPropertyByIdService(id);

  return success(res, data, "Property fetched");
});

export const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { body, files, user } = req;

  if (!id) {
    throw new AppError("Property ID is required", 400);
  }

  const images = files?.map((f) => f.filename);

  const data = await updatePropertyService(
    id,
    body,
    user.id,
    images
  );

  return success(res, data, "Property updated");
});


export const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError("Property ID is required", 400);
  }

  await deletePropertyService(id, req.user.id);

  return success(res, {}, "Property deleted");
});