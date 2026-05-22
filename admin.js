import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* FIREBASE */

const firebaseConfig = {

  apiKey: "AIzaSyAxVYWpqPAbWz1nt41-K7BsdLilJHN8h-g",

  authDomain: "memora-moments.firebaseapp.com",

  projectId: "memora-moments",

  storageBucket: "memora-moments.firebasestorage.app",

  messagingSenderId: "718939691175",

  appId: "1:718939691175:web:d19bfe9adc04bfcba5e382",

  measurementId: "G-YVK68DRQ0C"

};

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

/* PRODUCTS */

const products = {

  "4x6": {
    cost: 35,
    selling: 200
  },

  "6x8": {
    cost: 50,
    selling: 250
  },

  "6x9": {
    cost: 50,
    selling: 250
  },

  "8x12": {
    cost: 70,
    selling: 300
  },

  "10x15": {
    cost: 110,
    selling: 350
  },

  "12x18": {
    cost: 125,
    selling: 400
  },

  "Polaroid": {
    cost: 20,
    selling: 150
  },

  "Mug": {
    cost: 250,
    selling: 400
  }

};

const PRINT_COST = 20;

const PACKING_COST = 15;

/* ELEMENTS */

const addItemBtn =
  document.getElementById("addItemBtn");

const createOrderBtn =
  document.getElementById("createOrderBtn");

const itemsPreview =
  document.getElementById("itemsPreview");

const grandTotal =
  document.getElementById("grandTotal");

const remainingAmount =
  document.getElementById("remainingAmount");

const ordersTable =
  document.getElementById("ordersTable");

const totalOrders =
  document.getElementById("totalOrders");

const totalRevenue =
  document.getElementById("totalRevenue");

const totalProfit =
  document.getElementById("totalProfit");

const pendingOrders =
  document.getElementById("pendingOrders");

const deliveredOrders =
  document.getElementById("deliveredOrders");

const exportBtn =
  document.getElementById("exportBtn");

/* DATA */

let currentItems = [];

let orders = [];

/* ADD ITEM */

addItemBtn.addEventListener("click", () => {

  const product =
    document.getElementById("product").value;

  const quantity =
    Number(
      document.getElementById("quantity").value
    );

  if(quantity <= 0){

    alert("Enter valid quantity");

    return;

  }

  const item =
    products[product];

  const total =
    item.selling * quantity;

  currentItems.push({

    product,

    quantity,

    total

  });

  renderItems();

  document.getElementById("quantity").value = "";

});

/* RENDER ITEMS */

function renderItems(){

  itemsPreview.innerHTML = "";

  let totalAmount = 0;

  currentItems.forEach((item, index) => {

    totalAmount += item.total;

    const div =
      document.createElement("div");

    div.classList.add("preview-item");

    div.innerHTML = `

      <div>

        ${item.product}
        ×
        ${item.quantity}

      </div>

      <div>

        Rs. ${item.total}

      </div>

    `;

    itemsPreview.appendChild(div);

  });

  const discount =
    Number(
      document.getElementById("discount").value
    ) || 0;

  const advance =
    Number(
      document.getElementById("advance").value
    ) || 0;

  totalAmount =
    totalAmount - discount;

  grandTotal.innerText =
    `Rs. ${totalAmount}`;

  remainingAmount.innerText =
    `Rs. ${totalAmount - advance}`;

}

/* CREATE ORDER */

createOrderBtn.addEventListener("click", async () => {

  const customerName =
    document.getElementById("customerName").value;

  const customerNumber =
    document.getElementById("customerNumber").value;

  const discount =
    Number(
      document.getElementById("discount").value
    ) || 0;

  const advance =
    Number(
      document.getElementById("advance").value
    ) || 0;

  const status =
    document.getElementById("status").value;

  if(
    customerName === "" ||
    customerNumber === "" ||
    currentItems.length === 0
  ){

    alert("Fill all details");

    return;

  }

  let totalAmount = 0;

  let totalProfit = 0;

  currentItems.forEach(item => {

    const productData =
      products[item.product];

    totalAmount += item.total;

    let rawCost = 0;

    if(
      item.product !== "Polaroid" &&
      item.product !== "Mug"
    ){

      rawCost =
        (
          productData.cost +
          PRINT_COST +
          PACKING_COST
        ) * item.quantity;

    }

    else{

      rawCost =
        (
          productData.cost +
          PACKING_COST
        ) * item.quantity;

    }

    totalProfit +=
      item.total - rawCost;

  });

  totalAmount =
    totalAmount - discount;

  const remaining =
    totalAmount - advance;

  const currentDate =
    new Date().toLocaleString();

  const order = {

    customerName,

    customerNumber,

    items: [...currentItems],

    discount,

    advance,

    remaining,

    totalAmount,

    profit: totalProfit,

    status,

    date: currentDate

  };

  try{

    await addDoc(
      collection(db, "orders"),
      order
    );

    alert(
      "Combined Order Created Successfully"
    );

    currentItems = [];

    renderItems();

    document.getElementById("customerName").value = "";

    document.getElementById("customerNumber").value = "";

    document.getElementById("discount").value = "";

    document.getElementById("advance").value = "";

    loadOrders();

  }

  catch(error){

    console.log(error);

    alert("Error creating order");

  }

});

/* LOAD ORDERS */

async function loadOrders(){

  orders = [];

  ordersTable.innerHTML = "";

  const querySnapshot =
    await getDocs(
      collection(db, "orders")
    );

  querySnapshot.forEach((docSnap) => {

    orders.push({

      id: docSnap.id,

      ...docSnap.data()

    });

  });

  renderOrders();

}

/* RENDER ORDERS */

function renderOrders(){

  ordersTable.innerHTML = "";

  let revenue = 0;

  let profit = 0;

  let pending = 0;

  let delivered = 0;

  orders.forEach((order, index) => {

    revenue += order.totalAmount;

    profit += order.profit;

    if(order.status === "Pending"){

      pending++;

    }

    if(order.status === "Delivered"){

      delivered++;

    }

    let itemsHTML = "";

    order.items.forEach(item => {

      itemsHTML += `
        ${item.product} × ${item.quantity}<br>
      `;

    });

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>${order.customerName}</td>

      <td>${order.customerNumber}</td>

      <td>${itemsHTML}</td>

      <td>Rs. ${order.discount}</td>

      <td>Rs. ${order.advance}</td>

      <td>Rs. ${order.remaining}</td>

      <td>Rs. ${order.totalAmount}</td>

      <td>Rs. ${order.profit}</td>

      <td
        class="${
          order.status === "Delivered"
          ? "delivered"
          : "pending"
        } status-btn"
        data-index="${index}"
        style="cursor:pointer"
      >
        ${order.status}
      </td>

      <td>${order.date}</td>

      <td>

        <button
          class="invoice-btn"
          onclick="sendWhatsApp('${order.id}')"
        >
          WhatsApp
        </button>

      </td>

      <td>

        <button
          class="invoice-btn"
          onclick="generateInvoice('${order.id}')"
        >
          Invoice
        </button>

      </td>

      <td>

        <button
          class="delete-btn"
          onclick="deleteOrder('${order.id}')"
        >
          Delete
        </button>

      </td>

    `;

    ordersTable.appendChild(row);

  });

  document
    .querySelectorAll(".status-btn")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        const index =
          btn.dataset.index;

        toggleStatus(index);

      });

  });

  totalOrders.innerText =
    orders.length;

  totalRevenue.innerText =
    `Rs. ${revenue}`;

  totalProfit.innerText =
    `Rs. ${profit}`;

  pendingOrders.innerText =
    pending;

  deliveredOrders.innerText =
    delivered;

}

/* TOGGLE STATUS */

async function toggleStatus(index){

  const order = orders[index];

  if(order.status === "Pending"){

    order.status = "Delivered";

  }

  else{

    order.status = "Pending";

  }

  await updateDoc(
    doc(db, "orders", order.id),
    {
      status: order.status
    }
  );

  loadOrders();

}

/* DELETE */

window.deleteOrder =
async function(id){

  const confirmDelete =
    confirm("Delete this order?");

  if(!confirmDelete) return;

  await deleteDoc(
    doc(db, "orders", id)
  );

  loadOrders();

}

/* EXPORT */

exportBtn.addEventListener("click", () => {

  const exportData =
    orders.map(order => ({

      Customer:
      order.customerName,

      Phone:
      order.customerNumber,

      Items:
      order.items.map(item =>
        `${item.product} x ${item.quantity}`
      ).join(", "),

      Discount:
      order.discount,

      Advance:
      order.advance,

      Remaining:
      order.remaining,

      Amount:
      order.totalAmount,

      Profit:
      order.profit,

      Status:
      order.status,

      Date:
      order.date

    }));

  const worksheet =
    XLSX.utils.json_to_sheet(exportData);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Orders"
  );

  XLSX.writeFile(
    workbook,
    "MemoraOrders.xlsx"
  );

});

/* JPG INVOICE */

window.generateInvoice =
async function(id){

  const order =
    orders.find(order => order.id === id);

  document.getElementById(
    "invoiceCustomer"
  ).innerText =
  `Customer : ${order.customerName}`;

  document.getElementById(
    "invoicePhone"
  ).innerText =
  `Phone : ${order.customerNumber}`;

  let itemsHTML = "";

  order.items.forEach(item => {

    itemsHTML += `
      <div>
        ${item.product}
        ×
        ${item.quantity}
      </div>
    `;

  });

  document.getElementById(
    "invoiceItems"
  ).innerHTML =
  itemsHTML;

  document.getElementById(
    "invoiceAmount"
  ).innerText =
  `Rs. ${order.totalAmount}`;

  const invoice =
    document.getElementById(
      "invoiceTemplate"
    );

  const canvas =
    await html2canvas(invoice);

  const image =
    canvas.toDataURL(
      "image/jpeg",
      1.0
    );

  const link =
    document.createElement("a");

  link.href = image;

  link.download =
    `${order.customerName}-invoice.jpg`;

  link.click();

}

/* WHATSAPP */

window.sendWhatsApp = function(id){

  const order =
    orders.find(order => order.id === id);

  let itemsText = "";

  order.items.forEach(item => {

    itemsText +=
`${item.product} × ${item.quantity}
`;

  });

  const message =

`✨ MEMORA MOMENTS ✨

Turning Memories Into Moments

Customer : ${order.customerName}

Items :
${itemsText}

Final Amount : Rs. ${order.totalAmount}

Status : ${order.status}

Thank You For Choosing
Memora Moments`;

  const whatsappURL =

`https://wa.me/91${order.customerNumber}?text=${encodeURIComponent(message)}`;

  window.open(
    whatsappURL,
    "_blank"
  );

}

/* INITIAL LOAD */

loadOrders();