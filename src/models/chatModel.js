import mongoose from "mongoose";

const messageCollection = "message";

const messageSchema = mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
});

const messageModel = mongoose.model(messageCollection, messageSchema);

export { messageModel };
