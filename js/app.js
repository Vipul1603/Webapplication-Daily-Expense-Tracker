/* =========================
   AUTH (LOGIN / REGISTER)
========================= */

function register() {
  const name = document.getElementById("regName")?.value;
  const email = document.getElementById("regEmail")?.value;
  const password = document.getElementById("regPassword")?.value;

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  const user = { name, email, password };
  localStorage.setItem("user", JSON.stringify(user));

  alert("Registered Successfully");
  window.location.href = "index.html";
}

function login() {
  const email = document.getElementById("loginEmail")?.value;
  const password = document.getElementById("loginPassword")?.value;

  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!storedUser) {
    alert("No user found. Please register first.");
    return;
  }

  if (email === storedUser.email && password === storedUser.password) {
    alert("Login successful");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid email or password");
  }
}

/* =============================
   TRANSACTIONS
============================= */

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function openModal() {
  document.getElementById("transactionModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("transactionModal").style.display = "none";
}

function addTransaction() {
  const type = txnType.value;
  const category = txnCategory.value.trim();
  const amount = Number(txnAmount.value);
  const date = txnDate.value;

  if (!category || !amount || !date) {
    alert("Fill all fields");
    return;
  }

  transactions.push({
    id: Date.now(),
    type,
    category,
    amount,
    date
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateBudgetUsage(type, category, amount);

  closeModal();
  renderTransactions();
  renderBudgets();
}

function renderTransactions(filterText = "", filterDate = "") {
  const table = document.getElementById("transactionTable");
  if (!table) return;

  table.innerHTML = "";

  transactions
    .filter(txn =>
      txn.category.toLowerCase().includes(filterText.toLowerCase()) &&
      (filterDate === "" || txn.date === filterDate)
    )
    .forEach(txn => {
      table.innerHTML += `
        <tr>
          <td>📆 ${new Date(txn.date).toDateString()}</td>
          <td><span class="badge ${txn.type}">${txn.type}</span></td>
          <td>${txn.category}</td>
          <td class="${txn.type === "income" ? "pos" : "neg"}">
            ${txn.type === "income" ? "+" : "-"} ₹${txn.amount}
          </td>
          <td>
            <button class="delete-btn" onclick="deleteTransaction(${txn.id})">
              Delete
            </button>
          </td>
        </tr>
      `;
    });
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}

/* =============================
   SEARCH & DATE FILTER
============================= */

const searchInput = document.getElementById("searchInput");
const filterDateInput = document.getElementById("filterDate");
if (filterDateInput) {
  filterDateInput.addEventListener("change", () => {
    renderTransactions(
      searchInput ? searchInput.value : "",
      filterDateInput.value
    );
  });
}


if (searchInput) {
  searchInput.addEventListener("input", () => {
    renderTransactions(searchInput.value, filterDate?.value || "");
  });
}

if (filterDate) {
  filterDate.addEventListener("change", () => {
    renderTransactions(searchInput?.value || "", filterDate.value);
  });
}

/* =============================
   BUDGET MODULE
============================= */

let budgets = JSON.parse(localStorage.getItem("budgets")) || [];

function setBudget() {
  const category = budgetCategory.value.trim();
  const amount = Number(budgetAmount.value);

  if (!category || !amount) {
    alert("Fill all fields");
    return;
  }

  const existing = budgets.find(b => b.category === category);

  if (existing) {
    existing.amount = amount;
  } else {
    budgets.push({ category, amount, used: 0 });
  }

  localStorage.setItem("budgets", JSON.stringify(budgets));
  renderBudgets();

  budgetCategory.value = "";
  budgetAmount.value = "";
}

function updateBudgetUsage(type, category, amount) {
  if (type !== "expense") return;

  const budget = budgets.find(b => b.category === category);
  if (budget) {
    budget.used += amount;
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }
}

function getCategoryIcon(category) {
  category = category.toLowerCase();
  if (category.includes("food")) return "🍔";
  if (category.includes("shopping")) return "🛍️";
  if (category.includes("travel")) return "✈️";
  if (category.includes("rent")) return "🏠";
  if (category.includes("education")) return "📚";
  if (category.includes("gym")) return "🏋️";
  return "💰";
}

function renderBudgets() {
  const container = document.getElementById("budgetCards");
  if (!container) return;

  container.innerHTML = "";

  budgets.forEach((b, index) => {
    const percent = Math.min((b.used / b.amount) * 100, 100);

    container.innerHTML += `
      <div class="budget-card">
        <div class="budget-icon">${getCategoryIcon(b.category)}</div>
        <h4>${b.category}</h4>
        <p>Limit: ₹${b.amount}</p>

        <div class="progress">
          <div class="progress-bar ${
            percent > 80 ? "danger" :
            percent > 60 ? "warning" : "safe"
          }" style="width:${percent}%"></div>
        </div>

        <span class="used-text">Used ${Math.round(percent)}%</span>

        <button class="delete-btn" onclick="deleteBudget(${index})">
          Delete
        </button>
      </div>
    `;
  });
}

function deleteBudget(index) {
  budgets.splice(index, 1);
  localStorage.setItem("budgets", JSON.stringify(budgets));
  renderBudgets();
}

/* =============================
   INIT
============================= */

const txnDateInput = document.getElementById("txnDate");
if (txnDateInput) {
  txnDateInput.valueAsDate = new Date();
}

renderTransactions();
renderBudgets();

