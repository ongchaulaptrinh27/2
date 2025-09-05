const users = require('../data/users.json');

module.exports = async (req, res) => {
    const token = req.headers.cookie?.split('token=')[1]?.split(';')[0];
    const user = users.find(u => u.token === token);
    if (!user || user.username !== 'sangdev') return res.status(403).json({ error: 'Chỉ admin truy cập được' });
    res.json(users);
};