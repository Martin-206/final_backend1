import { promises as fs } from "fs";

class CartManager {
    constructor() {
        this.path = "./src/models/carts.json";
    }

    // Leer carritos
    readCarts = async () => {
        try {
            let carts = await fs.readFile(this.path, "utf-8");
            return carts ? JSON.parse(carts) : [];
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            } else {
                throw error;
            }
        }
    };

    // Guardar carritos
    writeCarts = async (carts) => {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    };

    // Generar ID automático
    generateId = async () => {
        const carts = await this.readCarts();
        if (carts.length === 0) {
            return 1;
        } else {
            return carts[carts.length - 1].id + 1;
        }
    };

    // Crear un carrito nuevo
    createCart = async () => {
        const carts = await this.readCarts();
        const newCart = {
            id: await this.generateId(),
            products: []
        };
        carts.push(newCart);
        await this.writeCarts(carts);
        return newCart;
    };

    // Obtener productos de un carrito
    getCartProducts = async (cid) => {
        const carts = await this.readCarts();
        const cart = carts.find(cart => cart.id == cid);
        return cart ? cart.products : [];
    };

    // Agregar un producto a un carrito
    addProductToCart = async (cid, pid) => {
        const carts = await this.readCarts();
        const cartIndex = carts.findIndex(cart => cart.id == cid);

        if (cartIndex === -1) {
            return "Carrito no encontrado";
        }

        const productIndex = carts[cartIndex].products.findIndex(p => p.product === pid);

        if (productIndex !== -1) {
            carts[cartIndex].products[productIndex].quantity++;
        } else {
            carts[cartIndex].products.push({ product: pid, quantity: 1 });
        }

        await this.writeCarts(carts);
        return carts[cartIndex];
    };
}

export default CartManager;
