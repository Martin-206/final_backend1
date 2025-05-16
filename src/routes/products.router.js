import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

router.get('/', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {}
  };

  const filter = query ? JSON.parse(`{ "${query.split('=')[0]}": "${query.split('=')[1]}" }`) : {};

  try {
    const result = await Product.paginate(filter, options);

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ status: 'success', product });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});


export default router;
