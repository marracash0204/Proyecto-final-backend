import chai from "chai";
import supertest from "supertest";

const expect = chai.expect;
const request = supertest(`http://localhost:3001`);

describe("Rutas de los carritos", () => {
  it("Debería retornar todos los carritos al hacer el GET", async () => {
    const response = await request.get("/api/carts");
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("array");
    expect(response.body[0]).to.be.an("object");
    expect(response.body[0].products).to.exist;
  });

  it("Debería retornar un carrito por su ID", async () => {
    const exampleCartId = "653544612b637a732983bf49";
    const response = await request.get(`/api/carts/${exampleCartId}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("object");
    expect(response.body.products).to.exist;
  });

  it("Debería eliminar todos los productos por ID de un carrito al hacer el POST", async () => {
    const exampleCartId = "65721c5194a7857b8b411d89";
    const response = await request.delete(`/api/carts/${exampleCartId}`);
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an("object");
    expect(response.text).to.be.equal(
      "Todos los productos del carrito fueron eliminados"
    );
  });
});
