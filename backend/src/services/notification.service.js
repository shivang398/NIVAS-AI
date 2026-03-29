import prisma from "../config/prisma.js";
import { getIO } from "../socket/socket.js";
import { AppError } from "../utils/AppError.js";


export const createNotification = async (userId, title, message) => {
  if (!userId || !title || !message) {
    throw new AppError("Missing notification fields", 400);
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });

  const io = getIO();
  io.to(userId).emit("notification", notification);

  return notification;
};


export const notifyUsersByRole = async (role, title, message) => {
  if (!role || !title || !message) {
    throw new AppError("Missing notification fields", 400);
  }


  const users = await prisma.user.findMany({
    where: { role },
    select: { id: true },
  });

  if (!users.length) return [];

  const notificationsData = users.map((user) => ({
    userId: user.id,
    title,
    message,
  }));

  await prisma.notification.createMany({
    data: notificationsData,
  });


  const io = getIO();

  notificationsData.forEach((notif) => {
    io.to(notif.userId).emit("notification", notif);
  });

  return notificationsData;
};


export const getUserNotifications = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};


export const markAsRead = async (id, userId) => {
  if (!id) {
    throw new AppError("Notification ID is required", 400);
  }


  const notification = await prisma.notification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};