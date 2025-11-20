/* =========================================================
   SIDEBAR TOGGLE
========================================================= */
const sidebar = document.getElementById("sidebarMenu");
const sidebarToggle = document.getElementById("sidebarToggle");

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("closed");
});

/* =========================================================
   DARK MODE TOGGLE
========================================================= */
const darkToggle = document.getElementById("darkToggle");

darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

/* =========================================================
   CSV UPLOAD
========================================================= */
const sidebarFileInput = document.getElementById("fileInput");
const sidebarDropzone = document.getElementById("dropzone");

const welcomeUploadBtn = document.getElementById("uploadCSVWelcome");
const welcomeFileInput = document.getElementById("csvMainInput");
const welcomeFileName = document.getElementById("csvFileName");

let csvData = [];
let headers = [];

/* --- Shared function to process CSV --- */
function handleCSV(file) {
    if (!file) return;

    Papa.parse(file, {
        complete: function(result) {
            let rows = result.data.filter(r => r.length > 1);
            headers = rows[0];
            csvData = rows.slice(1);

            populateDropdowns();
            buildTable();
        }
    });
}

/* --- Sidebar drag & drop --- */
if (sidebarDropzone) {
    sidebarDropzone.addEventListener("dragover", e => {
        e.preventDefault();
        sidebarDropzone.classList.add("active");
    });

    sidebarDropzone.addEventListener("dragleave", () => {
        sidebarDropzone.classList.remove("active");
    });

    sidebarDropzone.addEventListener("drop", e => {
        e.preventDefault();
        sidebarDropzone.classList.remove("active");
        handleCSV(e.dataTransfer.files[0]);
    });
}

/* --- Sidebar browse --- */
if (sidebarFileInput) {
    sidebarFileInput.addEventListener("change", () => {
        handleCSV(sidebarFileInput.files[0]);
    });
}

/* --- Welcome block upload --- */
welcomeUploadBtn.addEventListener("click", () => welcomeFileInput.click());

welcomeFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only CSV allowed
    if (file.type !== "text/csv") {
        alert("Only CSV files are allowed!");
        welcomeFileInput.value = "";
        welcomeFileName.textContent = "";
        return;
    }

    // Update file name display
    welcomeFileName.textContent = file.name;

    // Process CSV
    handleCSV(file);
});

/* =========================================================
   POPULATE X/Y DROPDOWNS
========================================================= */
const xSelect = document.getElementById("xSelect");
const ySelect = document.getElementById("ySelect");

function populateDropdowns() {
    xSelect.innerHTML = `<option value="">— choose —</option>`;
    ySelect.innerHTML = `<option value="">— choose —</option>`;

    headers.forEach(h => {
        xSelect.innerHTML += `<option value="${h}">${h}</option>`;
        ySelect.innerHTML += `<option value="${h}">${h}</option>`;
    });
}

/* =========================================================
   RENDER CHARTS
========================================================= */
let lineChart, barChart, pieChart;

document.getElementById("renderBtn").addEventListener("click", () => {
    const xCol = xSelect.value;
    const yCol = ySelect.value;

    if (!xCol || !yCol) {
        alert("Select both X and Y columns!");
        return;
    }

    const xIndex = headers.indexOf(xCol);
    const yIndex = headers.indexOf(yCol);

    const labels = csvData.map(r => r[xIndex]);
    const values = csvData.map(r => Number(r[yIndex]));

    if (lineChart) lineChart.destroy();
    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    // Line Chart
    lineChart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: `${yCol} vs ${xCol}`,
                data: values,
                borderWidth: 2
            }]
        }
    });

    // Bar Chart
    barChart = new Chart(document.getElementById("barChart"), {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: `${yCol} vs ${xCol}`,
                data: values,
                borderWidth: 2
            }]
        }
    });

    // Pie Chart (Top 5)
    pieChart = new Chart(document.getElementById("pieChart"), {
        type: "pie",
        data: {
            labels: labels.slice(0, 5),
            datasets: [{
                data: values.slice(0, 5)
            }]
        }
    });
});

/* =========================================================
   BUILD DATA PREVIEW TABLE
========================================================= */
function buildTable() {
    const wrap = document.getElementById("tableWrap");
    if (!csvData.length) {
        wrap.innerHTML = `<p class="muted">No data loaded.</p>`;
        return;
    }

    let html = `<table><thead><tr>`;
    headers.forEach(h => html += `<th>${h}</th>`);
    html += `</tr></thead><tbody>`;

    csvData.forEach(row => {
        html += `<tr>`;
        row.forEach(col => html += `<td>${col}</td>`);
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    wrap.innerHTML = html;
}

/* =========================================================
   DOWNLOAD CSV (same file)
========================================================= */
document.getElementById("downloadCSV").addEventListener("click", () => {
    if (!csvData.length) return;

    let csvContent = [headers.join(","), ...csvData.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "DataViz_output.csv";
    a.click();
});
