import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyAxVYWpqPAbWz1nt41-K7BsdLilJHN8h-g",

  authDomain: "memora-moments.firebaseapp.com",

  projectId: "memora-moments",

  storageBucket: "memora-moments.firebasestorage.app",

  messagingSenderId: "718939691175",

  appId: "1:718939691175:web:d19bfe9adc04bfcba5e382",

  measurementId: "G-YVK68DRQ0C"

};
const exportBtn =
  document.getElementById("exportBtn");
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

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
const PACKING_COST = 10;

const addOrderBtn =
  document.getElementById("addOrderBtn");

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

let orders = [];

addOrderBtn.addEventListener("click", async () => {

  const customerName =
    document.getElementById("customerName").value;

  const product =
    document.getElementById("product").value;

  const quantity =
    Number(document.getElementById("quantity").value);

  const discount =
    Number(document.getElementById("discount").value) || 0;

  const status =
    document.getElementById("status").value;

  if(customerName === "" || quantity <= 0){

    alert("Enter valid details");

    return;

  }

  const item = products[product];

  let rawCost = 0;

  // Frames
  if(product !== "Polaroid" && product !== "Mug"){

    rawCost =
      (item.cost + PRINT_COST + PACKING_COST)
      * quantity;

  }

  // Polaroid
  else if(product === "Polaroid"){

    rawCost =
      (item.cost + PACKING_COST)
      * quantity;

  }

  // Mug
  else{

    rawCost =
      (item.cost + PACKING_COST)
      * quantity;

  }

  const originalSelling =
    item.selling * quantity;

  const selling =
    originalSelling - discount;

  const profit =
    selling - rawCost;
const currentDate =
  new Date().toLocaleString();
  const order = {

    customerName,
    product,
    quantity,
    rawCost,
    selling,
    profit,
    status,
    date: currentDate

  };

  await saveOrder(order);

});

async function saveOrder(order){

  try{

    await addDoc(
      collection(db, "orders"),
      order
    );

    loadOrders();

  }

  catch(error){

    console.log(error);

  }

}

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

function renderOrders(){

  ordersTable.innerHTML = "";

  let revenue = 0;
  let profitTotal = 0;
  let pending = 0;
  let delivered = 0;

  orders.forEach((order, index) => {

    revenue += order.selling;

    profitTotal += order.profit;

    if(order.status === "Pending"){

      pending++;

    }
    if(order.status === "Delivered"){

  delivered++;

    }

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>${order.customerName}</td>

      <td>${order.product}</td>

      <td>${order.quantity}</td>

      <td>₹${order.rawCost}</td>

      <td>₹${order.selling}</td>

      <td>₹${order.profit}</td>
     

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

<td>

  <button
    class="delete-btn"
    onclick="deleteOrder('${order.id}')"
  >
    Delete
  </button>

      </td>
 
      <td>${order.date}</td>
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
    `₹${revenue}`;

  totalProfit.innerText =
    `₹${profitTotal}`;

  pendingOrders.innerText =
    pending;

  deliveredOrders.innerText =
  delivered;

}

async function toggleStatus(index){

  const order = orders[index];

  if(order.status === "Pending"){

    order.status = "Delivered";

  }

  else{

    order.status = "Pending";

  }

  const orderRef =
    doc(db, "orders", order.id);

  await updateDoc(orderRef, {

    status: order.status

  });

  loadOrders();

}

loadOrders();
window.deleteOrder = async function(id){

  const confirmDelete =
    confirm("Delete this order?");

  if(!confirmDelete) return;

  await deleteDoc(
    doc(db, "orders", id)
  );

  loadOrders();

}
exportBtn.addEventListener("click", () => {

  const exportData =
    orders.map(order => ({

      Customer: order.customerName,

      Product: order.product,

      Quantity: order.quantity,

      RawCost: order.rawCost,

      Selling: order.selling,

      Profit: order.profit,

      Status: order.status,

      Date: order.date

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