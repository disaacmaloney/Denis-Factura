document.addEventListener("DOMContentLoaded", function () {
  const tourOperSelect = document.getElementById("tour-operador");

  fetch("../../database/tourOperadores.json")
    .then((response) => response.json())
    .then((data) => {
      const tourOperators = data.tourOperadores;
      tourOperators.forEach((operator) => {
        const option = document.createElement("option");
        option.value = operator.id;
        option.textContent = `${operator.id} - ${operator.name} ${operator.lastName}`;
        tourOperSelect.appendChild(option);
      });
    });
});
