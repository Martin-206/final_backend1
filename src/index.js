import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import ProductManager from "./controllers/productManager.js";
import viewsRouter from './routes/views.router.js'; 

import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://martinmcontreras:zx09DSYMUastkQUG@proyectocoder.krlc8hx.mongodb.net/?retryWrites=true&w=majority&appName=ProyectoCoder')
    .then(() => console.log(' Conectado a MongoDB'))
    .catch(err => console.error(' Error al conectar a MongoDB:', err));

// Ruta absoluta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express y servidor HTTP
const app = express();
const httpServer = createServer(app);

// Socket.io
const io = new Server(httpServer);

// Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Archivos públicos (CSS, JS del cliente)
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', viewsRouter);

// Rutas API
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Ruta para la vista home.handlebars
const productManager = new ProductManager();

app.get("/", async (req, res) => {
    const products = await productManager.getProducts();
    res.render("home", { products });
});

// Ruta para la vista con WebSocket
app.get("/realtimeproducts", async (req, res) => {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
});

// WebSocket en tiempo real
io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado");

    socket.emit("products", await productManager.getProducts());

    socket.on("addProduct", async (data) => {
        await productManager.addProduct(data);
        const updatedProducts = await productManager.getProducts();
        io.emit("products", updatedProducts);
    });

    socket.on("deleteProduct", async (id) => {
        await productManager.deleteProduct(id);
        const updatedProducts = await productManager.getProducts();
        io.emit("products", updatedProducts);
    });
});

// Levantar servidor
const PORT = 3005;
httpServer.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
