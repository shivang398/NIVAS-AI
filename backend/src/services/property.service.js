import https from "node:https";
import prisma from "../config/prisma.js";

const geocodeLocation = (location) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      headers: { 'User-Agent': 'NivasAI/1.0' }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          if (results.length > 0) {
            resolve({
              lat: parseFloat(results[0].lat),
              lon: parseFloat(results[0].lon)
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

export const createPropertyService = async (body, ownerId, images) => {
  const {
    title,
    price,
    location,
    latitude,
    longitude,
    description,
    deposit,
  } = body;

  if (!title || !price || !location) {
    throw new AppError("Title, price and location are required", 400);
  }

  // Auto-geocode if coordinates are missing
  let lat = latitude ? Number(latitude) : null;
  let lon = longitude ? Number(longitude) : null;

  if (!lat || !lon) {
    const coords = await geocodeLocation(location);
    if (coords) {
      lat = coords.lat;
      lon = coords.lon;
    }
  }

  return prisma.property.create({
    data: {
      title,
      description,
      price: Number(price),
      location,
      deposit: deposit ? Number(deposit) : null,
      latitude: lat,
      longitude: lon,
      imageUrls: images || [],
      ownerId,
    },
  });
};


export const getPropertiesService = async (page = 1, limit = 20) => {
  const skip = (Number(page) - 1) * Number(limit);
  
  return prisma.property.findMany({
    skip,
    take: Number(limit),
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } }
    }
  });
};

export const getPropertyByIdService = async (id) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  return property;
};

export const updatePropertyService = async (
  id,
  body,
  userId,
  images
) => {
  if (!id) {
    throw new AppError("Property ID is required", 400);
  }

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.ownerId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  const updateData = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.location !== undefined) updateData.location = body.location;
  if (body.status !== undefined) updateData.status = body.status;
  
  if (body.price !== undefined) updateData.price = Number(body.price);
  if (body.deposit !== undefined) updateData.deposit = Number(body.deposit);
  if (body.latitude !== undefined) updateData.latitude = Number(body.latitude);
  if (body.longitude !== undefined) updateData.longitude = Number(body.longitude);

  if (images?.length > 0) updateData.imageUrls = images;

  return prisma.property.update({
    where: { id },
    data: updateData,
  });
};

export const deletePropertyService = async (id, userId) => {
  if (!id) {
    throw new AppError("Property ID is required", 400);
  }

  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.ownerId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  return prisma.property.delete({
    where: { id },
  });
};