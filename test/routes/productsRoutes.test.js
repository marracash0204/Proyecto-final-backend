import chai from "chai";
import supertest from "supertest";
import config from "../../src/config/config.js";

const expect = chai.expect;
const request = supertest(`http://localhost:3001`);

describe("Rutas de los productos", () => {
  let cookie;
  it("Debería retornar todos los productos al hacer el GET", async () => {
    const response = await request.get("/api/products");
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("object");
    expect(response.body.status).to.equal("success");
    expect(response.body.payload).to.be.an("object");
    expect(response.body.payload.docs).to.be.an("array");
  });

  it("Debería retornar un producto por su ID", async () => {
    const exampleProductId = "6577ab98d2a6e613030de92e";
    const response = await request.get(`/api/products/${exampleProductId}`);

    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("object");
    expect(response.body.title).to.exist;
    expect(response.body.description).to.exist;
    expect(response.body.price).to.exist;
    expect(response.body.code).to.exist;
    expect(response.body.stock).to.exist;
  });

  it("Debería agregar un producto si los campos son válidos al hacer el POST", async () => {
    const loginResponse = await request
      .post("/api/login")
      .send({
        email: config.emailAdmin,
        password: config.passwordAdmin,
      })
      .expect(302);

    const cookieResult = loginResponse.headers["set-cookie"][0];
    expect(cookieResult).to.be.ok;
    cookie = {
      name: cookieResult.split("=")[0],
      value: cookieResult.split("=")[1],
    };
    expect(cookie.name).to.be.ok.and.equal("connect.sid");
    expect(cookie.value).to.be.ok;

    const productData = {
      title: "Producto de prueba",
      description: "Descripción del producto",
      price: 2110,
      code: "123456",
      stock: 110,
    };

    const response = await request
      .post("/addproduct")
      .set("Cookie", `${cookie.name}=${cookie.value}`)
      .send(productData);
    expect(response.status).to.equal(302);
    expect(response.headers.location).to.equal("/addproduct");
  });
});
