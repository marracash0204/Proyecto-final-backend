export class UserProfileDTO {
  static createFromModel(user) {
    return new UserProfileDTO({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      age: user.age,
      rol: user.rol,
      cart: user.cart,
    });
  }

  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.age = data.age;
    this.rol = data.rol;
    this.cart = data.cart;
  }
}
