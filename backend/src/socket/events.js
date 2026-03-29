import { getIO } from "./socket.js";


export const emitOfferUpdate = (offer) => {
  const io = getIO();


  if (offer.tenantId) {
    io.to(offer.tenantId).emit("offer_updated", offer);
  }

  if (offer.property?.ownerId) {
    io.to(offer.property.ownerId).emit("offer_updated", offer);
  }
};