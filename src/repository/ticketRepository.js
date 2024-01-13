import { Ticket } from "../models/ticketModel.js";
import { TicketDTO } from "../dto/ticketDto.js";
import { cartManager } from "../service/cartsManager.js";
import { v4 as uuidv4 } from "uuid";
import logger from "../service/utilities/logger.js";

const cartsManager = new cartManager();

export class ticketRepository {
  static generateTicketCode() {
    return uuidv4().replace(/-/g, "");
  }

  static async generateTicket(cartId, purchaser) {
    try {
      const { updatedCart, totalAmount } = await cartsManager.finalizePurchase(
        cartId
      );
      console.log(updatedCart.products.length);
      if (updatedCart.products.length > 0) {
        const ticketData = {
          code: this.generateTicketCode(),
          purchaser: purchaser,
          purchase_datetime: new Date(),
          amount: totalAmount,
        };

        const createdTicket = await Ticket.create(ticketData);

        return new TicketDTO(
          createdTicket._id,
          createdTicket.code,
          createdTicket.purchase_datetime,
          createdTicket.amount,
          createdTicket.purchaser
        );
      } else {
        return null;
      }
    } catch (error) {
      logger.error("Error en generateTicket:", error);
      throw error;
    }
  }
}
