// templates/js/register.js
const API_BASE = "http://localhost:4001";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const msgEl = $("#msg");
  const setMsg = (t, ok = false) => { msgEl.textContent = t; msgEl.className = ok ? "ok" : "error"; };

  $("#btnBackLogin").addEventListener("click", () => (window.location.href = "/login.html"));

  $("#frmRegister").addEventListener("submit", async (e) => {
    e.preventDefault();
    setMsg("");
    const btn = e.submitter || $("#frmRegister button[type='submit']");
    btn.disabled = true;

    const val = (sel) => {
      const el = document.querySelector(sel);
      return el ? String(el.value || "").trim() : "";
    };

    // 🔑 Defaults para backend estricto
    const randomDni = () => String(Math.floor(10000000 + Math.random() * 89999999));

    let payload = {
      nombre: val("#nombre"),
      apellido: val("#apellido"),
      email: val("#email"),
      password: val("#password"),
      // los ocultos pueden no existir o venir vacíos
      nro_documento: val("#nro_documento"),
      edad: val("#edad"),
      rol: val("#rol") || "cliente",
    };

    // Validación mínima UI
    if (!payload.nombre || !payload.apellido || !payload.email) {
      setMsg("Completa los datos obligatorios."); btn.disabled = false; return;
    }
    if (payload.password.length < 6) {
      setMsg("La contraseña debe tener al menos 6 caracteres."); btn.disabled = false; return;
    }

    // Si el UI no los pide, agrega defaults válidos
    if (!payload.nro_documento) payload.nro_documento = randomDni();
    if (!payload.edad) payload.edad = 18;
    else {
      const n = Number(payload.edad);
      if (Number.isNaN(n) || n < 0) { setMsg("Edad inválida."); btn.disabled = false; return; }
      payload.edad = n;
    }
    if (!payload.rol) payload.rol = "cliente";

    try {
      const res = await fetch(`${API_BASE}/api/v1/seguridad/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json") ? await res.json() : { error: await res.text() };

      if (!res.ok) {
        setMsg(data?.error || `No se pudo registrar. Código ${res.status}`);
        btn.disabled = false;
        return;
      }

      setMsg("Cuenta creada correctamente. Redirigiendo…", true);
      setTimeout(() => { window.location.href = "/login.html"; }, 900);
    } catch (err) {
      setMsg("Error de conexión con el servidor.");
      btn.disabled = false;
    }
  });
});