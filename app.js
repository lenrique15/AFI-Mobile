function mostrarHistorial() {

    let movimientos = JSON.parse(
        localStorage.getItem("afi_movimientos") || "[]"
    );

    let html = "";

    movimientos.slice().reverse().forEach(m => {

        html += `
            <div style="
                border:1px solid #ddd;
                border-radius:10px;
                padding:10px;
                margin-top:10px;
                background:white;
            ">
                <strong>$${m.monto}</strong><br>
                ${m.categoria}<br>
                ${m.concepto}
            </div>
        `;
    });

    document.getElementById("historial").innerHTML = html;
}

async function guardarMovimiento() {

    const monto = document.getElementById("monto").value.trim();
    const categoria = document.getElementById("categoria").value.trim();
    const concepto = document.getElementById("concepto").value.trim();

    const capturista =
        document.getElementById("capturista").value;

    const tipo =
        document.getElementById

    if (!monto) {
        alert("Capture un monto");
        return;
    }

    if (!categoria) {
        alert("Capture una categoría");
        return;
    }

    const ahora = new Date();

    const movimiento = {
        fecha: ahora.toLocaleDateString("es-MX"),
        hora: ahora.toLocaleTimeString("es-MX"),
        capturista: capturista,
        tipo: tipo,
        categoria: categoria,
        concepto: concepto,
        monto: Number(monto),
        sincronizado:false
    };

    let movimientos = JSON.parse(
        localStorage.getItem("afi_movimientos") || "[]"
    );

    movimientos.push(movimiento);

    //exportarMovimientoIndividual(movimiento);

    localStorage.setItem(
        "afi_movimientos",
        JSON.stringify(movimientos)
    );

    try {

        const respuesta = await fetch(
            "https://script.google.com/macros/s/AKfycbw_DWQY70yw7R4FxcaWzvZVlVt3LRjzNvJQEp9dnT4bhBhwWK8hTFdIFvTHrbmwk1c9/exec",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(movimiento)
            }
        );

        const resultado = await respuesta.json();

        if (resultado.ok) {
            document.getElementById("mensaje").innerText =
                "✅ Guardado y sincronizado";
        }

    } catch (error) {

        document.getElementById("mensaje").innerText =
            "⚠ Guardado localmente. Sin conexión.";

        console.error(error);
    }

    document.getElementById("monto").value = "";
    document.getElementById("categoria").value = "";
    document.getElementById("concepto").value = "";

    mostrarHistorial();
}

function exportarMovimientos() {

    let movimientos = JSON.parse(
        localStorage.getItem("afi_movimientos") || "[]"
    );

    let pendientes = movimientos.filter(
        m => m.sincronizado !== true
    );

    if (pendientes.length === 0) {
        alert("No hay movimientos pendientes para exportar.");
        return;
    }

    const contenido = JSON.stringify(
        pendientes,
        null,
        4
    );

    const capturista =
        document.getElementById("capturista").value;

    const nombreArchivo =
        `AFI_PENDIENTES_${capturista.toUpperCase()}.json`;

    const archivo = new File(
        [contenido],
        nombreArchivo,
        {
            type: "application/json"
        }
    );

    if (navigator.share) {

        navigator.share({
            title: "AFI Pendientes",
            text: "Movimientos pendientes AFI",
            files: [archivo]
        });

    } else {

        const url = URL.createObjectURL(archivo);

        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = nombreArchivo;

        document.body.appendChild(enlace);

        enlace.click();

        document.body.removeChild(enlace);

        URL.revokeObjectURL(url);
    }

    movimientos.forEach(m => {

        if (m.sincronizado !== true) {
            m.sincronizado = true;
        }

    });

    localStorage.setItem(
        "afi_movimientos",
        JSON.stringify(movimientos)
    );

    document.getElementById("mensaje").innerText =
        `✅ ${pendientes.length} movimientos exportados`;
}

function seleccionarCategoria(categoria) {
    document.getElementById("categoria").value = categoria;
}

function exportarMovimientoIndividual(movimiento) {

    const fechaArchivo =
        new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .replace("T", "_")
            .substring(0, 15);

    const nombreArchivo =
        `AFI_${fechaArchivo}_${movimiento.capturista.toUpperCase()}.json`;

    const contenido = JSON.stringify(
        movimiento,
        null,
        4
    );

    const blob = new Blob(
        [contenido],
        {
            type: "application/json"
        }
    );

    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombreArchivo;

    document.body.appendChild(enlace);

    enlace.click();

    document.body.removeChild(enlace);

    URL.revokeObjectURL(url);
}