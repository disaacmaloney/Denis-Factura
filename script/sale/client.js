document.addEventListener("DOMContentLoaded", function () {

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

    function limpiarFormularioNuevoCliente() {
        document.getElementById('nuevo-nombre').value = '';
        document.getElementById('nuevo-apellido').value = '';
        document.getElementById('nuevo-pasaporte').value = '';
        document.getElementById('nuevo-pais').value = '';
    }



});
