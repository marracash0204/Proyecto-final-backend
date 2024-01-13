import { MessageRepo } from "../repository/messageRepository.js";

const messageRepo = new MessageRepo();

export class messageManager {
  async getAllMessage() {
    try {
      const allMessage = await messageRepo.getAllMessageRepo();
      return allMessage;
    } catch (error) {
      console.error("Error en getAllMessage:", error);
      throw error;
    }
  }

  async newMessage(user, message) {
    try {
      const newMessage = await messageRepo.newMessageRepo(user, message);
      return newMessage;
    } catch (error) {
      console.error("Error en newMessage:", error);
      throw error;
    }
  }
}
