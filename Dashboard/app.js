// PEGA AQUÍ TU URL DE GOOGLE APPS SCRIPT PARA QUE QUEDE FIJA (Entre las comillas):
const SCRIPT_URL_FIJA = 'https://script.google.com/macros/s/AKfycbxBTn9ROJxx7cq2GDHoJbqpGUbD4dOTAnkHoyY5JBOOuuxkJ8fjguHdsKJ2oYYRrnyQjg/exec';

let globalData = [];
let charts = {};

// Elementos del DOM
const modal = document.getElementById('setup-modal');
const loader = document.getElementById('loader');
const btnSave = document.getElementById('btn-save-url');
const btnDemo = document.getElementById('btn-demo');
const inputUrl = document.getElementById('api-url-input');
const btnRefresh = document.getElementById('refresh-btn');
const commerceList = document.getElementById('commerce-list');
const dashboardTitle = document.getElementById('dashboard-title');
const tableBody = document.getElementById('table-body');
const tableHead = document.getElementById('table-head-row');

// Init
document.addEventListener('DOMContentLoaded', () => {
    const savedUrl = SCRIPT_URL_FIJA || localStorage.getItem('bas_sheet_url');
    if (savedUrl) {
        modal.classList.add('hidden');
        fetchData(savedUrl);
    } else {
        loader.classList.add('hidden');
        modal.classList.remove('hidden');
    }
});

btnSave.addEventListener('click', () => {
    const url = inputUrl.value.trim();
    if (url.startsWith('https://script.google.com/')) {
        localStorage.setItem('bas_sheet_url', url);
        modal.classList.add('hidden');
        loader.classList.remove('hidden');
        fetchData(url);
    } else {
        alert('Por favor inserta una URL válida de Google Apps Script');
    }
});

btnDemo.addEventListener('click', () => {
    modal.classList.add('hidden');
    loader.classList.remove('hidden');
    setTimeout(() => {
        globalData = generateDemoData();
        processAndRender(globalData);
        loader.classList.add('hidden');
    }, 800);
});

btnRefresh.addEventListener('click', () => {
    const savedUrl = SCRIPT_URL_FIJA || localStorage.getItem('bas_sheet_url');
    if (savedUrl) {
        loader.classList.remove('hidden');
        fetchData(savedUrl);
    } else {
        globalData = generateDemoData();
        processAndRender(globalData);
    }
});

function fetchData(url) {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                globalData = data;
                processAndRender(data);
            } else {
                alert('La hoja está vacía o el array es inválido.');
            }
        })
        .catch(err => {
            console.error(err);
            alert('Error conectando a la API: ' + err.message);
        })
        .finally(() => {
            loader.classList.add('hidden');
        });
}

function processAndRender(data, filterCommerce = 'all') {
    // Helpers para identificar las propiedes sin importar diferencias de mayusculas
    const getVal = (row, keyMatch) => {
        const key = Object.keys(row).find(k => k.toLowerCase().includes(keyMatch));
        return key ? row[key] : 'N/A';
    };

    let filtered = data;
    if (filterCommerce !== 'all') {
        filtered = data.filter(row => getVal(row, 'comercio') === filterCommerce);
        dashboardTitle.innerText = `Rendimiento: ${filterCommerce}`;
    } else {
        dashboardTitle.innerText = `Visión Global Anual`;
    }

    // 1. KPIs
    let views = 0;
    let clicks = 0;
    const comerciosSet = new Set();

    filtered.forEach(row => {
        const evt = getVal(row, 'event').toLowerCase() + getVal(row, 'evento').toLowerCase();
        const comercio = getVal(row, 'comercio');

        if (evt.includes('view') || evt.includes('vista')) views++;
        if (evt.includes('click') || evt.includes('clic')) clicks++;
        if (comercio && comercio !== 'N/A') comerciosSet.add(comercio);
    });

    document.getElementById('kpi-views').innerText = views;
    document.getElementById('kpi-clicks').innerText = clicks;
    document.getElementById('kpi-commerces').innerText = filterCommerce === 'all' ? comerciosSet.size : 1;

    let cr = (views > 0) ? ((clicks / views) * 100).toFixed(1) : 0;
    document.getElementById('kpi-cr').innerText = `${cr}%`;

    // 2. Render Sidebar Menú
    if (filterCommerce === 'all') {
        renderSidebar(Array.from(comerciosSet));
    }

    // 3. Procesar Gráficos
    renderCharts(filtered, getVal);

    // 4. Procesar Tabla
    renderTable(filtered, getVal);
}

function renderSidebar(comercios) {
    commerceList.innerHTML = `<li class="nav-item active" data-commerce="all">
        <i class="ph ph-globe-hemisphere-west"></i> Visión Global
    </li>`;

    comercios.forEach(com => {
        const li = document.createElement('li');
        li.className = 'nav-item';
        li.dataset.commerce = com;
        li.innerHTML = `<i class="ph ph-storefront"></i> ${com}`;
        commerceList.appendChild(li);
    });

    // Listeners
    document.querySelectorAll('.nav-item').forEach(el => {
        el.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            e.currentTarget.classList.add('active');
            processAndRender(globalData, e.currentTarget.dataset.commerce);
        });
    });
}

function renderCharts(data, getVal) {
    // Preparar Data Line Chart (Por fecha)
    const datesMap = {};
    data.forEach(row => {
        let tsRaw = getVal(row, 'timestamp');
        if (tsRaw === 'N/A') tsRaw = getVal(row, 'fecha');
        if (tsRaw === 'N/A') tsRaw = getVal(row, 'marca');
        
        // Extraer formato general de fecha
        let ts = tsRaw !== 'N/A' ? tsRaw.split(',')[0].split(' ')[0] : 'Desconocida';
        
        if (!datesMap[ts]) datesMap[ts] = { views: 0, clicks: 0 };

        let evt = getVal(row, 'event').toLowerCase() + getVal(row, 'evento').toLowerCase();
        if (evt.includes('view') || evt.includes('vista')) datesMap[ts].views++;
        if (evt.includes('click') || evt.includes('clic')) datesMap[ts].clicks++;
    });

    const labelsLine = Object.keys(datesMap).slice(-15); // Últimos 15 días
    const dataViews = labelsLine.map(date => datesMap[date].views);
    const dataClicks = labelsLine.map(date => datesMap[date].clicks);

    // Preparar Data Doughnut (Trozos por comercio) - Solo vistas
    const commerceMap = {};
    data.forEach(row => {
        let com = getVal(row, 'comercio');
        let evt = getVal(row, 'event').toLowerCase() + getVal(row, 'evento').toLowerCase();
        if (evt.includes('view') || evt.includes('vista')) {
            if (!commerceMap[com]) commerceMap[com] = 0;
            commerceMap[com]++;
        }
    });

    // Destruir gráficos anteriores
    if (charts.timeline) charts.timeline.destroy();
    if (charts.doughnut) charts.doughnut.destroy();

    // Chart Line Default Config
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    const ctxLine = document.getElementById('timelineChart').getContext('2d');
    charts.timeline = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: labelsLine,
            datasets: [
                {
                    label: 'Visitas',
                    data: dataViews,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Clicks',
                    data: dataClicks,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
    });

    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    charts.doughnut = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: Object.keys(commerceMap),
            datasets: [{
                data: Object.values(commerceMap),
                backgroundColor: ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444', '#ec4899'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { position: 'right' } }
        }
    });
}

function renderTable(data, getVal) {
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (data.length === 0) return;

    // Solo extraemos cabeceras "relevantes" para mostrar
    const headers = ['comercio', 'event', 'timestamp', 'ipvisitante', 'ciudad', 'userAgent'];
    // Si no existen exactamente, mostramos las primeras 6 propiedades del objeto
    const objKeys = Object.keys(data[0]);
    let showKeys = headers.filter(h => objKeys.find(k => k.toLowerCase().includes(h.toLowerCase())));
    if (showKeys.length === 0) showKeys = objKeys.slice(0, 6);

    showKeys.forEach(k => {
        let th = document.createElement('th');
        th.innerText = k.toUpperCase().replace('_', ' ');
        tableHead.appendChild(th);
    });

    // Mostrar los últimos 10 de reversa (más recientes primero)
    const recentData = data.slice(-10).reverse();
    document.getElementById('table-count').innerText = `Mostrando ${recentData.length} registros recientes`;

    recentData.forEach(row => {
        let tr = document.createElement('tr');
        showKeys.forEach(key => {
            let td = document.createElement('td');
            let val = getVal(row, key) || '-';

            // Formateo estético de eventos
            if (key.toLowerCase().includes('event')) {
                let badgeClass = val.toLowerCase().includes('click') ? 'tag-click' : 'tag-event';
                val = `<span class="${badgeClass}">${val}</span>`;
            }
            // Truncar User Agent si es muy largo
            if (val.length > 40 && !val.includes('span')) {
                val = val.substring(0, 40) + '...';
            }

            td.innerHTML = val;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Generador de Test (Mock)
function generateDemoData() {
    const arr = [];
    const comercios = ['Almacen Lila', 'Erica Cookies', 'Como en Casa', 'Dietetica Natural'];
    const evts = ['page_view', 'page_view', 'page_view', 'cta_click'];

    for (let i = 0; i < 60; i++) {
        let day = Math.floor(Math.random() * 15) + 1;
        arr.push({
            "Comercio": comercios[Math.floor(Math.random() * comercios.length)],
            "Event": evts[Math.floor(Math.random() * evts.length)],
            "IP Visitante": "192.168.1." + Math.floor(Math.random() * 200),
            "Timestamp": `2026-04-${day.toString().padStart(2, '0')}, 10:15:00 hs. (ART)`,
            "User Agent": "Mozilla/5.0 Windows NT 10.0"
        });
    }
    // Ordenar cronológicamente para el mock
    return arr.sort((a, b) => a.Timestamp.localeCompare(b.Timestamp));
}
