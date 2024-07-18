document.addEventListener("DOMContentLoaded", function () {
    

    const nombreClienteInput = document.getElementById('cliente-nombre');
    const cajeroElement = document.getElementById('cajero');
    const tourOperadorElement = document.getElementById('tour-operador');
    const cajero = localStorage.getItem('cajeroNombre');




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

    
    

    // Evento para el input de código de barras
    

    

    

    

    

    

});
