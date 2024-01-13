const socket = io();

const sendMessageButton = document.getElementById("send-message-button");

sendMessageButton.addEventListener("click", () => {
  const username = document.getElementById("username-input").value;
  const message = document.getElementById("message-input").value;
  console.log("Enviando mensaje...");
  socket.emit("newMessage", { user: username, message });
  document.getElementById("message-input").value = "";
});

socket.on("historicalMessages", (historicalMessages) => {
  const messageList = document.getElementById("message-list");
  messageList.innerHTML = "";

  historicalMessages.forEach((message) => {
    if (message.message.trim() !== "") {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<strong>${message.user}</strong>: ${message.message}`;
      messageList.appendChild(listItem);
    }
  });
});

socket.on("messageReceived", (newMessage) => {
  const messageList = document.getElementById("message-list");

  const existingMessages = messageList.querySelectorAll("li");
  const messageExists = Array.from(existingMessages).some((item) => {
    return item.textContent === `${newMessage.user}: ${newMessage.message}`;
  });

  if (!messageExists) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<strong>${newMessage.user}</strong>: ${newMessage.message}`;
    messageList.appendChild(listItem);
  }
});
