// templates/js/login.js

// En producción no declares localhost ni el dominio.
// Nginx ya envía /api hacia tu backend.
const API_BASE = ""; 

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const btnGoRegister = document.getElementById("btnGoRegister");
  const msg = document.getElementById("mensaje");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const res = await fetch(`/api/v1/seguridad/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        msg.textContent = data.error || data.mensaje || "Error al iniciar sesión";
        msg.style.color = "red";
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

      msg.textContent = data.mensaje || "Inicio de sesión correcto";
      msg.style.color = "green";

      const next = data.redirect || "/productos.html";
      setTimeout(() => { window.location.href = next; }, 300);
    } catch {
      msg.textContent = "Error de conexión con el servidor.";
      msg.style.color = "red";
    }
  });

  btnGoRegister.addEventListener("click", () => {
    window.location.href = "/register.html";
  });
});
