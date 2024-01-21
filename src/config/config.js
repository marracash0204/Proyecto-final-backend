import dotenv from "dotenv";

dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV,
  mongoURI: process.env.MONGO_URI,
  sessionSecret: process.env.SESSION_SECRET,
  passportGitHubClientId: process.env.PASSPORT_GITHUB_CLIENT_ID,
  passportGitHubClientSecret: process.env.PASSPORT_GITHUB_CLIENT_SECRET,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  emailAdmin: process.env.EMAIL_ADMIN,
  passwordAdmin: process.env.PASSWORD_ADMIN,
  port: process.env.PORT,
};

export default config;
