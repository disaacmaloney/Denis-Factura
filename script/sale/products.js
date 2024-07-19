document.addEventListener("DOMContentLoaded", function () {
  let productos = [];
  let productosJSON = [];
  let facturasEnEspera =
    JSON.parse(localStorage.getItem("facturasEnEspera")) || [];

  const inputCodigoBarras = document.getElementById("codigo-barras");
  const tablaProductos = document.getElementById("articulos-tbody");
  const totalArticulosElement = document.getElementById("total-articulos");
  const totalAPagarElement = document.getElementById("total-pagar");
  const totalDescuentoElement = document.getElementById("total-descuento");
  const pendienteElement = document.getElementById("pendiente");
  const nombreClienteInput = document.getElementById("cliente-nombre");

  const tourOpe = document.getElementById("tour-operador");
  const tourOperadorElement = tourOpe.options[tourOpe.selectedIndex].text;

  fetch("../../database/products.json")
    .then((response) => response.json())
    .then((data) => {
      productosJSON = data.products;
    });

  inputCodigoBarras.addEventListener("input", function () {
    const codigo = inputCodigoBarras.value.toUpperCase();
    if (codigo) {
      const producto = productosJSON.find((p) => p.id === codigo);
      if (producto) {
        const nuevoProducto = {
          codigoBarras: producto.barcode,
          codigoInterno: producto.internal_code,
          nombre: producto.product_name,
          cantidad: 1,
          precioUnitario: producto.unit_price,
          descuentoPorcentaje: 0,
          descuentoDinero: 0,
          totalDescuentoDinero: 0,
          precioFinal: producto.unit_price,
          vendedor: "",
        };
        agregarProducto(nuevoProducto);
      } else {
        alert("Producto no encontrado.");
      }
      inputCodigoBarras.value = "";
    }
  });

  function agregarProducto(producto) {
    const indice = productos.findIndex(
      (p) => p.codigoBarras === producto.codigoBarras
    );
    if (indice > -1) {
      productos[indice].cantidad += 1;
      productos[indice].precioFinal = calcularPrecioFinal(productos[indice]);
    } else {
      productos.push(producto);
    }
    actualizarTabla();
    actualizarTotales();
  }

  function actualizarTabla() {
    tablaProductos.innerHTML = "";
    productos.forEach((producto, index) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
                <td>${producto.codigoBarras}</td>
                <td>${producto.codigoInterno}</td>
                <td>${producto.nombre}</td>
                <td><input type="number" value="${
                  producto.cantidad
                }" data-index="${index}" class="cantidad-input"></td>
                <td><input type="number" value="${producto.precioUnitario.toFixed(
                  2
                )}" data-index="${index}" class="precio-unitario-input"></td>
                <td><input type="number" value="${
                  producto.descuentoPorcentaje
                }" data-index="${index}" class="descuento-porcentaje-input"></td>
                <td><label id="lbl-desc-${
                  producto.codigoBarras
                }">${producto.totalDescuentoDinero.toLocaleString("es-PA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}</label></td>
                <td><label id="lbl-price-${
                  producto.codigoBarras
                }">${producto.precioFinal.toLocaleString("es-PA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}</label></td>
                <td contenteditable="true" class="vendedor">${
                  producto.vendedor
                }</td>
                <td><button data-index="${index}" class="eliminar-producto-btn">Eliminar</button></td>
            `;
      tablaProductos.appendChild(fila);
    });

    document.querySelectorAll(".cantidad-input").forEach((input) => {
      input.addEventListener("input", actualizarProductoFila);
    });

    document.querySelectorAll(".precio-unitario-input").forEach((input) => {
      input.addEventListener("input", actualizarProductoFila);
    });

    document
      .querySelectorAll(".descuento-porcentaje-input")
      .forEach((input) => {
        input.addEventListener("input", actualizarProductoFila);
      });

    document.querySelectorAll(".eliminar-producto-btn").forEach((button) => {
      button.addEventListener("click", eliminarProducto);
    });
  }

  function actualizarProductoFila(event) {
    const index = event.target.dataset.index;
    const producto = productos[index];
    const fila = event.target.closest("tr");

    producto.cantidad =
      parseInt(
        fila.querySelector(`.cantidad-input[data-index='${index}']`).value
      ) || 0;
    producto.precioUnitario =
      parseFloat(
        fila.querySelector(`.precio-unitario-input[data-index='${index}']`)
          .value
      ) || 0;
    producto.descuentoPorcentaje =
      parseFloat(
        fila.querySelector(`.descuento-porcentaje-input[data-index='${index}']`)
          .value
      ) || 0;
    producto.totalDescuentoDinero =
      producto.precioUnitario *
      (producto.descuentoPorcentaje / 100) *
      producto.cantidad;
    producto.precioFinal = calcularPrecioFinal(producto);

    fila.querySelector(`#lbl-desc-${producto.codigoBarras}`).textContent =
      producto.totalDescuentoDinero.toLocaleString("es-PA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    fila.querySelector(`#lbl-price-${producto.codigoBarras}`).textContent =
      producto.precioFinal.toLocaleString("es-PA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    actualizarTotales();
  }

  function calcularPrecioFinal(producto) {
    const descuentoDinero =
      producto.precioUnitario * (producto.descuentoPorcentaje / 100);
    producto.descuentoDinero = descuentoDinero;
    return (producto.precioUnitario - descuentoDinero) * producto.cantidad;
  }

  function eliminarProducto(event) {
    const index = event.target.dataset.index;
    productos.splice(index, 1);
    actualizarTabla();
    actualizarTotales();
  }

  function actualizarTotales() {
    const totalArticulos = productos.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
    const totalAPagar = productos.reduce(
      (total, producto) => total + producto.precioFinal,
      0
    );
    const totalIngresado = calcularTotalIngresado();
    const totalDescuento = productos.reduce(
      (total, producto) => total + producto.descuentoDinero * producto.cantidad,
      0
    );
    const cambio = Math.max(0, totalIngresado - totalAPagar);

    totalArticulosElement.textContent = totalArticulos;
    totalAPagarElement.textContent = `$${totalAPagar.toLocaleString("es-PA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    pendienteElement.textContent = `$${Math.max(
      0,
      totalAPagar - totalIngresado
    ).toLocaleString("es-PA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    totalDescuentoElement.textContent = `$${totalDescuento.toLocaleString(
      "es-PA",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;
    document.getElementById("cambio").textContent = `$${cambio.toLocaleString(
      "es-PA",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}`;

    if (totalIngresado >= totalAPagar && totalArticulos > 0) {
      document.getElementById("pagar-btn").disabled = false;
      document.getElementById("pagar-btn").classList.remove("bg-gray-500");
      document.getElementById("pagar-btn").classList.add("bg-blue-500");
    } else {
      document.getElementById("pagar-btn").disabled = true;
      document.getElementById("pagar-btn").classList.remove("bg-blue-500");
      document.getElementById("pagar-btn").classList.add("bg-gray-500");
    }
  }
  document
    .getElementById("efectivo")
    .addEventListener("input", calcularTotalCambio);
  document
    .getElementById("tarjeta-visa")
    .addEventListener("input", calcularTotalCambio);
  document
    .getElementById("tarjeta-amex")
    .addEventListener("input", calcularTotalCambio);
  document
    .getElementById("tarjeta-mastercard")
    .addEventListener("input", calcularTotalCambio);
  document
    .getElementById("nota-credito")
    .addEventListener("input", calcularTotalCambio);
  function calcularTotalCambio() {
    const totalAPagar = parseFloat(
      totalAPagarElement.textContent.replace("$", "")
    );
    const totalIngresado = calcularTotalIngresado();
    const cambio = Math.max(0, totalIngresado - totalAPagar);
    document.getElementById("cambio").textContent = `$${cambio.toFixed(2)}`;
  }

  function calcularTotalIngresado() {
    const efectivo = parseFloat(document.getElementById("efectivo").value) || 0;
    const tarjetaVisa =
      parseFloat(document.getElementById("tarjeta-visa").value) || 0;
    const tarjetaAMEX =
      parseFloat(document.getElementById("tarjeta-amex").value) || 0;
    const tarjetaMastercard =
      parseFloat(document.getElementById("tarjeta-mastercard").value) || 0;
    const notaCredito =
      parseFloat(document.getElementById("nota-credito").value) || 0;

    const totalIngresado =
      efectivo + tarjetaVisa + tarjetaAMEX + tarjetaMastercard + notaCredito;
    document.getElementById(
      "ingresado"
    ).textContent = `$${totalIngresado.toFixed(2)}`;
    return totalIngresado;
  }

  function eliminarProducto(event) {
    const index = event.target.dataset.index;
    productos.splice(index, 1);
    actualizarTabla();
    actualizarTotales();
  }

  document
    .getElementById("cancelar-transaccion-btn")
    .addEventListener("click", function () {
      Swal.fire({
        title: "¿Qué desea hacer?",
        text: "Seleccione una opción",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Limpiar pantalla",
        denyButtonText: "Guardar información",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed) {
          limpiarTransaccion();
        } else if (result.isDenied) {
          guardarInformacion();
          limpiarTransaccion();
        }
      });
    });

  function guardarInformacion() {
    const facturaPendiente = {
      clienteId: nombreClienteInput.textContent,
      tourOperadorId: tourOperadorElement.textContent,
      productos: productos,
      totalAPagar: parseFloat(totalAPagarElement.textContent.replace("$", "")),
      totalIngresado: calcularTotalIngresado(),
      pendiente: parseFloat(pendienteElement.textContent.replace("$", "")),
      cajero: cajero,
    };

    facturasEnEspera.push(facturaPendiente);
    localStorage.setItem("facturasEnEspera", JSON.stringify(facturasEnEspera));
    Swal.fire("Guardado!", "La información ha sido guardada.", "success");
  }

  function limpiarTransaccion() {
    productos = [];
    actualizarTabla();
    actualizarTotales();
    nombreClienteInput.textContent = "";
    tourOperadorElement.textContent = "";
    limpiarMetodosDePago();
  }

  function limpiarMetodosDePago() {
    document.getElementById("efectivo").value = "";
    document.getElementById("tarjeta-visa").value = "";
    document.getElementById("tarjeta-amex").value = "";
    document.getElementById("tarjeta-mastercard").value = "";
    document.getElementById("nota-credito").value = "";
    document.getElementById("cambio").textContent = "$0.00";
    document.getElementById("ingresado").textContent = "$0.00";
  }

  document.getElementById("pagar-btn").addEventListener("click", function () {
    if (!tourOperadorElement.textContent || !nombreClienteInput.textContent) {
      Swal.fire(
        "Error",
        "Debe seleccionar un Tour Operador y un Cliente",
        "error"
      );
      return;
    }

    const factura = {
      clienteId: nombreClienteInput.textContent,
      tourOperadorId: tourOperadorElement.textContent,
      productos: productos,
      totalAPagar: parseFloat(totalAPagarElement.textContent.replace("$", "")),
      totalIngresado: calcularTotalIngresado(),
      pendiente: parseFloat(pendienteElement.textContent.replace("$", "")),
      cajero: cajero,
    };

    localStorage.setItem("factura", JSON.stringify(factura));
    Swal.fire("Éxito", "Factura generada con éxito", "success");
    limpiarTransaccion();
  });

  const facturasEsperaBtn = document.getElementById("facturas-espera-btn");
  const cerrarFacturasEsperaBtn = document.getElementById(
    "cerrar-facturas-espera-btn"
  );
  const listaFacturasEspera = document.getElementById("lista-facturas-espera");
  const facturasEsperaModal = document.getElementById("facturas-espera-modal");

  facturasEsperaBtn.addEventListener("click", function () {
    cargarListaFacturasEnEspera();
    facturasEsperaModal.classList.remove("hidden");
  });

  // Cerrar el modal de facturas en espera
  cerrarFacturasEsperaBtn.addEventListener("click", function () {
    facturasEsperaModal.classList.add("hidden");
  });

  // Función para cargar la lista de facturas en espera
  function cargarListaFacturasEnEspera() {
    const facturasEnEspera =
      JSON.parse(localStorage.getItem("facturasEnEspera")) || [];
    listaFacturasEspera.innerHTML = "";

    facturasEnEspera.forEach((factura, index) => {
      const listItem = document.createElement("li");
      listItem.classList.add(
        "mb-2",
        "p-2",
        "border",
        "border-gray-300",
        "rounded",
        "cursor-pointer"
      );
      listItem.textContent = `Factura ${index + 1}: Cliente ${
        factura.clienteId
      }, Tour Operador ${factura.tourOperadorId}`;
      listItem.addEventListener("click", function () {
        cargarFacturaEnEspera(index);
        facturasEsperaModal.classList.add("hidden");
      });
      listaFacturasEspera.appendChild(listItem);
    });
  }

  // Función para cargar una factura en espera
  function cargarFacturaEnEspera(index) {
    const facturasEnEspera =
      JSON.parse(localStorage.getItem("facturasEnEspera")) || [];
    const factura = facturasEnEspera[index];
    if (factura) {
      document.getElementById("cliente-nombre").textContent = factura.clienteId;
      document.getElementById("tour-operador").textContent =
        factura.tourOperadorId;
      productos = factura.productos.slice(); // Asegurarse de copiar los productos correctamente
      facturasEnEspera.splice(index, 1); // Eliminar la factura recuperada
      localStorage.setItem(
        "facturasEnEspera",
        JSON.stringify(facturasEnEspera)
      ); // Guardar las facturas pendientes actualizadas
      actualizarTabla();
      actualizarTotales();
    }
  }

  // Cerrar el modal de facturas en espera
  cerrarFacturasEsperaBtn.addEventListener("click", function () {
    facturasEsperaModal.classList.add("hidden");
  });

  function cargarFacturaEnEspera(index) {
    const facturasEnEspera =
      JSON.parse(localStorage.getItem("facturasEnEspera")) || [];
    const factura = facturasEnEspera[index];
    if (factura) {
      document.getElementById("cliente-nombre").textContent = factura.clienteId;
      document.getElementById("tour-operador").textContent =
        factura.tourOperadorId;
      productos = factura.productos.slice(); // Asegurarse de copiar los productos correctamente
      facturasEnEspera.splice(index, 1); // Eliminar la factura recuperada
      localStorage.setItem(
        "facturasEnEspera",
        JSON.stringify(facturasEnEspera)
      ); // Guardar las facturas pendientes actualizadas
      actualizarTabla();
      actualizarTotales();
    }
  }
});
