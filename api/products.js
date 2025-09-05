const products = require('../data/products.json');

module.exports = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || 'all';
    let filtered = category === 'all' ? products : products.filter(p => p.category.includes(category));
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.id - a.id);
    const start = (page - 1) * 6;
    const paginated = filtered.slice(start, start + 6);
    res.json({ products: paginated, totalPages: Math.ceil(filtered.length / 6) });
};