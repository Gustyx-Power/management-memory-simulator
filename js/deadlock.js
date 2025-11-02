// deadlock.js - DEADLOCK DETECTION SIMULATOR

// --- STATE ---
let processes = [];
let resources = [];
let edges = [];
let isDeadlocked = false;

/**
 * Show/Hide Modals
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

/**
 * Run selected scenario
 */
function runScenario() {
    const scenario = document.getElementById('scenario').value;

    resetSimulation();

    switch(scenario) {
        case 'no-deadlock':
            runNoDeadlockScenario();
            break;
        case 'simple-deadlock':
            runSimpleDeadlockScenario();
            break;
        case 'circular-deadlock':
            runCircularDeadlockScenario();
            break;
        case 'complex-deadlock':
            runComplexDeadlockScenario();
            break;
    }

    renderGraph();
    detectDeadlock();
    updateStats();
}

/**
 * Scenario 1: No Deadlock (Safe State)
 */
function runNoDeadlockScenario() {
    processes = [
        { id: 'P1', name: 'Process 1', x: 150, y: 150 },
        { id: 'P2', name: 'Process 2', x: 150, y: 350 }
    ];

    resources = [
        { id: 'R1', name: 'Resource 1', x: 450, y: 150 },
        { id: 'R2', name: 'Resource 2', x: 450, y: 350 }
    ];

    edges = [
        { from: 'R1', to: 'P1', type: 'assignment' }, // R1 assigned to P1
        { from: 'R2', to: 'P2', type: 'assignment' }  // R2 assigned to P2
    ];

    isDeadlocked = false;
}

/**
 * Scenario 2: Simple Deadlock (2 processes)
 */
function runSimpleDeadlockScenario() {
    processes = [
        { id: 'P1', name: 'Process 1', x: 150, y: 200 },
        { id: 'P2', name: 'Process 2', x: 150, y: 350 }
    ];

    resources = [
        { id: 'R1', name: 'Resource 1', x: 450, y: 200 },
        { id: 'R2', name: 'Resource 2', x: 450, y: 350 }
    ];

    edges = [
        // P1 holds R1, requests R2
        { from: 'R1', to: 'P1', type: 'assignment' },
        { from: 'P1', to: 'R2', type: 'request' },

        // P2 holds R2, requests R1
        { from: 'R2', to: 'P2', type: 'assignment' },
        { from: 'P2', to: 'R1', type: 'request' }
    ];

    isDeadlocked = true;
}

/**
 * Scenario 3: Circular Deadlock (3 processes)
 */
function runCircularDeadlockScenario() {
    processes = [
        { id: 'P1', name: 'Process 1', x: 300, y: 100 },
        { id: 'P2', name: 'Process 2', x: 150, y: 400 },
        { id: 'P3', name: 'Process 3', x: 450, y: 400 }
    ];

    resources = [
        { id: 'R1', name: 'Resource 1', x: 300, y: 250 },
        { id: 'R2', name: 'Resource 2', x: 150, y: 250 },
        { id: 'R3', name: 'Resource 3', x: 450, y: 250 }
    ];

    edges = [
        // P1 holds R1, requests R2
        { from: 'R1', to: 'P1', type: 'assignment' },
        { from: 'P1', to: 'R2', type: 'request' },

        // P2 holds R2, requests R3
        { from: 'R2', to: 'P2', type: 'assignment' },
        { from: 'P2', to: 'R3', type: 'request' },

        // P3 holds R3, requests R1 (CIRCULAR!)
        { from: 'R3', to: 'P3', type: 'assignment' },
        { from: 'P3', to: 'R1', type: 'request' }
    ];

    isDeadlocked = true;
}

/**
 * Scenario 4: Complex Deadlock (4 processes)
 */
function runComplexDeadlockScenario() {
    processes = [
        { id: 'P1', name: 'Process 1', x: 100, y: 150 },
        { id: 'P2', name: 'Process 2', x: 100, y: 300 },
        { id: 'P3', name: 'Process 3', x: 500, y: 150 },
        { id: 'P4', name: 'Process 4', x: 500, y: 300 }
    ];

    resources = [
        { id: 'R1', name: 'Resource 1', x: 250, y: 100 },
        { id: 'R2', name: 'Resource 2', x: 350, y: 100 },
        { id: 'R3', name: 'Resource 3', x: 250, y: 350 },
        { id: 'R4', name: 'Resource 4', x: 350, y: 350 }
    ];

    edges = [
        // Complex circular wait
        { from: 'R1', to: 'P1', type: 'assignment' },
        { from: 'P1', to: 'R2', type: 'request' },

        { from: 'R2', to: 'P3', type: 'assignment' },
        { from: 'P3', to: 'R3', type: 'request' },

        { from: 'R3', to: 'P4', type: 'assignment' },
        { from: 'P4', to: 'R4', type: 'request' },

        { from: 'R4', to: 'P2', type: 'assignment' },
        { from: 'P2', to: 'R1', type: 'request' }
    ];

    isDeadlocked = true;
}

/**
 * Render Resource Allocation Graph
 */
function renderGraph() {
    const canvas = document.getElementById('graph-canvas');
    canvas.innerHTML = '';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '500');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';

    // Draw edges first (so they're behind nodes)
    edges.forEach(edge => {
        const fromNode = [...processes, ...resources].find(n => n.id === edge.from);
        const toNode = [...processes, ...resources].find(n => n.id === edge.to);

        if (fromNode && toNode) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', fromNode.x);
            line.setAttribute('y1', fromNode.y);
            line.setAttribute('x2', toNode.x);
            line.setAttribute('y2', toNode.y);

            if (edge.type === 'request') {
                line.setAttribute('stroke', '#3b82f6'); // Blue for request
                line.setAttribute('stroke-dasharray', '5,5');
            } else {
                line.setAttribute('stroke', '#10b981'); // Green for assignment
            }

            line.setAttribute('stroke-width', '2');
            line.setAttribute('marker-end', 'url(#arrowhead)');

            svg.appendChild(line);
        }
    });

    // Define arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#fff');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);

    canvas.appendChild(svg);

    // Draw processes (circles)
    processes.forEach(process => {
        const node = document.createElement('div');
        node.className = 'process-node absolute';
        node.style.left = `${process.x - 40}px`;
        node.style.top = `${process.y - 40}px`;
        node.innerHTML = `
            <div class="w-20 h-20 bg-blue-500 rounded-full flex flex-col items-center justify-center border-4 border-blue-400 shadow-lg ${isDeadlocked ? 'deadlock-detected' : ''}">
                <i class="fas fa-circle text-white text-xs mb-1"></i>
                <span class="text-white text-xs font-bold">${process.id}</span>
            </div>
        `;
        canvas.appendChild(node);
    });

    // Draw resources (squares)
    resources.forEach(resource => {
        const node = document.createElement('div');
        node.className = 'resource-node absolute';
        node.style.left = `${resource.x - 40}px`;
        node.style.top = `${resource.y - 40}px`;
        node.innerHTML = `
            <div class="w-20 h-20 bg-green-500 rounded-lg flex flex-col items-center justify-center border-4 border-green-400 shadow-lg ${isDeadlocked ? 'deadlock-detected' : ''}">
                <i class="fas fa-square text-white text-xs mb-1"></i>
                <span class="text-white text-xs font-bold">${resource.id}</span>
            </div>
        `;
        canvas.appendChild(node);
    });
}

/**
 * Detect Deadlock (simple cycle detection)
 */
function detectDeadlock() {
    const infoDiv = document.getElementById('deadlock-info');

    if (isDeadlocked) {
        infoDiv.innerHTML = `
            <div class="p-6 bg-red-500/20 border-2 border-red-500 rounded-xl animate-fade-in">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                        <i class="fas fa-exclamation-triangle text-white text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-xl font-bold text-red-300 mb-2">⚠️ DEADLOCK DETECTED!</h4>
                        <p class="text-white/80 mb-4">
                            Sistem terdeteksi dalam kondisi <strong>circular wait</strong>.
                            Semua proses saling menunggu resource yang dipegang proses lain.
                        </p>
                        <div class="bg-white/10 rounded-lg p-4">
                            <h5 class="text-white font-semibold mb-2">Solusi:</h5>
                            <ul class="text-sm text-white/70 space-y-1">
                                <li>• <strong>Preemption:</strong> Paksa release resource dari salah satu proses</li>
                                <li>• <strong>Kill Process:</strong> Terminate salah satu proses untuk break cycle</li>
                                <li>• <strong>Banker's Algorithm:</strong> Gunakan resource allocation yang safe</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('deadlock-status').textContent = 'DEADLOCK!';
        document.getElementById('deadlock-status').className = 'font-semibold text-red-400 animate-pulse-slow';

        setTimeout(() => {
            showNotification('⚠️ DEADLOCK TERDETEKSI! Sistem dalam kondisi circular wait.', 'danger');
        }, 500);

    } else {
        infoDiv.innerHTML = `
            <div class="p-6 bg-green-500/20 border-2 border-green-500 rounded-xl animate-fade-in">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-check-circle text-white text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-xl font-bold text-green-300 mb-2">✅ SAFE STATE</h4>
                        <p class="text-white/80">
                            Sistem dalam kondisi aman. Tidak ada circular wait detected.
                            Semua proses dapat menyelesaikan eksekusi tanpa deadlock.
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('deadlock-status').textContent = 'Safe';
        document.getElementById('deadlock-status').className = 'font-semibold text-green-400';

        setTimeout(() => {
            showNotification('✅ Sistem dalam kondisi SAFE. Tidak ada deadlock terdeteksi.', 'success');
        }, 500);
    }
}

/**
 * Update stats
 */
function updateStats() {
    document.getElementById('total-processes').textContent = processes.length;
    document.getElementById('total-resources').textContent = resources.length;
}

/**
 * Reset simulation
 */
function resetSimulation() {
    processes = [];
    resources = [];
    edges = [];
    isDeadlocked = false;

    const canvas = document.getElementById('graph-canvas');
    canvas.innerHTML = `
        <p class="text-white/50 text-center py-20">
            <i class="fas fa-play-circle text-6xl mb-4 block"></i>
            Pilih scenario dan klik "Run Scenario" untuk memulai simulasi
        </p>
    `;

    document.getElementById('deadlock-info').innerHTML = '';
    updateStats();
}

// Initialize
window.onload = () => {
    resetSimulation();
};

// Expose functions
window.runScenario = runScenario;
window.resetSimulation = resetSimulation;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.openInfoModal = openInfoModal;
window.closeInfoModal = closeInfoModal;
