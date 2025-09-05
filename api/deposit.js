const { v4: uuidv4 } = require('uuid');
const deposits = require('../data/deposits.json');

module.exports = async (req, res) => {
    const token = req.headers.cookie?.split('token=')[1]?.split(';')[0];
    const users = require('../data/users.json');
    const user = users.find(u => u.token === token);
    if (!user) return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Số tiền không hợp lệ' });
    // Lưu ý: Không thể ghi file trên Vercel, chỉ giả lập
    deposits.push({ id: uuidv4(), userId: user.id, username: user.username, amount, status: 'pending', createdAt: new Date() });
    res.json({ message: 'Yêu cầu nạp tiền đã gửi, chờ admin duyệt' });
};