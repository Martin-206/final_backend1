import { Router } from 'express';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const router = Router();

// Vista con paginación de productos
router.get('/products', async (req, res) => {
  const { page = 1, limit = 5, sort, query } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    lean: true,
    sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}
  };

  const filter = query
    ? JSON.parse(`{ "${query.split('=')[0]}": "${query.split('=')[1]}" }`)
    : {};

  try {
    const result = await Product.paginate(filter, options);

    res.render('products', {
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage
    });
  } catch (err) {
    res.status(500).send('Error al cargar los productos');
  }
});

// Vista de detalle de un producto
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send("Producto no encontrado");
    res.render('productDetail', { product });
  } catch (err) {
    res.status(500).send("Error al buscar producto");
  }
});

// Vista de un carrito
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
    if (!cart) return res.status(404).send("Carrito no encontrado");
    res.render('cart', { cart });
  } catch (err) {
    res.status(500).send("Error al buscar carrito");
  }
});

export default router;
