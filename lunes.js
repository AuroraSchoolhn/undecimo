// 1. Capturamos los elementos del HTML que vamos a usar
const formulario = document.getElementById("loginForm");
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const checkVerPassword = document.getElementById("verPassword");
const mensaje = document.getElementById("mensaje");

// Datos de prueba (simulando una base de datos)
const USUARIO_CORRECTO = "";
const PASSWORD_CORRECTA = "";

// 2. Interactividad extra: Cambiar el tipo de input de 'password' a 'text'
checkVerPassword.addEventListener("change", function() {
    if (checkVerPassword.checked) {
        inputPassword.type = "text";
    } else {
        inputPassword.type = "password";
    }
});

// 3. Evento al enviar el formulario
formulario.addEventListener("submit", function(evento) {
    // Evita que la página se recargue al presionar el botón
    evento.preventDefault();

    // Obtenemos lo que escribió el usuario (.trim() quita espacios en blanco al inicio/final)
    const usuarioIngresado = inputUsuario.value.trim();
    const passwordIngresada = inputPassword.value;

    // Validamos los datos
    if (usuarioIngresado === USUARIO_CORRECTO && passwordIngresada === PASSWORD_CORRECTA) {
        mensaje.textContent = "¡Bienvenido, " + usuarioIngresado + "!";
        mensaje.style.color = "green";
        
        // Opcional: limpiar los campos
        formulario.reset();
    } else {
        mensaje.textContent = "Usuario o contraseña incorrectos.";
        mensaje.style.color = "red";
    }
});
