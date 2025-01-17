const montoInput = document.querySelector("#monto");
const monedaSelect = document.querySelector("#moneda");
const convertirBtn = document.querySelector("#convertir");
const resultadoTxt = document.querySelector("#resultado");
const graficoCanvas = document.querySelector("#grafico");

let graficoActivo = null;

const obtenerDatosMonedas = async () => {
    try {
        const respuesta = await fetch("https://mindicador.cl/api");
        if (!respuesta.ok) {
            throw new Error("No se obtuvo información de Api.");
        }
        const data = await respuesta.json();
        return data;
    } catch (error) {
        resultadoTxt.textContent = `Error: ${error.message}`;
        throw error;
    }
};

const obtenerHistorico = async (moneda) => {
    try {
        const respuesta = await fetch(`https://mindicador.cl/api/${moneda}`);
        if (!respuesta.ok) {
            throw new Error("No se obtuvo histórico.");
        }
        const data = await respuesta.json();
        return data.serie.slice(0, 10);
    } catch (error) {
        resultadoTxt.textContent = `Error: ${error.message}`;
        throw error;
    }
};

const crearGrafico = (etiquetas, valores) => {
    if (graficoActivo) {
        graficoActivo.destroy();
    }

    const ctx = graficoCanvas.getContext("2d");
    graficoActivo = new Chart(ctx, {
        type: "line",
        data: {
            labels: etiquetas,
            datasets: [
                {
                    label: "Historial últimos 10 días",
                    data: valores,
                    borderColor: "rgb(186, 82, 255)",
                    backgroundColor: "rgba(227, 243, 6, 0.2)",
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                },
            },
        },
    });
};

const actualizarGrafico = async (moneda) => {
  const historico = await obtenerHistorico(moneda);
  const etiquetas = historico
   .map((dato) => new Date(dato.fecha).toLocaleDateString())
   .reverse();
  const valores = historico.map((dato) => dato.valor).reverse();
  crearGrafico(etiquetas, valores);
};

monedaSelect.addEventListener("change", async () => {
    const moneda = monedaSelect.value;
    await actualizarGrafico(moneda);
});

convertirBtn.addEventListener("click", async () => {
    const monto = parseFloat(montoInput.value);
    const moneda = monedaSelect.value;

    if (isNaN(monto) || monto <= 0) {
        resultadoTxt.textContent = "Debes ingresar un monto válido.";
        return;
    }

    const datos = await obtenerDatosMonedas();
    const valorMoneda = datos[moneda]?.valor;

    if (!valorMoneda) {
        resultadoTxt.textContent = "No se pudo obtener el valor de la divisa.";
        return;
    }

    const resultado = monto / valorMoneda;
    resultadoTxt.textContent = `El monto equivale a ${resultado.toFixed(
        2
    )} ${moneda === "dolar" ? "dólares" : "euros"}.`;

    await actualizarGrafico(moneda);
});


