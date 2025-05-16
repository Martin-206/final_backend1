const socket = io();

const productList = document.getElementById("productList");
const addForm = document.getElementById("addForm");
const deleteForm = document.getElementById("deleteForm");

socket.on("products", (products) => {
    productList.innerHTML = "";
    products.forEach(p => {
        productList.innerHTML += `<li>${p.title} - $${p.price} (ID: ${p.id})</li>`;
    });
});

addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(addForm);
    const product = Object.fromEntries(formData);
    product.price = parseFloat(product.price);
    product.stock = parseInt(product.stock);
    socket.emit("addProduct", product);
    addForm.reset();
});

deleteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = deleteForm.elements["id"].value;
    socket.emit("deleteProduct", parseInt(id));
    deleteForm.reset();
});
