import { messageModel } from "../models/chatModel.js";
import { MessageDTO } from "../dto/messageDto.js";
import logger from "../service/utilities/logger.js";

export class MessageRepo {
  async getAllMessageRepo() {
    try {
      const allMessage = await messageModel.find().lean();
      return allMessage.map((message) => MessageDTO.createFromModel(message));
    } catch (error) {
      logger.error("Error en getAllMessageRepo:", error);
      throw error;
    }
  }

  async newMessageRepo(user, message) {
    try {
      const newMessage = await messageModel.create({
        user,
        message,
      });
      return MessageDTO.createFromModel(newMessage);
    } catch (error) {
      logger.error("Error en newMessageRepo:", error);
      throw error;
    }
  }
}
