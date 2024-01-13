const socket = io();

console.log("El archivo index.js se ha cargado correctamente.");

const addProductForm = document.getElementById("add-product-form");
addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const productTitle = document.getElementById("product-title").value;
  const productPrice = document.getElementById("product-price").value;
  const productDescription = document.getElementById(
    "product-description"
  ).value;
  const productCode = document.getElementById("product-code").value;
  const productStock = document.getElementById("product-stock").value;

  socket.emit("addProduct", {
    title: productTitle,
    price: productPrice,
    description: productDescription,
    code: productCode,
    stock: productStock,
  });

  document.getElementById("product-title").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-description").value = "";
  document.getElementById("product-code").value = "";
  document.getElementById("product-stock").value = "";
});

const deleteProductForm = document.getElementById("delete-product-form");
deleteProductForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const idProduct = document.getElementById("id-remove-prod").value;
  socket.emit("productDeleted", idProduct);
  document.getElementById("id-remove-prod").value = "";
});

socket.on("productosActualizados", (productosActualizados) => {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";
  productosActualizados.forEach((product) => {
    const listItem = document.createElement("li");
    listItem.textContent = `ID: ${product._id}, Title: ${product.title}, Price: ${product.price}, Description: ${product.description}, Code: ${product.code}, Stock: ${product.stock}`;
    productList.appendChild(listItem);
  });
});
