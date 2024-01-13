import { fakerES as faker } from '@faker-js/faker'
import { v4 as uuidv4 } from 'uuid';


function generateMockProducts(quantity) {
  const products = [];

  for (let i = 0; i < quantity; i++) {
    const product = {
        _id: uuidv4(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        code: uuidv4(),
        stock: faker.datatype.number(100),
      };

    products.push(product);
  }

  return products;
}

export { generateMockProducts };
