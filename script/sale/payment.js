document.addEventListener("DOMContentLoaded", function () {
  document.getElementById('pagar-btn').addEventListener('click', function() {
    if (!tourOperadorElement.textContent || !nombreClienteInput.textContent) {
        Swal.fire('Error', 'Debe seleccionar un Tour Operador y un Cliente', 'error');
        return;
    }

    const factura = {
        clienteId: nombreClienteInput.textContent,
        tourOperadorId: tourOperadorElement.textContent,
        productos: productos,
        totalAPagar: parseFloat(totalAPagarElement.textContent.replace('$', '')),
        totalIngresado: calcularTotalIngresado(),
        pendiente: parseFloat(pendienteElement.textContent.replace('$', '')),
        cajero: cajero
    };

    localStorage.setItem('factura', JSON.stringify(factura));
    Swal.fire('Éxito', 'Factura generada con éxito', 'success');
    limpiarTransaccion();
});

document.getElementById('cancelar-transaccion-btn').addEventListener('click', function() {
    Swal.fire({
        title: '¿Qué desea hacer?',
        text: "Seleccione una opción",
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Limpiar pantalla',
        denyButtonText: 'Guardar información',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            limpiarTransaccion();
        } else if (result.isDenied) {
            guardarInformacion();
            limpiarTransaccion();
        }
    });
});

document.getElementById('facturas-espera-btn').addEventListener('click', function() {
    const facturasEsperaModal = document.getElementById('facturas-espera-modal');
    const listaFacturasEspera = document.getElementById('lista-facturas-espera');

    listaFacturasEspera.innerHTML = '';
    facturasEnEspera.forEach((factura, index) => {
        const li = document.createElement('li');
        li.textContent = `Factura ${index + 1} - Cliente: ${factura.clienteId}`;
        li.classList.add('p-2', 'cursor-pointer', 'hover:bg-gray-200');
        li.dataset.index = index;
        li.addEventListener('click', () => {
            cargarFacturaEnEspera(index);
            facturasEsperaModal.classList.add('hidden');
        });
        listaFacturasEspera.appendChild(li);
    });

    facturasEsperaModal.classList.remove('hidden');
});

document.getElementById('cerrar-facturas-espera-btn').addEventListener('click', function() {
    document.getElementById('facturas-espera-modal').classList.add('hidden');
});

function guardarInformacion() {
  const facturaPendiente = {
      clienteId: nombreClienteInput.textContent,
      tourOperadorId: tourOperadorElement.textContent,
      productos: productos,
      totalAPagar: parseFloat(totalAPagarElement.textContent.replace('$', '')),
      totalIngresado: calcularTotalIngresado(),
      pendiente: parseFloat(pendienteElement.textContent.replace('$', '')),
      cajero: cajero
  };

  facturasEnEspera.push(facturaPendiente);
  localStorage.setItem('facturasEnEspera', JSON.stringify(facturasEnEspera));
  Swal.fire('Guardado!', 'La información ha sido guardada.', 'success');
}

function cargarFacturaEnEspera(index) {
  const factura = facturasEnEspera[index];
  nombreClienteInput.textContent = factura.clienteId;
  tourOperadorElement.textContent = factura.tourOperadorId;
  productos = factura.productos.slice();  // Asegurarse de copiar los productos correctamente
  facturasEnEspera.splice(index, 1);  // Eliminar la factura recuperada
  localStorage.setItem('facturasEnEspera', JSON.stringify(facturasEnEspera));  // Guardar las facturas pendientes actualizadas
  actualizarTabla();
  actualizarTotales();
}

function limpiarTransaccion() {
  productos = [];
  actualizarTabla();
  actualizarTotales();
  nombreClienteInput.textContent = '';
  tourOperadorElement.textContent = '';
  limpiarMetodosDePago();
}

function limpiarMetodosDePago() {
  document.getElementById('efectivo').value = '';
  document.getElementById('tarjeta-visa').value = '';
  document.getElementById('tarjeta-amex').value = '';
  document.getElementById('tarjeta-mastercard').value = '';
  document.getElementById('nota-credito').value = '';
  document.getElementById('cambio').textContent = '$0.00';
  document.getElementById('ingresado').textContent = '$0.00';
}


  });
  