const deposits = require('../data/deposits.json');

module.exports = async (req, res) => {
    const token = req.headers.cookie?.split('token=')[1]?.split(';')[0];
    const users = require('../data/users.json');
    const user = users.find(u => u.token === token);
    if (!user || user.username !== 'sangdev') return res.status(403).json({ error: 'Chỉ admin truy cập được' });

    if (req.method === 'GET') {
        res.json(deposits);
    } else if (req.method === 'POST') {
        const id = req.query.id;
        const action = req.query.action; // approve or reject
        // Lưu ý: Không thể ghi file trên Vercel
        res.json({ message: `${action === 'approve' ? 'Duyệt' : 'Từ chối'} yêu cầu thành công (giả lập)` });
    }
};