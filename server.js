const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '.')));

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const USERS_FILE = path.join(__dirname, 'users.json');
const DEPOSITS_FILE = path.join(__dirname, 'deposits.json');

// Load data
let products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8') || '[]');
let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
let deposits = JSON.parse(fs.readFileSync(DEPOSITS_FILE, 'utf8') || '[]');

// Tạo tài khoản admin mặc định nếu chưa có
if (!users.find(u => u.username === 'sangdev')) {
    const hashedPassword = bcrypt.hashSync('sang201127', 10);
    users.push({
        id: uuidv4(),
        username: 'sangdev',
        password: hashedPassword,
        balance: 0,
        role: 'admin',
        token: ''
    });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
}

// Middleware kiểm tra auth
function auth(req, res, next) {
    const token = req.cookies.token;
    const user = users.find(u => u.token === token);
    if (!user) return res.status(401).json({ error: 'Vui lòng đăng nhập' });
    req.user = user;
    next();
}

// Middleware kiểm tra admin
function adminAuth(req, res, next) {
    if (req.user.username !== 'sangdev') return res.status(403).json({ error: 'Chỉ admin truy cập được' });
    next();
}

// Route trang chính
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// API lấy sản phẩm
app.get('/api/products', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || 'all';
    let filtered = category === 'all' ? products : products.filter(p => p.category.includes(category));
    filtered.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.id - a.id);
    const start = (page - 1) * 6;
    const paginated = filtered.slice(start, start + 6);
    res.json({ products: paginated, totalPages: Math.ceil(filtered.length / 6) });
});

// Đăng ký
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Thiếu thông tin' });
    if (users.find(u => u.username === username)) return res.status(400).json({ error: 'Tài khoản đã tồn tại' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), username, password: hashedPassword, balance: 0, role: 'user', token: '' };
    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
    res.json({ message: 'Đăng ký thành công, vui lòng đăng nhập' });
});

// Đăng nhập
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Thiếu thông tin' });
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu sai' });
    }
    const token = uuidv4();
    user.token = token;
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
    res.cookie('token', token, { httpOnly: true });
    res.json({ message: 'Đăng nhập thành công', role: user.role });
});

// Admin: Lấy sản phẩm
app.get('/admin/products', auth, adminAuth, (req, res) => res.json(products));

// Admin: Thêm sản phẩm
app.post('/admin/products', auth, adminAuth, (req, res) => {
    const { title, imageUrl, fileUrl, demoUrl, price } = req.body;
    if (!title || !imageUrl || !fileUrl || !demoUrl || !price) {
        return res.status(400).json({ error: 'Thiếu thông tin sản phẩm' });
    }
    const newProduct = {
        id: products.length + 1,
        title,
        description: '',
        detailedDescription: '',
        price,
        demoUrl,
        fileUrl,
        imageUrl,
        category: ['all'],
        features: [],
        rating: 4.0,
        downloads: 0,
        pinned: false
    };
    products.push(newProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products));
    res.json(newProduct);
});

// Admin: Xóa sản phẩm
app.delete('/admin/products/:id', auth, adminAuth, (req, res) => {
    products = products.filter(p => p.id !== parseInt(req.params.id));
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products));
    res.json({ message: 'Xóa sản phẩm thành công' });
});

// Admin: Lấy danh sách tài khoản
app.get('/admin/users', auth, adminAuth, (req, res) => res.json(users));

// User: Yêu cầu nạp tiền
app.post('/deposit', auth, (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Số tiền không hợp lệ' });
    deposits.push({ id: uuidv4(), userId: req.user.id, username: req.user.username, amount, status: 'pending', createdAt: new Date() });
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits));
    res.json({ message: 'Yêu cầu nạp tiền đã gửi, chờ admin duyệt' });
});

// User: Lấy lịch sử nạp tiền
app.get('/deposit/history', auth, (req, res) => {
    const userDeposits = deposits.filter(d => d.userId === req.user.id);
    res.json(userDeposits);
});

// Admin: Lấy danh sách yêu cầu nạp tiền
app.get('/admin/deposits', auth, adminAuth, (req, res) => res.json(deposits));

// Admin: Duyệt yêu cầu nạp tiền
app.post('/admin/deposits/:id/approve', auth, adminAuth, (req, res) => {
    const deposit = deposits.find(d => d.id === req.params.id);
    if (!deposit || deposit.status !== 'pending') return res.status(400).json({ error: 'Yêu cầu không hợp lệ' });
    deposit.status = 'approved';
    const user = users.find(u => u.id === deposit.userId);
    user.balance += deposit.amount;
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits));
    fs.writeFileSync(USERS_FILE, JSON.stringify(users));
    res.json({ message: 'Duyệt yêu cầu thành công' });
});

// Admin: Từ chối yêu cầu nạp tiền
app.post('/admin/deposits/:id/reject', auth, adminAuth, (req, res) => {
    const deposit = deposits.find(d => d.id === req.params.id);
    if (!deposit || deposit.status !== 'pending') return res.status(400).json({ error: 'Yêu cầu không hợp lệ' });
    deposit.status = 'rejected';
    fs.writeFileSync(DEPOSITS_FILE, JSON.stringify(deposits));
    res.json({ message: 'Từ chối yêu cầu thành công' });
});

app.listen(3000, () => console.log('Server running on port 3000'));