import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import bcrypt from "bcrypt";
import { userModel } from "../../models/userModel.js";
import config from "../../config/config.js";
import { cartManager } from "../cartsManager.js";

const cartsManager = new cartManager();

const LocalStrategy = local.Strategy;

const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const {
          first_name,
          last_name,
          age,
          cart,
          resetToken,
          resetTokenExpiration,
        } = req.body;
        try {
          const exists = await userModel
            .findOne({ email: username })
            .populate("cart.products.product")
            .lean();
          if (exists) {
            return done(null, false);
          }

          const user = await userModel.create({
            first_name,
            last_name,
            age,
            email: username,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
            cart: null,
            resetToken: null,
            resetTokenExpiration: null,
          });

          if (username === "adminCoder@coder.com") {
            user.rol = "admin";
          } else {
            user.rol = "usuario";
          }

          await user.save();

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userModel
            .findOne({ email: username })
            .populate("cart.products.product")
            .lean();
          if (!user) {
            return done(null, false);
          }

          if (!bcrypt.compareSync(password, user.password)) {
            return done(null, false);
          }
          user.last_connection = new Date();
          await userModel.findByIdAndUpdate(user._id, {
            last_connection: user.last_connection,
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.passportGitHubClientId,
        clientSecret: config.passportGitHubClientSecret,
        callbackURL: "http://localhost:3001/api/githubcallback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const user = await userModel
            .findOne({ email })
            .populate("cart.products.product")
            .lean();

          if (!user) {
            const newCart = await cartsManager.createCart();
            const newUser = await userModel.create({
              first_name: profile.username,
              last_name: "",
              age: 27,
              password: "",
              email,
              cart: newCart._id,
            });

            return done(null, newUser);
          } else {
            done(null, user);
          }
        } catch (error) {
          done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id).lean();
    done(null, user);
  });
};

export default initializePassport;
