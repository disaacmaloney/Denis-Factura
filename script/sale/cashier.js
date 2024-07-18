document.addEventListener("DOMContentLoaded", function () {
    const cajeroInfo  = localStorage.getItem('cajeroInfo');

    if (cajeroInfo) {
        document.getElementById('cajero').textContent = cajeroInfo;
    }
});
