class MessageDTO {
  constructor(user, message) {
    this.user = user;
    this.message = message;
  }

  static createFromModel(messageModel) {
    return new MessageDTO(messageModel.user, messageModel.message);
  }
}

export { MessageDTO };
