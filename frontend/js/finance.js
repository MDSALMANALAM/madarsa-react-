async function loadCashbook() {
  const res = await fetch('/api/finance/cashbook');
  const data = await res.json();

  const income = data.today_income || 0;
  const expense = data.today_expense || 0;
  const balance = income - expense;

  document.getElementById('todayIncome').innerText = `₹ ${income}`;
  document.getElementById('todayExpense').innerText = `₹ ${expense}`;
  document.getElementById('balance').innerText = `₹ ${balance}`;
}

async function addFee() {
  const student_id = document.getElementById('studentId').value;
  const amount = document.getElementById('feeAmount').value;
  const month = document.getElementById('feeMonth').value;

  await fetch('/api/finance/fee', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ student_id, amount, month })
  });

  loadCashbook();
}

async function addExpense() {
  const title = document.getElementById('expTitle').value;
  const amount = document.getElementById('expAmount').value;

  await fetch('/api/finance/expense', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ title, amount })
  });

  loadCashbook();
}

loadCashbook();

