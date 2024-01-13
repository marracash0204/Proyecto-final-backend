import { ticketRepository } from "../repository/ticketRepository.js";

export class ticketManager {
  static async generateTicket(cartId, purchaser) {
    try {
      const ticketResult = await ticketRepository.generateTicket(
        cartId,
        purchaser
      );
      return ticketResult;
    } catch (error) {
      console.error("Error en generateTicket:", error);
      throw error;
    }
  }
}
