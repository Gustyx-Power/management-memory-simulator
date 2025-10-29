// hierarchy.js - MEMORY HIERARCHY SIMULATOR - FIXED VERSION

// --- KONSTANTA SIMULASI ---
const REGISTER_COUNT = 16;
const L1_CACHE_BLOCKS = 32;
const L2_CACHE_BLOCKS = 32;
const RAM_BLOCKS = 64;
const DISK_BLOCKS = 64;

// Access times (in nanoseconds, except disk in milliseconds)
const ACCESS_TIME = {
    register: 0.5,
    l1_cache: 1,
    l2_cache: 3,
    l3_cache: 10,
    ram: 100,
    disk: 10000000
};

// --- STATUS SIMULASI GLOBAL ---
let memoryHierarchy = {
    registers: [],
    l1Cache: [],
    l2Cache: [],
    ram: [],
    disk: []
};

let stats = {
    totalAccesses: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalAccessTime: 0
};

/**
 * Show notification
 */
function showNotification(message) {
    document.getElementById('notification-message').innerText = message;
    document.getElementById('custom-notification').classList.remove('hidden');
}

/**
 * Hide notification
 */
function hideNotification() {
    document.getElementById('custom-notification').classList.add('hidden');
}

/**
 * Open info modal
 */
function openInfoModal() {
    document.getElementById('info-modal').classList.remove('hidden');
}

/**
 * Close info modal
 */
function closeInfoModal() {
    document.getElementById('info-modal').classList.add('hidden');
}

/**
 * Initialize memory hierarchy
 */
function initializeMemory() {
    memoryHierarchy.registers = Array(REGISTER_COUNT).fill(null).map((_, i) => ({
        id: i,
        data: null,
        status: 'free'
    }));

    memoryHierarchy.l1Cache = Array(L1_CACHE_BLOCKS).fill(null).map((_, i) => ({
        id: i,
        data: null,
        status: 'free'
    }));

    memoryHierarchy.l2Cache = Array(L2_CACHE_BLOCKS).fill(null).map((_, i) => ({
        id: i,
        data: null,
        status: 'free'
    }));

    memoryHierarchy.ram = Array(RAM_BLOCKS).fill(null).map((_, i) => ({
        id: i,
        data: null,
        status: 'free'
    }));

    memoryHierarchy.disk = Array(DISK_BLOCKS).fill(null).map((_, i) => ({
        id: i,
        data: null,
        status: 'free'
    }));

    renderAllLevels();
    updateStats();
}

/**
 * Render all memory levels
 */
function renderAllLevels() {
    renderRegisters();
    renderL1Cache();
    renderL2Cache();
    renderRAM();
    renderDisk();
}

/**
 * Render Register level - FIXED
 */
function renderRegisters() {
    const container = document.getElementById('register-grid');
    container.innerHTML = '';

    memoryHierarchy.registers.forEach((reg) => {
        const cell = document.createElement('div');
        cell.className = 'memory-cell aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs font-bold cursor-pointer transition-all';

        if (reg.status === 'free') {
            cell.className += ' bg-gray-700/50 border-gray-600 text-gray-400';
        } else if (reg.status === 'active') {
            cell.className += ' bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/50';
        } else {
            cell.className += ' bg-purple-500/50 border-purple-500/50 text-white';
        }

        cell.innerHTML = `<span class="text-[10px]">R${reg.id}</span>`;
        cell.title = `Register ${reg.id} | ${reg.status}`;
        container.appendChild(cell);
    });
}

/**
 * Render L1 Cache - FIXED
 */
function renderL1Cache() {
    const container = document.getElementById('l1-cache-grid');
    container.innerHTML = '';

    memoryHierarchy.l1Cache.forEach((block) => {
        const cell = document.createElement('div');
        cell.className = 'memory-cell w-6 h-6 rounded border-2 transition-all cursor-pointer flex items-center justify-center';

        if (block.status === 'free') {
            cell.className += ' bg-gray-700 border-gray-600';
        } else if (block.status === 'active') {
            cell.className += ' bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50';
        } else {
            cell.className += ' bg-blue-500/50 border-blue-500/50';
        }

        cell.title = `L1 Block ${block.id} | ${block.status}`;
        container.appendChild(cell);
    });
}

/**
 * Render L2 Cache - FIXED
 */
function renderL2Cache() {
    const container = document.getElementById('l2-cache-grid');
    container.innerHTML = '';

    memoryHierarchy.l2Cache.forEach((block) => {
        const cell = document.createElement('div');
        cell.className = 'memory-cell w-6 h-6 rounded border-2 transition-all cursor-pointer flex items-center justify-center';

        if (block.status === 'free') {
            cell.className += ' bg-gray-700 border-gray-600';
        } else if (block.status === 'active') {
            cell.className += ' bg-cyan-500 border-cyan-400 shadow-lg shadow-cyan-500/50';
        } else {
            cell.className += ' bg-cyan-500/50 border-cyan-500/50';
        }

        cell.title = `L2 Block ${block.id} | ${block.status}`;
        container.appendChild(cell);
    });
}

/**
 * Render RAM
 */
function renderRAM() {
    const container = document.getElementById('ram-grid');
    container.innerHTML = '';

    memoryHierarchy.ram.forEach((block) => {
        const cell = document.createElement('div');
        cell.className = 'memory-cell aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all';

        if (block.status === 'free') {
            cell.className += ' bg-gray-700/50 border-gray-600 text-gray-400';
        } else if (block.status === 'active') {
            cell.className += ' bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/50';
        } else {
            cell.className += ' bg-green-500/50 border-green-500/50 text-white/70';
        }

        cell.innerHTML = `<span>${block.id}</span>`;
        cell.title = `RAM Block ${block.id} | ${block.status}`;
        container.appendChild(cell);
    });
}

/**
 * Render Disk
 */
function renderDisk() {
    const container = document.getElementById('disk-grid');
    container.innerHTML = '';

    memoryHierarchy.disk.forEach((block) => {
        const cell = document.createElement('div');
        cell.className = 'memory-cell aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all';

        if (block.status === 'free') {
            cell.className += ' bg-gray-700/50 border-gray-600 text-gray-400';
        } else if (block.status === 'active') {
            cell.className += ' bg-yellow-500 border-yellow-400 text-white shadow-lg shadow-yellow-500/50';
        } else {
            cell.className += ' bg-yellow-500/50 border-yellow-500/50 text-white/70';
        }

        cell.innerHTML = `<span>${block.id}</span>`;
        cell.title = `Disk Block ${block.id} | ${block.status}`;
        container.appendChild(cell);
    });
}

/**
 * Simulate memory access - FIXED: NO AUTO-RESET
 */
async function simulateMemoryAccess() {
    const dataSize = parseInt(document.getElementById('data-size').value);
    const startLevel = document.getElementById('start-level').value;

    stats.totalAccesses++;
    let accessTime = 0;
    let foundInCache = false;

    // Reset previous active states before new simulation
    resetActiveStates();
    renderAllLevels();

    // Wait a bit for reset to be visible
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate access flow based on start level
    if (startLevel === 'register') {
        // Data already in register - fastest
        await highlightLevel('register', 1500);
        accessTime = ACCESS_TIME.register;
        foundInCache = true;
        stats.cacheHits++;
        showNotification(`✅ Cache Hit! Data ditemukan di Register. Access time: ${accessTime.toFixed(2)} ns`);

    } else if (startLevel === 'cache') {
        // Check cache levels
        await highlightLevel('register', 500);
        await highlightArrow('arrow-1', 500);
        await highlightLevel('cache', 1500);

        // Random cache hit/miss (80% hit rate)
        if (Math.random() < 0.8) {
            accessTime = ACCESS_TIME.l1_cache;
            foundInCache = true;
            stats.cacheHits++;
            showNotification(`✅ Cache Hit! Data ditemukan di L1 Cache. Access time: ${accessTime.toFixed(2)} ns`);
        } else {
            // Cache miss - go to RAM
            await highlightArrow('arrow-2', 500);
            await highlightLevel('ram', 1500);
            accessTime = ACCESS_TIME.ram;
            stats.cacheMisses++;
            showNotification(`❌ Cache Miss! Data diambil dari RAM. Access time: ${accessTime.toFixed(2)} ns`);
        }

    } else if (startLevel === 'ram') {
        // Access from RAM (cold start)
        await highlightLevel('register', 300);
        await highlightArrow('arrow-1', 300);
        await highlightLevel('cache', 500);
        await highlightArrow('arrow-2', 500);
        await highlightLevel('ram', 1500);
        accessTime = ACCESS_TIME.ram;
        stats.cacheMisses++;
        showNotification(`⚠️ Data diambil dari RAM (Cold start). Access time: ${accessTime.toFixed(2)} ns`);

    } else if (startLevel === 'disk') {
        // Full hierarchy traversal - slowest (page fault)
        await highlightLevel('register', 300);
        await highlightArrow('arrow-1', 300);
        await highlightLevel('cache', 500);
        await highlightArrow('arrow-2', 500);
        await highlightLevel('ram', 800);
        await highlightArrow('arrow-3', 800);
        await highlightLevel('disk', 2000);
        accessTime = ACCESS_TIME.disk;
        stats.cacheMisses++;
        showNotification(`🐌 Page Fault! Data diambil dari Disk (sangat lambat). Access time: ${(accessTime / 1000000).toFixed(2)} ms`);
    }

    stats.totalAccessTime += accessTime;
    updateStats();

    // NO AUTO-RESET - user can see the result!
    // User must manually click Reset button
}

/**
 * Highlight specific level
 */
async function highlightLevel(level, duration) {
    const levelMap = {
        'register': memoryHierarchy.registers,
        'cache': [...memoryHierarchy.l1Cache, ...memoryHierarchy.l2Cache],
        'ram': memoryHierarchy.ram,
        'disk': memoryHierarchy.disk
    };

    const blocks = levelMap[level];
    if (blocks) {
        // Mark 3-5 random blocks as active for better visualization
        const numBlocks = Math.min(Math.floor(Math.random() * 3) + 3, blocks.length);
        const indices = [];

        while (indices.length < numBlocks) {
            const idx = Math.floor(Math.random() * blocks.length);
            if (!indices.includes(idx)) {
                indices.push(idx);
                blocks[idx].status = 'active';
            }
        }

        renderAllLevels();
    }

    return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Highlight arrow with animation
 */
async function highlightArrow(arrowId, duration) {
    const arrow = document.getElementById(arrowId);
    if (arrow) {
        const icon = arrow.querySelector('i');
        const text = arrow.querySelector('p');

        // Add highlight classes
        icon.classList.add('animate-data-flow', 'text-white');
        text.classList.add('text-white', 'font-bold');

        // Remove highlight after duration
        setTimeout(() => {
            icon.classList.remove('animate-data-flow', 'text-white');
            text.classList.remove('text-white', 'font-bold');
        }, duration);
    }

    return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Reset all active states
 */
function resetActiveStates() {
    memoryHierarchy.registers.forEach(r => r.status = 'free');
    memoryHierarchy.l1Cache.forEach(c => c.status = 'free');
    memoryHierarchy.l2Cache.forEach(c => c.status = 'free');
    memoryHierarchy.ram.forEach(r => r.status = 'free');
    memoryHierarchy.disk.forEach(d => d.status = 'free');
}

/**
 * Update statistics display
 */
function updateStats() {
    document.getElementById('total-accesses').textContent = stats.totalAccesses;
    document.getElementById('cache-hits').textContent = stats.cacheHits;
    document.getElementById('cache-misses').textContent = stats.cacheMisses;

    const hitRate = stats.totalAccesses > 0
        ? ((stats.cacheHits / stats.totalAccesses) * 100).toFixed(1)
        : 0;
    document.getElementById('hit-rate').textContent = `${hitRate}%`;

    const avgTime = stats.totalAccesses > 0
        ? (stats.totalAccessTime / stats.totalAccesses).toFixed(2)
        : 0;

    // Format time appropriately
    let timeDisplay;
    if (avgTime < 1000) {
        timeDisplay = `${avgTime} ns`;
    } else if (avgTime < 1000000) {
        timeDisplay = `${(avgTime / 1000).toFixed(2)} μs`;
    } else {
        timeDisplay = `${(avgTime / 1000000).toFixed(2)} ms`;
    }

    document.getElementById('avg-time').textContent = timeDisplay;
}

/**
 * Reset simulation
 */
function resetSimulation() {
    stats = {
        totalAccesses: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalAccessTime: 0
    };

    resetActiveStates();
    renderAllLevels();
    updateStats();

    showNotification('🔄 Simulasi telah direset ke kondisi awal!');
}

// Initialize on load
window.onload = initializeMemory;

// Expose functions to global scope
window.simulateMemoryAccess = simulateMemoryAccess;
window.resetSimulation = resetSimulation;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.openInfoModal = openInfoModal;
window.closeInfoModal = closeInfoModal;
