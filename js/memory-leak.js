// memory-leak.js - MEMORY LEAK DETECTOR SIMULATOR

// --- CONSTANTS ---
const TOTAL_MEMORY = 1024; // 1024 MB
const TOTAL_BLOCKS = 256; // 256 blocks (each 4 MB)
const CHART_MAX_POINTS = 30;

// --- STATE ---
let usedMemory = 0;
let memoryBlocks = [];
let simulationInterval = null;
let isRunning = false;
let timeElapsed = 0;
let leakRate = 0;
let chartData = [];
let memoryChart = null;

/**
 * Initialize
 */
function initialize() {
    // Initialize memory blocks
    memoryBlocks = Array(TOTAL_BLOCKS).fill(0); // 0 = free, 1 = allocated

    // Initialize chart
    initializeChart();

    // Render blocks
    renderMemoryBlocks();
    updateStats();
}

/**
 * Initialize Chart.js
 */
function initializeChart() {
    const ctx = document.getElementById('memoryChart').getContext('2d');

    memoryChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Used Memory (MB)',
                data: [],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    beginAtZero: true,
                    max: TOTAL_MEMORY,
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

/**
 * Render memory blocks grid
 */
function renderMemoryBlocks() {
    const container = document.getElementById('memory-blocks');
    container.innerHTML = '';

    memoryBlocks.forEach((block, index) => {
        const div = document.createElement('div');
        div.className = 'memory-block w-6 h-6 rounded border-2 transition-all cursor-pointer';

        if (block === 0) {
            // Free
            div.className += ' bg-gray-700 border-gray-600';
        } else {
            // Allocated
            div.className += ' bg-orange-500 border-orange-400';
        }

        div.title = `Block ${index} | ${block === 0 ? 'Free' : 'Allocated'}`;
        container.appendChild(div);
    });
}

/**
 * Start simulation
 */
function startSimulation() {
    if (isRunning) {
        showNotification('⚠️ Simulasi sudah berjalan!', 'warning');
        return;
    }

    const scenario = document.getElementById('scenario').value;

    isRunning = true;
    timeElapsed = 0;

    // Set leak rate based on scenario
    switch(scenario) {
        case 'normal':
            leakRate = 0; // No leak
            showNotification('✅ Simulasi dimulai: Normal Usage (No Leak)', 'success');
            break;
        case 'slow-leak':
            leakRate = 2; // 2 MB/s
            showNotification('⚠️ Simulasi dimulai: Slow Memory Leak (2 MB/s)', 'warning');
            break;
        case 'fast-leak':
            leakRate = 5; // 5 MB/s
            showNotification('⚠️ Simulasi dimulai: Fast Memory Leak (5 MB/s)', 'warning');
            break;
        case 'critical-leak':
            leakRate = 10; // 10 MB/s
            showNotification('🚨 Simulasi dimulai: Critical Memory Leak (10 MB/s)', 'danger');
            break;
    }

    // Start interval
    simulationInterval = setInterval(() => {
        updateMemoryUsage();
        timeElapsed++;
    }, 1000); // Update every 1 second
}

/**
 * Update memory usage
 */
function updateMemoryUsage() {
    // Simulate memory allocation
    const normalUsage = Math.random() * 5; // Normal fluctuation 0-5 MB
    const leakAmount = leakRate; // Leak per second

    // Calculate new memory usage
    let newUsed = usedMemory + normalUsage + leakAmount;

    // Add some deallocation for normal scenario
    if (leakRate === 0) {
        const dealloc = Math.random() * 5;
        newUsed = Math.max(100, newUsed - dealloc); // Keep minimum 100 MB
    }

    // Cap at total memory
    newUsed = Math.min(TOTAL_MEMORY, newUsed);

    usedMemory = newUsed;

    // Update blocks
    const blocksToAllocate = Math.floor((usedMemory / TOTAL_MEMORY) * TOTAL_BLOCKS);
    for (let i = 0; i < TOTAL_BLOCKS; i++) {
        memoryBlocks[i] = i < blocksToAllocate ? 1 : 0;
    }

    // Update chart
    updateChart();

    // Render
    renderMemoryBlocks();
    updateStats();

    // Check for critical memory
    checkMemoryStatus();

    // Stop if memory full
    if (usedMemory >= TOTAL_MEMORY - 10) {
        stopSimulation();
        showCriticalAlert();
    }
}

/**
 * Update chart
 */
function updateChart() {
    const label = `${timeElapsed}s`;

    memoryChart.data.labels.push(label);
    memoryChart.data.datasets[0].data.push(usedMemory.toFixed(2));

    // Keep only last 30 points
    if (memoryChart.data.labels.length > CHART_MAX_POINTS) {
        memoryChart.data.labels.shift();
        memoryChart.data.datasets[0].data.shift();
    }

    memoryChart.update('none'); // Update without animation for performance
}

/**
 * Check memory status and show warnings
 */
function checkMemoryStatus() {
    const utilization = (usedMemory / TOTAL_MEMORY) * 100;
    const alertDiv = document.getElementById('leak-alert');

    if (utilization > 90) {
        // Critical
        alertDiv.className = 'glass rounded-2xl p-6 border-2 border-red-500 animate-slide-up leak-warning';
        alertDiv.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-exclamation-triangle text-white text-xl"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-xl font-bold text-red-300 mb-2">🚨 CRITICAL: Memory Almost Full!</h4>
                    <p class="text-white/80 mb-3">
                        Penggunaan memori mencapai <strong>${utilization.toFixed(1)}%</strong>.
                        System akan crash jika tidak segera ditangani!
                    </p>
                    <div class="bg-white/10 rounded-lg p-3">
                        <p class="text-white text-sm"><strong>Action Required:</strong></p>
                        <ul class="text-sm text-white/70 mt-2 space-y-1">
                            <li>• Hentikan proses yang bocor memori</li>
                            <li>• Restart aplikasi yang bermasalah</li>
                            <li>• Clear cache dan temporary files</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    } else if (utilization > 70) {
        // Warning
        alertDiv.className = 'glass rounded-2xl p-6 border-2 border-yellow-500 animate-slide-up';
        alertDiv.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-exclamation-circle text-white text-xl"></i>
                </div>
                <div class="flex-1">
                    <h4 class="text-xl font-bold text-yellow-300 mb-2">⚠️ WARNING: High Memory Usage</h4>
                    <p class="text-white/80">
                        Penggunaan memori mencapai <strong>${utilization.toFixed(1)}%</strong>.
                        Kemungkinan terjadi memory leak. Monitor terus penggunaan memori.
                    </p>
                </div>
            </div>
        `;
    } else {
        alertDiv.className = 'hidden';
    }
}

/**
 * Show critical alert when memory full
 */
function showCriticalAlert() {
    const alertDiv = document.getElementById('leak-alert');
    alertDiv.className = 'glass rounded-2xl p-6 border-2 border-red-500 animate-slide-up';
    alertDiv.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                <i class="fas fa-bomb text-white text-2xl"></i>
            </div>
            <div class="flex-1">
                <h4 class="text-2xl font-bold text-red-300 mb-2">💥 OUT OF MEMORY!</h4>
                <p class="text-white/80 mb-4">
                    Sistem kehabisan memori! Simulasi dihentikan. Ini adalah kondisi <strong>fatal</strong>
                    yang akan menyebabkan system crash atau aplikasi force-closed.
                </p>
                <div class="bg-white/10 rounded-lg p-4">
                    <h5 class="text-white font-semibold mb-2">Dampak di Real System:</h5>
                    <ul class="text-sm text-white/70 space-y-1">
                        <li>• <strong>OOMKiller:</strong> Linux akan kill proses yang paling banyak makan memori</li>
                        <li>• <strong>System Freeze:</strong> Sistem bisa hang/freeze karena thrashing</li>
                        <li>• <strong>Application Crash:</strong> Aplikasi akan crash dengan error "Out of Memory"</li>
                        <li>• <strong>Data Loss:</strong> Kemungkinan kehilangan data yang belum di-save</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    showNotification('💥 OUT OF MEMORY! Sistem kehabisan memori!', 'danger');
}

/**
 * Stop simulation
 */
function stopSimulation() {
    if (!isRunning) return;

    clearInterval(simulationInterval);
    isRunning = false;

    showNotification('⏸️ Simulasi dihentikan', 'info');
}

/**
 * Reset simulation
 */
function resetSimulation() {
    stopSimulation();

    usedMemory = 0;
    timeElapsed = 0;
    leakRate = 0;
    memoryBlocks = Array(TOTAL_BLOCKS).fill(0);

    // Reset chart
    memoryChart.data.labels = [];
    memoryChart.data.datasets[0].data = [];
    memoryChart.update();

    // Clear alert
    document.getElementById('leak-alert').className = 'hidden';
    document.getElementById('leak-alert').innerHTML = '';

    renderMemoryBlocks();
    updateStats();

    showNotification('🔄 Simulasi di-reset', 'info');
}

/**
 * Update statistics display
 */
function updateStats() {
    const freeMemory = TOTAL_MEMORY - usedMemory;
    const utilization = (usedMemory / TOTAL_MEMORY) * 100;

    document.getElementById('total-memory').textContent = `${TOTAL_MEMORY} MB`;
    document.getElementById('used-memory').textContent = `${usedMemory.toFixed(2)} MB`;
    document.getElementById('free-memory').textContent = `${freeMemory.toFixed(2)} MB`;
    document.getElementById('utilization').textContent = `${utilization.toFixed(1)}%`;
    document.getElementById('leak-rate').textContent = `${leakRate} MB/s`;

    // Status
    const statusEl = document.getElementById('leak-status');
    if (utilization > 90) {
        statusEl.textContent = 'CRITICAL!';
        statusEl.className = 'font-semibold text-red-400 animate-pulse-slow';
    } else if (utilization > 70) {
        statusEl.textContent = 'Warning';
        statusEl.className = 'font-semibold text-yellow-400';
    } else if (leakRate > 0) {
        statusEl.textContent = 'Leaking';
        statusEl.className = 'font-semibold text-orange-400';
    } else {
        statusEl.textContent = 'Normal';
        statusEl.className = 'font-semibold text-green-400';
    }

    // Update free memory color
    const freeEl = document.getElementById('free-memory');
    if (freeMemory < 100) {
        freeEl.className = 'font-semibold text-red-400';
    } else if (freeMemory < 300) {
        freeEl.className = 'font-semibold text-yellow-400';
    } else {
        freeEl.className = 'font-semibold text-green-400';
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const iconDiv = document.getElementById('notification-icon');
    const icon = iconDiv.querySelector('i');

    if (type === 'danger') {
        iconDiv.className = 'w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0';
        icon.className = 'fas fa-exclamation-triangle text-red-500 text-xl';
    } else if (type === 'success') {
        iconDiv.className = 'w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0';
        icon.className = 'fas fa-check-circle text-green-500 text-xl';
    } else if (type === 'warning') {
        iconDiv.className = 'w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0';
        icon.className = 'fas fa-exclamation-circle text-yellow-500 text-xl';
    } else {
        iconDiv.className = 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0';
        icon.className = 'fas fa-info-circle text-blue-500 text-xl';
    }

    document.getElementById('notification-message').innerText = message;
    document.getElementById('custom-notification').classList.remove('hidden');
}

function hideNotification() {
    document.getElementById('custom-notification').classList.add('hidden');
}

function openInfoModal() {
    document.getElementById('info-modal').classList.remove('hidden');
}

function closeInfoModal() {
    document.getElementById('info-modal').classList.add('hidden');
}

// Initialize on load
window.onload = initialize;

// Expose functions
window.startSimulation = startSimulation;
window.stopSimulation = stopSimulation;
window.resetSimulation = resetSimulation;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.openInfoModal = openInfoModal;
window.closeInfoModal = closeInfoModal;
