import chai from "chai";
import supertest from "supertest";
import config from "../../../src/config/config.js";

const expect = chai.expect;
const request = supertest(`http://localhost:3001`);

describe("Rutas para el inicio de sesión", () => {
  it("Debería iniciar sesión si los datos son válidos al hacer el POST", async () => {
    const loginResponse = await request
      .post("/api/login")
      .send({
        email: config.emailAdmin,
        password: config.passwordAdmin,
      })
      .expect(302);

    expect(loginResponse.headers.location).to.equal("/profile");
    expect(loginResponse.headers["set-cookie"]).to.be.ok;
  });

  it("Deberia registrarse si los datos son validos al hacer el POST", async () => {
    const signupResponse = await request
      .post("/api/signup")
      .send({
        first_name: "test first name",
        last_name: "test last name",
        age: 22,
        email: "test@test.com",
        password: "test123",
      })
      .expect(302);

    expect(signupResponse.headers.location).to.equal("/login");
    expect(signupResponse.headers["set-cookie"]).to.be.ok;
  });

  it("Debería cerrar sesión al hacer el POST", async () => {
    const response = await request.post("/logout").expect(302);
    expect(response.headers.location).to.equal("/login");
  });
});
