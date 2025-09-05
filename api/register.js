const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const users = require('../data/users.json');

module.exports = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Thiếu thông tin' });
    if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Tài khoản đã tồn tại' });
    // Lưu ý: Không thể ghi file trên Vercel, chỉ giả lập
    res.json({ message: 'Đăng ký thành công, vui lòng đăng nhập' });
};