// Pending debts logic
const form = document.getElementById('pending-form');
const tbody = document.getElementById('pending-tbody');
let records = JSON.parse(localStorage.getItem('pendingDebts') || '[]');

function renderTable() {
  tbody.innerHTML = '';
  if (records.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#aaa;">No records yet.</td></tr>';
    return;
  }
  records.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.person}</td>
      <td>₹${parseFloat(r.amount).toFixed(2)}</td>
      <td>${r.due}</td>
      <td>${r.reason}</td>
      <td class="status-${r.status.toLowerCase()}">
        <select class="status-select" data-index="${i}" style="padding:0.3rem 0.7rem;border-radius:6px;font-weight:700;">
          <option value="Pending"${r.status === 'Pending' ? ' selected' : ''}>Pending</option>
          <option value="Paid"${r.status === 'Paid' ? ' selected' : ''}>Paid</option>
        </select>
      </td>
      <td class="notes">${r.notes ? r.notes : ''}</td>
      <td><button class="delete-row-btn" data-index="${i}" style="background:var(--destructive,#dc2626);color:#fff;border:none;border-radius:6px;padding:0.4rem 0.8rem;cursor:pointer;font-weight:600;">Delete</button></td>
    `;
    tbody.appendChild(tr);
  });
  // Add event listeners for delete buttons
  tbody.querySelectorAll('.delete-row-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-index'));
      records.splice(idx, 1);
      localStorage.setItem('pendingDebts', JSON.stringify(records));
      renderTable();
    });
  });
  // Add event listeners for status dropdowns
  tbody.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', function() {
      const idx = parseInt(this.getAttribute('data-index'));
      records[idx].status = this.value;
      localStorage.setItem('pendingDebts', JSON.stringify(records));
      renderTable();
    });
  });
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const record = {
    person: form.person.value.trim(),
    amount: form.amount.value,
    due: form.due.value,
    reason: form.reason.value.trim(),
    status: form.status.value,
    notes: form.notes.value.trim()
  };
  records.push(record);
  localStorage.setItem('pendingDebts', JSON.stringify(records));
  renderTable();
  form.reset();
});

renderTable();
