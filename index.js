const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalAmountElement = document.getElementById("total-amount");
let totalAmountSpentPerDate = {};
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

if (expenses.length > 0) {
    expenses.forEach(expense => {
        if (!expense.date) {
            expense.date = new Date();
        } else if (typeof expense.date === 'string') {
            expense.date = new Date(expense.date);
        }
    });
}

window.addEventListener("load", function () {
    document.getElementById("expense-amount").focus();
    scrollToLatestExpense();
});

function renderExpenses() {
    expenseList.innerHTML = "";
    let totalAmount = 0.0;

    console.log("Expenses array:", expenses);

    for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const expenseRow = document.createElement("li");
        expenseRow.innerHTML = `
      <span>${expense.name ? expense.name : ''}</span>
      <span>₹${expense.amount.toFixed(2)}</span>
      <span>${formatDate(expense.date)}</span>
      <span>${formatTime(expense.date)}</span>
      <span class="delete-btn" data-id="${i}">Delete</span>
    `;
        expenseList.appendChild(expenseRow);
        totalAmount += parseFloat(expense.amount);

        const date = expense.date.toLocaleDateString();
        if (!totalAmountSpentPerDate[date]) {
            totalAmountSpentPerDate[date] = 0;
        }
        totalAmountSpentPerDate[date] += parseFloat(expense.amount);
    }


    animateTotalAmount(parseFloat(totalAmountElement.textContent.replace(/[^0-9\.]+/g, '')), totalAmount);

    localStorage.setItem("expenses", JSON.stringify(expenses));
    scrollToLatestExpense();
    renderCalendar();
}

function formatDate(date) {
    const [month, day, year] = date.toLocaleDateString().split('/');
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const ordinal = getOrdinal(day);

    return `${ordinal} ${months[month - 1]} ${year}`;
}

function formatTime(date) {

    const time = date.toLocaleTimeString(navigator.language, {
        hour: '2-digit',
        minute: '2-digit'
    });
    return `${time}`;
}

function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function addAmount(amount) {
    const expenseAmountInput = document.getElementById("expense-amount");
    expenseAmountInput.value = amount;
    addExpense({ preventDefault: function () { } }); // Call addExpense with the specified amount
}

function subtractAmount(amount) {
    const subexpenseAmountInput = document.getElementById("subexpense-amount");
    subexpenseAmountInput.value = amount;
    subtractExpense({ preventDefault: function () { } }); // Call subtractExpense with the specified amount
}
function addExpense(event) {
    event.preventDefault();
    const expenseNameInput = document.getElementById("expense-name");
    const expenseAmountInput = document.getElementById("expense-amount");
    const expenseName = expenseNameInput.value.trim();
    const expenseAmount = parseFloat(expenseAmountInput.value);
    if (expenseAmount) {
        let expense = { amount: parseFloat(expenseAmountInput.value), date: new Date() };
        if (expenseName) {
            expense.name = expenseName;
        }
        expenses.push(expense);
        expenseNameInput.value = "";
        expenseAmountInput.value = "";
        renderExpenses();
    }
}
function subtractExpense(event) {
    event.preventDefault();
    const expenseNameInput = document.getElementById("subexpense-name");
    const expenseAmountInput = document.getElementById("subexpense-amount");
    const expenseName = expenseNameInput.value.trim();
    const expenseAmount = parseFloat(expenseAmountInput.value);
    if (expenseAmount) {
        let expense = { amount: -expenseAmount, date: new Date() }; // Subtract the expense amount
        if (expenseName) {
            expense.name = expenseName;
        }
        expenses.push(expense);
        expenseNameInput.value = "";
        expenseAmountInput.value = "";
        renderExpenses();
    }
}
function deleteExpense(event) {
    if (event.target.classList.contains("delete-btn")) {
        const id = event.target.getAttribute("data-id");
        expenses.splice(id, 1);
        renderExpenses();
        document.getElementById("expense-amount").focus();
    }
}

// function savedata() {
//     // Save data to JSON file
//     let data = JSON.stringify(expenses, null, 2);
//     let blob = new Blob([data], { type: 'text/plain' });
//     let url = URL.createObjectURL(blob);
//     let a = document.createElement('a');
//     a.href = url;
//     a.download = 'expenses_data.json';
//     document.body.appendChild(a);
//     a.click();
//     URL.revokeObjectURL(url);

//     scrollToLatestExpense();
// }

// ... (rest of the code remains the same)

// Add a button to trigger the backup function
const backupButton = document.getElementById("backup-button");
backupButton.addEventListener("click", backupExpenses);

// Add a button to trigger the restore function
const restoreButton = document.getElementById("restore-button");
restoreButton.addEventListener("click", restoreExpenses);

function backupExpenses() {
    let data = JSON.stringify(expenses, null, 2);
    let blob = new Blob([data], { type: 'text/plain' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'expenses_backup.json';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    alert("Expenses backed up successfully!");
}

function restoreExpenses() {
    const fileInput = document.getElementById("restore-file-input");
    fileInput.click();
    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = function () {
            const data = JSON.parse(reader.result);
            data.forEach(restoreItem => {
                const expense = {
                    description: restoreItem.description,
                    amount: restoreItem.amount,
                    date: new Date(restoreItem.date),
                    formattedDate: formatDate(new Date(restoreItem.date))
                };
                expenses.push(expense);
            });
            localStorage.setItem("expenses", JSON.stringify(expenses));
            renderExpenses();
            alert("Expenses restored successfully!");
        };
        reader.readAsText(file);
    });
}

// Add an input field to select the backup file for restore
const restoreFileInput = document.getElementById("restore-file-input");
restoreFileInput.type = "file";
restoreFileInput.accept = ".json";


function animateTotalAmount(oldValue, newValue) {
    let currentValue = oldValue;
    const difference = Math.abs(newValue - oldValue);
    const intervalTime = 2000; // adjust interval time to make the animation slower
    const tolerance = 0.01; // small tolerance value

    let startTime = performance.now();
    let startValue = oldValue;

    const easeInOutQuad = (t) => {
        return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
    };

    const animate = () => {
        const currentTime = performance.now();
        const progress = (currentTime - startTime) / intervalTime;
        currentValue = startValue + (newValue - startValue) * easeInOutQuad(progress);

        if (progress < 1) {
            totalAmountElement.textContent = `Total Amount: ₹${currentValue.toFixed(2)}`; // Update this line to use toFixed(2) for 2 decimal places
            requestAnimationFrame(animate);
        } else {
            totalAmountElement.textContent = `Total Amount: ₹${newValue.toFixed(2)}`; // Update this line to use toFixed(2) for 2 decimal places
        }
    };

    animate();
}


function renderCalendar(year = new Date().getFullYear()) {
    const calendarContainer = document.getElementById("calendar-container");
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let calendarHtml = `
    <div class="calendar-header">
     <div class="calendar-header" style="display: flex; flex-direction: row; align-items: center;gap:120px;">
      <button class="prev-year-btn" onclick="renderCalendar(${year - 1})">&#10094;</button>
    <h2>${year}</h2>
  <button class="next-year-btn" onclick="renderCalendar(${year + 1})">&#10095;</button>
   </div>
    </div>
    <div class="calendar-grid">
  `;

    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const transactions = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === year && expenseDate.getMonth() === i;
        });

        const totalAmount = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

        calendarHtml += `
      <div class="calendar-cell">
        <h3>${month}</h3>
        <p>Total Amount: </br> ₹${totalAmount.toFixed(2)}</p>
      </div>
    `;
    }

    calendarHtml += '</div>';
    calendarContainer.innerHTML = calendarHtml;
    let currentYear = new Date().getFullYear();

    const nextYearBtn = document.querySelector(".next-year-btn");
    if (nextYearBtn) {
        if (year === currentYear) {
            nextYearBtn.disabled = true;

        } else {
            nextYearBtn.disabled = false;
        }
    }
}




renderCalendar();



function scrollToLatestExpense() {
    const expenseList = document.getElementById("expense-list");
    if (expenseList.children.length > 0) {
        const latestExpense = expenseList.lastChild;
        const horizontalContainer = document.querySelector('.horizontal-scroll-container');
        horizontalContainer.scrollTop = 0; // Reset vertical scroll
        horizontalContainer.scrollLeft = horizontalContainer.scrollWidth - horizontalContainer.offsetWidth; // Scroll to end of list
        horizontalContainer.scrollLeft = latestExpense.offsetLeft - (horizontalContainer.offsetWidth / 2) + (latestExpense.offsetWidth / 2); // Center latest expense
    }
}

renderExpenses();
expenseForm.addEventListener("submit", addExpense);
expenseList.addEventListener("click", deleteExpense);
const subtractExpenseForm = document.getElementById("subtract-expense-form");
subtractExpenseForm.addEventListener("submit", subtractExpense);
