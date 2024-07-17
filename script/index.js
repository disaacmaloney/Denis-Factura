document.addEventListener("DOMContentLoaded", function () {
  const now = new Date();

  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = now.toLocaleDateString("es-ES", options);
  document.getElementById("fecha-apertura").value = formattedDate;

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formattedTime = `${hours % 12 || 12}:${
    minutes < 10 ? "0" : ""
  }${minutes} ${hours >= 12 ? "P.M." : "A.M."}`;
  document.getElementById("hora-apertura").value = formattedTime;

  function calculateTotals() {
    let subtotal = 0;
    let total = 0;

    document.querySelectorAll("input[data-value]").forEach((input) => {
      const value = parseFloat(input.dataset.value);
      const quantity = parseInt(input.value) || 0;
      const amount = value * quantity;
      subtotal += amount;
      total += amount;
    });

    document.getElementById("subtotal").textContent = subtotal.toLocaleString(
      "es-PA",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );
    document.getElementById("total").textContent = total.toLocaleString(
      "es-PA",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    );
  }

  fetch("../database/cashier.json")
    .then((response) => response.json())
    .then((data) => {
      const cajaAperturaSelect = document.getElementById("caja-apertura");
      data.cashier.forEach((box) => {
        const option = document.createElement("option");
        option.value = box.id;
        option.textContent = box.cashierName;
        cajaAperturaSelect.appendChild(option);
      });
    });

  fetch("../database/cashierUser.json")
    .then((response) => response.json())
    .then((data) => {
      const aperturaPorSelect = document.getElementById("apertura-por");
      data.cashierUser.forEach((cashier) => {
        const option = document.createElement("option");
        option.value = cashier.id;
        option.textContent = `${cashier.firstName} ${cashier.lastName}`;
        aperturaPorSelect.appendChild(option);
      });
    });

  fetch("../database/denominations.json")
    .then((response) => response.json())
    .then((data) => {
      const monedasTable = document
        .getElementById("monedas-table")
        .querySelector("tbody");
      const billetesTable = document
        .getElementById("billetes-table")
        .querySelector("tbody");

      data.currency.moneda.forEach((denomination) => {
        const row = document.createElement("tr");
        row.classList.add("border-b");
        const labelCell = document.createElement("td");
        labelCell.classList.add("p-2", "denominacion");
        labelCell.textContent = denomination.label;
        const inputCell = document.createElement("td");
        inputCell.classList.add("p-2");
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.classList.add(
          "w-full",
          "p-2",
          "border",
          "border-gray-300",
          "rounded"
        );
        input.dataset.value = denomination.value;
        input.addEventListener("input", calculateTotals);
        inputCell.appendChild(input);
        row.appendChild(labelCell);
        row.appendChild(inputCell);
        monedasTable.appendChild(row);
      });

      data.currency.billete.forEach((denomination) => {
        const row = document.createElement("tr");
        row.classList.add("border-b");
        const labelCell = document.createElement("td");
        labelCell.classList.add("p-2", "denominacion");
        labelCell.textContent = denomination.label;
        const inputCell = document.createElement("td");
        inputCell.classList.add("p-2");
        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.classList.add(
          "w-full",
          "p-2",
          "border",
          "border-gray-300",
          "rounded"
        );
        input.dataset.value = denomination.value;
        input.addEventListener("input", calculateTotals);
        inputCell.appendChild(input);
        row.appendChild(labelCell);
        row.appendChild(inputCell);
        billetesTable.appendChild(row);
      });
    });

  document.getElementById("apertura-btn").addEventListener("click", () => {
    const aperturaPor = document.getElementById("apertura-por").value;
    if (!aperturaPor) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Por favor, ingrese el nombre de quien realiza la apertura.",
      });
      return;
    }
    const cajaSelect = document.getElementById("caja-apertura");
    const caja = cajaSelect.options[cajaSelect.selectedIndex].text;
    const aperturaPorSelect = document.getElementById("apertura-por");
    const aperturaCaja =
      aperturaPorSelect.options[aperturaPorSelect.selectedIndex].text;

    localStorage.setItem("cajeroInfo", aperturaCaja);

    Swal.fire({
      title: "¿Qué desea hacer?",
      text: "Seleccione una opción",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Imprimir",
      cancelButtonText: "Guardar como PDF",
    }).then((result) => {
      if (result.isConfirmed) {
        imprimirInformacion();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        createPDF();
      }
    });
  });

  function imprimirInformacion() {
    const fecha = document.getElementById("fecha-apertura").value;
    const hora = document.getElementById("hora-apertura").value;
    const cajaSelect = document.getElementById("caja-apertura");
    const caja = cajaSelect.options[cajaSelect.selectedIndex].text;
    const aperturaPorSelect = document.getElementById("apertura-por");
    const aperturaPor =
      aperturaPorSelect.options[aperturaPorSelect.selectedIndex].text;
    const subtotal = document.getElementById("subtotal").textContent;
    const total = document.getElementById("total").textContent;
    const { monedas, billetes } = createTableContent();

    const printContent = `
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h1 class="text-lg font-bold">Apertura de Caja</h1>
            <p class="mb-4"><strong>Fecha de Apertura:</strong> ${fecha}</p>
            <p class="mb-4"><strong>Hora de Apertura:</strong> ${hora}</p>
            <p class="mb-4"><strong>Caja a Abrir:</strong> ${caja}</p>
            <p class="mb-4"><strong>Apertura por:</strong> ${aperturaPor}</p>
            <div class="flex justify-between">
                <div class="w-1/2 pr-2">
                    <h2 class="text-lg font-bold mb-2">Monedas</h2>
                    <table class="w-full table-auto mb-4">
                        <thead>
                            <tr class="border-b">
                                <th class="p-2 text-left">Denominación</th>
                                <th class="p-2 text-left">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${monedas
                              .map(
                                (row) => `
                                <tr class="border-b">
                                    <td class="p-2">${row[0]}</td>
                                    <td class="p-2">${row[1]}</td>
                                </tr>`
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
                <div class="w-1/2 pl-2">
                    <h2 class="text-lg font-bold mb-2">Billetes</h2>
                    <table class="w-full table-auto mb-4">
                        <thead>
                            <tr class="border-b">
                                <th class="p-2 text-left">Denominación</th>
                                <th class="p-2 text-left">Cantidad</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${billetes
                              .map(
                                (row) => `
                                <tr class="border-b">
                                    <td class="p-2">${row[0]}</td>
                                    <td class="p-2">${row[1]}</td>
                                </tr>`
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="flex justify-between mb-2">
                <span class="font-bold">SubTotal:</span>
                <span class="font-bold">${subtotal}</span>
            </div>
            <div class="flex justify-between mb-4">
                <span class="font-bold">Total:</span>
                <span class="font-bold">${total}</span>
            </div>
        </div>
    `;

    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Imprimir</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
    redirectToSales();
  }

  function createPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const fecha = document.getElementById("fecha-apertura").value;
    const hora = document.getElementById("hora-apertura").value;
    const cajaSelect = document.getElementById("caja-apertura");
    const cajaApertura = cajaSelect.options[cajaSelect.selectedIndex].text;
    const aperturaPorSelect = document.getElementById("apertura-por");
    const aperturaPor =
      aperturaPorSelect.options[aperturaPorSelect.selectedIndex].text;
    const subtotal = document.getElementById("subtotal").textContent;
    const total = document.getElementById("total").textContent;
    const { monedas, billetes } = createTableContent();

    doc.text("Apertura de Caja", 10, 10);
    doc.text(`Fecha: ${fecha}`, 10, 20);
    doc.text(`Hora: ${hora}`, 10, 30);
    doc.text(`Caja: ${cajaApertura}`, 10, 40);
    doc.text(`Apertura por: ${aperturaPor}`, 10, 50);

    doc.autoTable({
      head: [["Monedas", "Cantidad"]],
      body: monedas,
      startY: 60,
    });

    doc.autoTable({
      head: [["Billetes", "Cantidad"]],
      body: billetes,
      startY: doc.lastAutoTable.finalY + 10,
    });

    doc.text(`SubTotal: ${subtotal}`, 10, doc.lastAutoTable.finalY + 20);
    doc.text(`Total: ${total}`, 10, doc.lastAutoTable.finalY + 30);

    doc.save("Apertura_de_Caja.pdf");
    redirectToSales();
  }

  function createTableContent() {
    const monedas = [];
    const billetes = [];

    document.querySelectorAll("#monedas-table tbody tr").forEach((row) => {
      const denomination = row.querySelector("td:nth-child(1)").textContent;
      const quantity = row.querySelector("td:nth-child(2) input").value;
      if (quantity) {
        monedas.push([denomination, quantity]);
      }
    });

    document.querySelectorAll("#billetes-table tbody tr").forEach((row) => {
      const denomination = row.querySelector("td:nth-child(1)").textContent;
      const quantity = row.querySelector("td:nth-child(2) input").value;
      if (quantity) {
        billetes.push([denomination, quantity]);
      }
    });

    return { monedas, billetes };
  }

  function redirectToSales() {
    window.location.href = "sale.html";
  }
});
