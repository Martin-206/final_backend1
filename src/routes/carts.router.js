import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = Router();

// Crear carrito
router.post('/', async (req, res) => {
  const cart = new Cart({ products: [] });
  await cart.save();
  res.status(201).json(cart);
});

// Obtener carrito con populate
router.get('/:cid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid).populate('products.product');
  if (!cart) return res.status(404).send("Carrito no encontrado");
  res.json(cart);
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid);
  const product = await Product.findById(req.params.pid);
  if (!cart || !product) return res.status(404).send("Carrito o producto no existe");

  const existing = cart.products.find(p => p.product.equals(product._id));
  if (existing) {
    existing.quantity++;
  } else {
    cart.products.push({ product: product._id, quantity: 1 });
  }

  await cart.save();
  res.json(cart);
});

// PUT: actualizar cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findById(req.params.cid);
  if (!cart) return res.status(404).send("Carrito no encontrado");

  const prod = cart.products.find(p => p.product.equals(req.params.pid));
  if (!prod) return res.status(404).send("Producto no está en el carrito");

  prod.quantity = quantity;
  await cart.save();
  res.json(cart);
});

// PUT: reemplazar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  const { products } = req.body;
  const cart = await Cart.findById(req.params.cid);
  if (!cart) return res.status(404).send("Carrito no encontrado");

  cart.products = products;
  await cart.save();
  res.json(cart);
});

// DELETE: eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid);
  if (!cart) return res.status(404).send("Carrito no encontrado");

  cart.products = cart.products.filter(p => !p.product.equals(req.params.pid));
  await cart.save();
  res.json(cart);
});

// DELETE: vaciar carrito
router.delete('/:cid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid);
  if (!cart) return res.status(404).send("Carrito no encontrado");

  cart.products = [];
  await cart.save();
  res.json(cart);
});

export default router;
