import { promises as fs } from "fs";

class ProductManager {
    constructor() {
        this.path = "./src/models/products.json";
    }

    // Leer productos
    readProducts = async () => {
        try {
            let products = await fs.readFile(this.path, "utf-8");
            return products ? JSON.parse(products) : [];
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            } else {
                throw error;
            }
        }
    };

    // Guardar productos
    writeProducts = async (products) => {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    };

    // Genera un ID único automáticamente
    generateId = async () => {
        const products = await this.readProducts();
        if (products.length === 0) {
            return 1;
        } else {
            return products[products.length - 1].id + 1;
        }
    };

    // lee todos los productos
    getProducts = async () => {
        return await this.readProducts();
    };

    // Agrega un producto nuevo
    addProduct = async (productData) => {
        const products = await this.readProducts();

        // Validación: Todos los campos obligatorios
        const { title, description, code, price, status = true, stock, category, thumbnails = [] } = productData;
        if (!title || !description || !code || !price || stock == null || !category) {
            return "Faltan campos obligatorios";
        }

        // Validar que el code no esté repetido
        const codeExists = products.some(prod => prod.code === code);
        if (codeExists) {
            return "El código del producto ya exste";
        }

        const newProduct = {
            id: await this.generateId(),
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        products.push(newProduct);
        await this.writeProducts(products);
        return "Producto agregado con éxito";
    };

    // Trae producto por ID
    getProductById = async (id) => {
        const products = await this.readProducts();
        const product = products.find(prod => prod.id == id);
        return product || null;
    };

    // Actualiza un producto
    updateProduct = async (id, updateData) => {
        const products = await this.readProducts();
        const index = products.findIndex(prod => prod.id == id);

        if (index === -1) {
            return "Producto no encontrado";
        }

        // No se puede actualizar el id
        if (updateData.id) {
            delete updateData.id;
        }

        products[index] = { ...products[index], ...updateData };
        await this.writeProducts(products);
        return "Producto actualizado con éxito";
    };

    // Elimina un producto
    deleteProduct = async (id) => {
        const products = await this.readProducts();
        const newProducts = products.filter(prod => prod.id != id);

        if (products.length === newProducts.length) {
            return "Producto no encontrado";
        }

        await this.writeProducts(newProducts);
        return "Producto eliminado con éxito";
    };
}

export default ProductManager;
