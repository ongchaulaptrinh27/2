const deposits = require('../data/deposits.json');

module.exports = async (req, res) => {
    const token = req.headers.cookie?.split('token=')[1]?.split(';')[0];
    const users = require('../data/users.json');
    const user = users.find(u => u.token === token);
    if (!user) return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    const userDeposits = deposits.filter(d => d.userId === user.id);
    res.json(userDeposits);
};