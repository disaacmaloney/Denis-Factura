document.addEventListener("DOMContentLoaded", function () {
    const cajeroInfo  = localStorage.getItem('cajeroInfo');
    const totalArticulosElement = document.getElementById('total-articulos');
    const totalAPagarElement = document.getElementById('total-pagar');
    const pendienteElement = document.getElementById('pendiente');
    const nombreClienteInput = document.getElementById('cliente-nombre');
    const cajeroElement = document.getElementById('cajero');
    const tourOperadorElement = document.getElementById('tour-operador');
    const cajero = localStorage.getItem('cajeroNombre');


    if (cajeroInfo) {
        document.getElementById('cajero').textContent = cajeroInfo;
    }

    document.getElementById('nuevo-cliente-btn').addEventListener('click', function() {
        document.getElementById('nuevo-cliente-modal').classList.remove('hidden');
    });

    function closeModal() {
        document.getElementById('nuevo-cliente-modal').classList.add('hidden');
    }

    document.getElementById('cancelar-cliente-btn').addEventListener('click', closeModal);

    document.getElementById('guardar-cliente-btn').addEventListener('click', function() {
        const nombre = document.getElementById('nuevo-nombre').value;
        const apellido = document.getElementById('nuevo-apellido').value;

        if (nombre && apellido) {
            const clienteNombre = `${nombre} ${apellido}`;
            document.getElementById('cliente-nombre').textContent = clienteNombre;
            localStorage.setItem('clienteNombre', clienteNombre);
            closeModal();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, complete todos los campos.'
            });
        }
    });

    const storedClienteNombre = localStorage.getItem('clienteNombre');
    if (storedClienteNombre) {
        document.getElementById('cliente-nombre').textContent = storedClienteNombre;
    }

    fetch("../database/countries.json")
    .then((response) => response.json())
    .then((data) => {
      const aperturaPorSelect = document.getElementById("nuevo-pais");
      data.countries.forEach((cashier) => {
        const option = document.createElement("option");
        option.value = cashier.id;
        option.textContent = `${cashier.countriesName}`;
        aperturaPorSelect.appendChild(option);
      });
    });

    const inputCodigoBarras = document.getElementById('codigo-barras');
    const tablaProductos = document.getElementById('articulos-tbody');
    let productos = [];
    let productosJSON = [];

    fetch('../database/products.json')
        .then(response => response.json())
        .then(data => {
            productosJSON = data.products;
        });

    // Evento para el input de código de barras
    inputCodigoBarras.addEventListener('input', function() {
        const codigo = inputCodigoBarras.value;
        if (codigo) {
            const producto = productosJSON.find(p => p.id === codigo);
            if (producto) {
                const nuevoProducto = {
                    codigoBarras: producto.barcode,
                    codigoInterno: producto.internal_code,
                    nombre: producto.product_name,
                    cantidad: 1,
                    precioUnitario: producto.unit_price,
                    descuentoPorcentaje: 0,
                    descuentoDinero: 0,
                    precioFinal: producto.unit_price,
                    vendedor: ''
                };
                agregarProducto(nuevoProducto);
            } else {
                alert('Producto no encontrado.');
            }
            inputCodigoBarras.value = '';
        }
    });

    function agregarProducto(producto) {
        const indice = productos.findIndex(p => p.codigoBarras === producto.codigoBarras);
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
        tablaProductos.innerHTML = '';
        productos.forEach((producto, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.codigoBarras}</td>
                <td>${producto.codigoInterno}</td>
                <td>${producto.nombre}</td>
                <td><input type="number" value="${producto.cantidad}" data-index="${index}" class="cantidad-input"></td>
                <td><input type="number" value="${producto.precioUnitario.toFixed(2)}" data-index="${index}" class="precio-unitario-input"></td>
                <td><input type="number" value="${producto.descuentoPorcentaje}" data-index="${index}" class="descuento-porcentaje-input"></td>
                <td>${producto.descuentoDinero.toLocaleString(
                    "es-PA",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</td>
                <td>${producto.precioFinal.toLocaleString(
                    "es-PA",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</td>
                <td contenteditable="true" class="vendedor">${producto.vendedor}</td>
                <td><button data-index="${index}" class="eliminar-producto-btn">Eliminar</button></td>
            `;
            tablaProductos.appendChild(fila);
        });

        document.querySelectorAll('.cantidad-input').forEach(input => {
            input.addEventListener('input', actualizarProducto);
        });

        document.querySelectorAll('.precio-unitario-input').forEach(input => {
            input.addEventListener('input', actualizarProducto);
        });

        document.querySelectorAll('.descuento-porcentaje-input').forEach(input => {
            input.addEventListener('input', actualizarProducto);
        });

        document.querySelectorAll('.eliminar-producto-btn').forEach(button => {
            button.addEventListener('click', eliminarProducto);
        });
    }

    function actualizarProducto(event) {
        const index = event.target.dataset.index;
        const producto = productos[index];
        producto.cantidad = parseInt(document.querySelector(`.cantidad-input[data-index='${index}']`).value) || 0;
        producto.precioUnitario = parseFloat(document.querySelector(`.precio-unitario-input[data-index='${index}']`).value) || 0;
        producto.descuentoPorcentaje = parseFloat(document.querySelector(`.descuento-porcentaje-input[data-index='${index}']`).value) || 0;
        producto.precioFinal = calcularPrecioFinal(producto);
        actualizarTabla();
        actualizarTotales();
    }

    function calcularPrecioFinal(producto) {
        const descuentoDinero = producto.precioUnitario * (producto.descuentoPorcentaje / 100);
        producto.descuentoDinero = descuentoDinero;
        return (producto.precioUnitario - descuentoDinero) * producto.cantidad;
    }

    function actualizarTotales() {
        const totalArticulos = productos.reduce((total, producto) => total + producto.cantidad, 0);
        const totalAPagar = productos.reduce((total, producto) => total + producto.precioFinal, 0);
        const totalIngresado = calcularTotalIngresado();
        const cambio = Math.max(0, totalIngresado - totalAPagar);

        totalArticulosElement.textContent = totalArticulos;
        totalAPagarElement.textContent = `$${totalAPagar.toLocaleString(
            "es-PA",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`;
        pendienteElement.textContent = `$${Math.max(0, totalAPagar - totalIngresado).toLocaleString(
            "es-PA",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`;
        document.getElementById('cambio').textContent = `$${cambio.toLocaleString(
            "es-PA",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}`;

        if (totalIngresado >= totalAPagar && totalArticulos > 0) {
            document.getElementById('pagar-btn').disabled = false;
            document.getElementById('pagar-btn').classList.remove('bg-gray-500');
            document.getElementById('pagar-btn').classList.add('bg-blue-500');
        } else {
            document.getElementById('pagar-btn').disabled = true;
            document.getElementById('pagar-btn').classList.remove('bg-blue-500');
            document.getElementById('pagar-btn').classList.add('bg-gray-500');
        }

    }

    function calcularTotalIngresado() {
        const efectivo = parseFloat(document.getElementById('efectivo').value) || 0;
        const tarjetaVisa = parseFloat(document.getElementById('tarjeta-visa').value) || 0;
        const tarjetaAMEX = parseFloat(document.getElementById('tarjeta-amex').value) || 0;
        const tarjetaMastercard = parseFloat(document.getElementById('tarjeta-mastercard').value) || 0;
        const notaCredito = parseFloat(document.getElementById('nota-credito').value) || 0;

        const totalIngresado = efectivo + tarjetaVisa + tarjetaAMEX + tarjetaMastercard + notaCredito;
        document.getElementById('ingresado').textContent = `$${totalIngresado.toFixed(2)}`;
        return totalIngresado;
    }

    function eliminarProducto(event) {
        const index = event.target.dataset.index;
        productos.splice(index, 1);
        actualizarTabla();
        actualizarTotales();
    }
});
