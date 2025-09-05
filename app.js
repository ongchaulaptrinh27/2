// Đăng ký
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUser").value;
    const password = document.getElementById("regPass").value;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    alert(data.message || data.error);
    if (data.message) window.location.href = "login.html";
  });
}

// Đăng nhập
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else if (data.role === "user") {
      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
  });
}

// Admin: load dữ liệu
const addForm = document.getElementById("addProductForm");
const productList = document.getElementById("productList");
const userList = document.getElementById("userList");

if (addForm) {
  loadProducts();
  loadUsers();

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("productName").value;

    const res = await fetch("/api/admin/add-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const data = await res.json();
    alert(data.message || data.error);
    loadProducts();
  });
}

async function loadProducts() {
  const res = await fetch("/api/products");
  const products = await res.json();
  productList.innerHTML = "";
  products.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.name;
    const btn = document.createElement("button");
    btn.textContent = "Xóa";
    btn.onclick = async () => {
      await fetch("/api/admin/delete-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id })
      });
      loadProducts();
    };
    li.appendChild(btn);
    productList.appendChild(li);
  });
}

async function loadUsers() {
  const res = await fetch("/api/admin/users");
  const users = await res.json();
  userList.innerHTML = "";
  users.forEach(u => {
    const li = document.createElement("li");
    li.textContent = `${u.username} - ${u.active ? "Hoạt động" : "Đình chỉ"}`;
    const btn = document.createElement("button");
    btn.textContent = u.active ? "Đình chỉ" : "Mở khóa";
    btn.onclick = async () => {
      await fetch("/api/admin/toggle-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u.username })
      });
      loadUsers();
    };
    li.appendChild(btn);
    userList.appendChild(li);
  });
  let currentUser = null;

// Mở popup
document.getElementById("openLogin").onclick = () => {
  document.getElementById("loginModal").style.display = "flex";
};
document.getElementById("openRegister").onclick = () => {
  document.getElementById("registerModal").style.display = "flex";
};
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

// Đăng ký
const regForm = document.getElementById("registerForm");
if (regForm) {
  regForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("regUser").value;
    const password = document.getElementById("regPass").value;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    alert(data.message || data.error);
    if (data.message) {
      closeModal("registerModal");
    }
  });
}

// Đăng nhập
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else if (data.role === "user") {
      currentUser = username;
      document.getElementById("userStatus").textContent = `Xin chào, ${username}`;
      alert("Đăng nhập thành công!");
      closeModal("loginModal");
    } else {
      alert(data.error);
    }
  });
}

// Kiểm tra mua sản phẩm (thêm vào nút Mua sản phẩm trong index)
function buyProduct(name) {
  if (!currentUser) {
    alert("Bạn phải đăng nhập trước khi mua sản phẩm!");
    return;
  }
  alert(`Bạn (${currentUser}) đã mua sản phẩm: ${name}`);
}

}

