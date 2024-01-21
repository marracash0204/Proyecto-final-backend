import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import handlebars from "express-handlebars";
import handlebarsHelpers from "handlebars-helpers";
import initializePassport from "./src/service/utilities/passport.js";
import productsRouter from "./src/routes/productsRoutes.js";
import cartRouter from "./src/routes/cartsRoutes.js";
import viewsrouter from "./src/routes/viewsRoutes.js";
import viewsPostRoutes from "./src/routes/viewsPostRoutes.js";
import { Server } from "socket.io";
import passport from "passport";
import { messageManager } from "./src/service/messageManager.js";
import mongoose from "mongoose";
import { productsManager } from "./src/service/productsManager.js";
import userRouter from "./src/routes/userRoutes.js";
import config from "./src/config/config.js";
import moment from "moment/moment.js";
import routerError from "./src/routes/errorRoutes.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import __dirname from "./src/service/utilities/index.js";

mongoose.connect(config.mongoURI);

const productManager = new productsManager();
const messagesManager = new messageManager();

const app = express();
const httpServer = app.listen(config.port, () => console.log("puerto 3001"));
const socketServer = new Server(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoURI,
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

const swaggerOptions = {
  definition: {
    openapi: "3.0.1",

    info: {
      title: "Documentación Ecommerce",

      description: "Documentación",
    },
  },

  apis: [`${__dirname}/docs/**/*.yaml`],
};

const specs = swaggerJSDoc(swaggerOptions);

app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

const hbs = handlebars.create({
  helpers: {
    ...handlebarsHelpers(),
    formatDate: function (date) {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      return formattedDate;
    },
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

app.engine("handlebars", hbs.engine);
app.set("views", "./src/views");
app.set("view engine", "handlebars");
app.use(express.static("./src/public"));

app.use("/api", userRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsrouter, viewsPostRoutes, routerError);

socketServer.on("connection", async (socket) => {
  console.log("connection");

  const messages = await messagesManager.getAllMessage();
  const filteredMessages = messages.filter(
    (message) => message.message.trim() !== ""
  );
  socket.emit("historicalMessages", filteredMessages);

  socket.on("newMessage", async ({ user, message }) => {
    try {
      const newMessage = await messagesManager.newMessage(user, message);
      socketServer.emit("messageReceived", newMessage);
    } catch (error) {
      console.error("Error al crear un mensaje:", error);
    }
  });

  socket.on(
    "addProduct",
    async ({ title, price, description, code, stock }) => {
      await productManager.addProduct(title, description, price, code, stock);
      let products = await productManager.getAllproduct();
      socketServer.emit("productosActualizados", products);
    }
  );

  socket.on("productDeleted", async (id) => {
    await productManager.deleteProduct(id);
    let products = await productManager.getAllproduct();
    socketServer.emit("productosActualizados", products);
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado");
  });
});
