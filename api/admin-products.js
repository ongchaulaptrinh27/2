const products = require('../data/products.json');

module.exports = async (req, res) => {
    const token = req.headers.cookie?.split('token=')[1]?.split(';')[0];
    const users = require('../data/users.json');
    const user = users.find(u => u.token === token);
    if (!user || user.username !== 'sangdev') return res.status(403).json({ error: 'Chỉ admin truy cập được' });

    if (req.method === 'GET') {
        res.json(products);
    } else if (req.method === 'POST') {
        const { title, imageUrl, fileUrl, demoUrl, price } = req.body;
        if (!title || !imageUrl || !fileUrl || !demoUrl || !price) {
            return res.status(400).json({ error: 'Thiếu thông tin sản phẩm' });
        }
        // Lưu ý: Không thể ghi file trên Vercel
        res.json({ message: 'Thêm sản phẩm thành công (giả lập)' });
    } else if (req.method === 'DELETE') {
        const id = parseInt(req.query.id);
        // Lưu ý: Không thể ghi file trên Vercel
        res.json({ message: 'Xóa sản phẩm thành công (giả lập)' });
    }
};