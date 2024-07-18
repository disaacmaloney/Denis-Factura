document.addEventListener("DOMContentLoaded", function () {
    const tourOperSelect = document.getElementById("tour-operador");
  
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

    function actualizarTotales() {
        const totalArticulos = productos.reduce((total, producto) => total + producto.cantidad, 0);
        const totalAPagar = productos.reduce((total, producto) => total + producto.precioFinal, 0);
        const totalIngresado = calcularTotalIngresado();
        const totalDescuento = productos.reduce((total, producto) => total + (producto.descuentoDinero * producto.cantidad), 0);
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
        totalDescuentoElement.textContent = `$${totalDescuento.toLocaleString(
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
  });
  