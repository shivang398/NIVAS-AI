import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const getSystemStatusService = async () => {
  try {

    const [pendingMaintenance, activeLeases] = await Promise.all([
      prisma.maintenance.count({
        where: { status: "open" },
      }),
      prisma.lease.count({
        where: { status: "active" },
      }),
    ]);

 
    let systemHealth = "HEALTHY";

    if (pendingMaintenance > 20) systemHealth = "CRITICAL";
    else if (pendingMaintenance > 10) systemHealth = "WARNING";

    return {
      pendingMaintenance,
      activeLeases,
      systemHealth,
    };

  } catch (err) {
    throw new AppError("Failed to fetch system status", 500);
  }
};


export const getAlertsService = async () => {
  try {
    const alerts = [];


    const [pendingMaintenance, activeLeases] = await Promise.all([
      prisma.maintenance.count({
        where: { status: "open" },
      }),
      prisma.lease.count({
        where: { status: "active" },
      }),
    ]);


    if (pendingMaintenance > 10) {
      alerts.push({
        type: "MAINTENANCE_OVERLOAD",
        severity: pendingMaintenance > 20 ? "HIGH" : "MEDIUM",
        message: "Too many pending maintenance requests",
      });
    }

    if (activeLeases === 0) {
      alerts.push({
        type: "NO_ACTIVE_LEASES",
        severity: "LOW",
        message: "No active leases in system",
      });
    }


    return alerts;

  } catch (err) {
    throw new AppError("Failed to fetch alerts", 500);
  }
};