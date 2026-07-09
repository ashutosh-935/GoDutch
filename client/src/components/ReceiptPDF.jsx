/**
 * printReceiptAsPDF
 * Opens a print-focused popup window containing the member's receipt
 * and triggers the browser's native Save as PDF dialog.
 * No external dependencies required.
 */
export function printReceiptAsPDF({ member, members, expenses, transactions, groupName, groupId, currentDate }) {
  const getMemberName = (id) => members.find(m => m._id === id)?.name || '?';

  const paidExpenses = expenses.filter(e => e.paidBy === member._id);
  const totalPaid    = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOwed    = expenses
    .filter(e => e.participants.includes(member._id))
    .reduce((sum, e) => sum + e.amount / e.participants.length, 0);
  const netBalance   = totalPaid - totalOwed;

  const toCollect = transactions.filter(t => t.to === member._id);
  const toPay     = transactions.filter(t => t.from === member._id);

  const paidRows = paidExpenses
    .map(e => `<tr><td>${e.description}</td><td class="amount">₹${e.amount.toFixed(2)}</td></tr>`)
    .join('');

  const settlementRows = [
    ...toCollect.map(t => `<tr><td>← ${getMemberName(t.from)} pays you</td><td class="amount">₹${t.amount}</td></tr>`),
    ...toPay.map(t => `<tr><td>→ You pay ${getMemberName(t.to)}</td><td class="amount">₹${t.amount}</td></tr>`),
  ].join('');

  const netSection = Math.abs(netBalance) < 0.01
    ? `<p class="label">STATUS</p><p class="big">ALL SETTLED</p>`
    : netBalance > 0
    ? `<p class="label">YOU RECEIVE</p><p class="big">₹${netBalance.toFixed(2)}</p>`
    : `<p class="label">YOU PAY</p><p class="big">₹${Math.abs(netBalance).toFixed(2)}</p>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>GoDutch Receipt — ${member.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{
      font-family:'IBM Plex Mono',monospace;
      background:#fff;
      display:flex;justify-content:center;
      padding:40px 20px;
    }
    .receipt{
      width:340px;
      background:#f8f4e8;
      padding:28px;
      border:1px solid #ccc;
    }
    h1{font-size:15px;text-transform:uppercase;letter-spacing:3px;text-align:center;margin-bottom:4px;}
    .center{text-align:center;}
    .label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#666;margin-top:12px;}
    .name{font-size:22px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:4px 0;}
    .meta{font-size:10px;color:#888;margin-bottom:4px;}
    hr{border:none;border-top:2px dashed #333;margin:12px 0;}
    table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:4px;}
    td{padding:2px 0;vertical-align:top;}
    td.amount{text-align:right;font-weight:600;white-space:nowrap;}
    .subtotal{border-top:1px dashed #aaa;padding-top:4px;margin-top:4px;}
    .big{font-size:32px;font-weight:600;text-align:center;margin:6px 0 12px;}
    .footer{font-size:10px;text-transform:uppercase;letter-spacing:2px;text-align:center;margin-top:12px;font-weight:600;}
    .section-label{font-size:10px;text-transform:uppercase;font-weight:600;letter-spacing:1px;margin-bottom:6px;}
    .share-row{font-size:11px;display:flex;justify-content:space-between;margin-bottom:2px;}
    @media print{
      body{padding:0;}
      .receipt{border:none;width:100%;max-width:360px;}
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      <h1>GO DUTCH</h1>
    </div>
    <hr/>
    <div class="center">
      <p class="label">RECEIPT FOR</p>
      <p class="name">${member.name}</p>
      <p class="meta">${currentDate} · #${groupId.toUpperCase()}</p>
      <p class="meta">Group: ${groupName}</p>
    </div>
    <hr/>
    ${paidExpenses.length > 0 ? `
    <p class="section-label">PAID BY YOU</p>
    <table>
      ${paidRows}
      <tr class="subtotal">
        <td>Subtotal</td><td class="amount">₹${totalPaid.toFixed(2)}</td>
      </tr>
    </table>
    <hr/>` : ''}
    <div class="share-row">
      <span>YOUR SHARE OF ALL EXPENSES</span>
      <span><strong>₹${totalOwed.toFixed(2)}</strong></span>
    </div>
    <hr/>
    <div class="center">
      ${netSection}
    </div>
    <hr/>
    <p class="section-label">SETTLEMENTS</p>
    ${(toCollect.length === 0 && toPay.length === 0)
      ? '<p style="font-size:11px;color:#888;font-style:italic;">Nothing to settle.</p>'
      : `<table>${settlementRows}</table>`
    }
    <hr/>
    <p class="footer">THANK YOU FOR GOING DUTCH</p>
  </div>
  <script>
    window.onload = function(){ window.print(); };
  </script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=500,height=700');
  win.document.write(html);
  win.document.close();
}
