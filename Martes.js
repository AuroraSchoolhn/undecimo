// 1. Seleccionar elementos del DOM
const  = document.getElementById('cuenta');
const  = document.getElementById('personas');
const  = document.querySelectorAll('.btn-propina');
const  = document.getElementById('propina-persona');
const  = document.getElementById('total-persona');
const  = document.getElementById('btn-limpiar');

// Estado inicial
let porcentajeSeleccionado = 10;

// 2. Función principal de cálculo
function calcular() {
  const cuenta = parseFloat(inputCuenta.value) || 0;
  const personas = parseInt(inputPersonas.value) || 1;

  // Evitar divisiones entre cero o números negativos
  if (cuenta < 0 || personas < 1) {
    textoPropinaPersona.textContent = '$0.00';
    textoTotalPersona.textContent = '$0.00';
    return;
  }

  const propinaTotal = cuenta * (porcentajeSeleccionado / 100);
  const totalGeneral = cuenta + propinaTotal;

  const propinaPorPersona = propinaTotal / personas;
  const totalPorPersona = totalGeneral / personas;

  // Actualizar la pantalla con 2 decimales
  textoPropinaPersona.textContent = `$${propinaPorPersona.toFixed(2)}`;
  textoTotalPersona.textContent = `$${totalPorPersona.toFixed(2)}`;
}

// 3. Eventos para los botones de porcentaje
botonesPropina.forEach((boton) => {
  boton.addEventListener('click', () => {
    // Quitar la clase 'activo' de todos los botones
    botonesPropina.forEach((b) => b.classList.remove('activo'));
    
    // Agregar 'activo' solo al botón presionado
    boton.classList.add('activo');
    
    // Leer el atributo data-porcentaje del HTML
    porcentajeSeleccionado = parseFloat(boton.dataset.porcentaje);
    
    calcular();
  });
});

// 4. Eventos al escribir en los inputs
inputCuenta.addEventListener('input', calcular);
inputPersonas.addEventListener('input', calcular);

// 5. Evento para el botón Reiniciar
btnLimpiar.addEventListener('click', () => {
  inputCuenta.value = '';
  inputPersonas.value = '1';
  porcentajeSeleccionado = 10;

  botonesPropina.forEach((b) => b.classList.remove('activo'));
  botonesPropina[0].classList.add('activo');

  calcular();
});
