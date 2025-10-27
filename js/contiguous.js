// contiguous.js

// --- KONSTANTA SIMULASI ---
const TOTAL_MEMORY_KB = 1024;
const UNIT_SIZE_KB = 16;
const TOTAL_BLOCKS = TOTAL_MEMORY_KB / UNIT_SIZE_KB; // 64 blocks (8x8)

// --- STATUS SIMULASI GLOBAL ---
let memoryBlocks = []; // Array of Block objects
let nextProcessId = 1;

/**
 * Menampilkan notifikasi pop-up custom.
 * @param {string} message - Pesan yang akan ditampilkan.
 */
function showNotification(message) {
  document.getElementById("notification-message").innerText = message;
  document.getElementById("custom-notification").classList.remove("hidden");
}

/**
 * Menyembunyikan notifikasi pop-up.
 */
function hideNotification() {
  document.getElementById("custom-notification").classList.add("hidden");
}

/**
 * Open Auto Test Modal
 */
function openAutoTestModal() {
  document.getElementById("auto-test-modal").classList.remove("hidden");
}

/**
 * Close Auto Test Modal
 */
function closeAutoTestModal() {
  document.getElementById("auto-test-modal").classList.add("hidden");
}

/**
 * Run Auto Test - Scenario
 */
function runAutoTest(scenario) {
  // Reset memory first
  resetMemory();

  closeAutoTestModal();

  if (scenario === 'no-frag') {
    // Scenario: No Fragmentation
    setTimeout(() => {
      autoAddProcess(200, 'P1');
    }, 300);

    setTimeout(() => {
      autoAddProcess(300, 'P2');
    }, 600);

    setTimeout(() => {
      autoAddProcess(150, 'P3');
    }, 900);

    setTimeout(() => {
      showNotification("✅ Test 'No Fragmentation' selesai! Semua proses berurutan tanpa gap.");
    }, 1200);

  } else if (scenario === 'with-frag') {
    // Scenario: With Fragmentation
    setTimeout(() => {
      autoAddProcess(100, 'P1');
    }, 300);

    setTimeout(() => {
      autoAddProcess(150, 'P2');
    }, 600);

    setTimeout(() => {
      autoAddProcess(100, 'P3');
    }, 900);

    setTimeout(() => {
      autoAddProcess(150, 'P4');
    }, 1200);

    setTimeout(() => {
      autoAddProcess(100, 'P5');
    }, 1500);

    // Deallocate P2 and P4 to create fragmentation
    setTimeout(() => {
      deallocateProcess('P2');
    }, 2000);

    setTimeout(() => {
      deallocateProcess('P4');
    }, 2300);

    setTimeout(() => {
      showNotification("⚠️ Test 'With Fragmentation' selesai! Ada 2 gap free memory yang tersebar.");
    }, 2600);
  }
}

/**
 * Auto add process (for testing)
 */
function autoAddProcess(sizeKB, processId) {
  let allocated = false;

  for (let i = 0; i < memoryBlocks.length; i++) {
    const block = memoryBlocks[i];

    if (block.status === "free" && block.sizeKB >= sizeKB) {
      const remainingSize = block.sizeKB - sizeKB;

      const allocatedBlock = {
        startAddress: block.startAddress,
        sizeKB: sizeKB,
        status: "allocated",
        processId: processId,
      };

      memoryBlocks.splice(i, 1, allocatedBlock);

      if (remainingSize > 0) {
        const remainingBlock = {
          startAddress: block.startAddress + sizeKB,
          sizeKB: remainingSize,
          status: "free",
        };
        memoryBlocks.splice(i + 1, 0, remainingBlock);
      }

      allocated = true;
      nextProcessId++;
      break;
    }
  }

  if (allocated) {
    renderGridView();
    renderProcessList();
    updateStats();
  }
}

/**
 * Render Grid View (8x8 = 64 cells)
 * Setiap cell = 16 KB
 */
function renderGridView() {
  const gridContainer = document.getElementById('memory-grid');
  gridContainer.innerHTML = '';

  // Create a flat array representing all 64 cells
  let cellArray = [];

  memoryBlocks.forEach((block) => {
    const numCells = Math.round(block.sizeKB / UNIT_SIZE_KB);
    const color = block.status === 'free' ? '#4b5563' : getColorForProcess(block.processId);
    const label = block.status === 'free' ? 'F' : block.processId.replace('P', '');

    for (let i = 0; i < numCells; i++) {
      cellArray.push({
        color: color,
        label: i === 0 ? label : '', // Only first cell shows label
        processId: block.processId || 'Free',
        sizeKB: block.sizeKB,
        status: block.status,
        cellIndex: i
      });
    }
  });

  // Fill remaining cells if needed (safety check)
  while (cellArray.length < TOTAL_BLOCKS) {
    cellArray.push({
      color: '#374151',
      label: '',
      processId: 'Empty',
      sizeKB: UNIT_SIZE_KB,
      status: 'empty',
      cellIndex: 0
    });
  }

  // Render all 64 cells in 8x8 grid
  cellArray.forEach((cellData, index) => {
    const cell = document.createElement('div');
    cell.className = 'grid-cell rounded-lg border-2 border-white/30 flex items-center justify-center text-sm font-bold cursor-pointer transition-all';
    cell.style.backgroundColor = cellData.color;

    // Add tooltip data
    const row = Math.floor(index / 8) + 1;
    const col = (index % 8) + 1;
    const tooltipText = `Cell [${row},${col}] | ${cellData.processId} | ${cellData.status === 'free' ? 'Available' : 'Used'}`;
    cell.setAttribute('data-tooltip', tooltipText);
    cell.title = tooltipText;

    // Add label (process number or 'F' for free)
    if (cellData.label) {
      cell.innerHTML = `<span class="text-white drop-shadow-lg">${cellData.label}</span>`;
    }

    // Add pulse animation for allocated cells
    if (cellData.status === 'allocated' && cellData.cellIndex === 0) {
      cell.classList.add('animate-pulse-slow');
    }

    gridContainer.appendChild(cell);
  });

  // Update fragmentation info
  updateFragmentationInfo();
}

// Fungsi pembantu untuk pewarnaan
function getColorForProcess(id) {
  const colors = [
    "#3498db", // Blue
    "#2ecc71", // Green
    "#e74c3c", // Red
    "#f1c40f", // Yellow
    "#9b59b6", // Purple
    "#1abc9c", // Turquoise
    "#e67e22", // Orange
    "#34495e", // Dark gray
  ];
  if (!id || id === "P0") return colors[0];
  const index = parseInt(id.replace("P", "")) - 1;
  return colors[index % colors.length];
}

// Inisialisasi
function initializeMemory() {
  memoryBlocks = [
    {
      startAddress: 0,
      sizeKB: TOTAL_MEMORY_KB,
      status: "free",
    },
  ];
  nextProcessId = 1;
  renderGridView();
  renderProcessList();
  updateStats();
}

/**
 * Reset Memory
 */
function resetMemory() {
  initializeMemory();
  showNotification("🔄 Memory telah direset ke kondisi awal!");
}

/**
 * Mengalokasikan memori menggunakan strategi First-Fit.
 */
function addProcess() {
  const sizeKB = parseInt(document.getElementById("process-size").value);

  if (isNaN(sizeKB) || sizeKB <= 0) {
    return showNotification("⚠️ Ukuran proses tidak valid. Masukkan angka positif!");
  }

  if (sizeKB > TOTAL_MEMORY_KB) {
    return showNotification(`⚠️ Ukuran proses (${sizeKB} KB) melebihi total memori (${TOTAL_MEMORY_KB} KB)!`);
  }

  // Check if size is multiple of 16
  if (sizeKB % UNIT_SIZE_KB !== 0) {
    return showNotification(`⚠️ Ukuran harus kelipatan ${UNIT_SIZE_KB} KB! (16, 32, 48, 64, dst)`);
  }

  let allocated = false;
  const processId = `P${nextProcessId}`;

  // First-Fit algorithm
  for (let i = 0; i < memoryBlocks.length; i++) {
    const block = memoryBlocks[i];

    if (block.status === "free" && block.sizeKB >= sizeKB) {
      const remainingSize = block.sizeKB - sizeKB;

      const allocatedBlock = {
        startAddress: block.startAddress,
        sizeKB: sizeKB,
        status: "allocated",
        processId: processId,
      };

      memoryBlocks.splice(i, 1, allocatedBlock);

      if (remainingSize > 0) {
        const remainingBlock = {
          startAddress: block.startAddress + sizeKB,
          sizeKB: remainingSize,
          status: "free",
        };
        memoryBlocks.splice(i + 1, 0, remainingBlock);
      }

      allocated = true;
      nextProcessId++;
      showNotification(`✅ Proses ${processId} berhasil dialokasikan (${sizeKB} KB)`);
      break;
    }
  }

  if (!allocated) {
    return showNotification(
      `❌ Alokasi GAGAL! Tidak ada blok contiguous yang cukup untuk ${sizeKB} KB.`
    );
  }

  renderGridView();
  renderProcessList();
  updateStats();
}

/**
 * Melepaskan memori dan menggabungkan blok bebas (Coalescing).
 */
window.deallocateProcess = function (processId) {
  const sizeReleased = memoryBlocks
    .filter(b => b.processId === processId)
    .reduce((sum, b) => sum + b.sizeKB, 0);

  memoryBlocks.forEach((block) => {
    if (block.processId === processId) {
      block.status = "free";
      block.processId = null;
    }
  });

  // Coalescing
  let i = 0;
  while (i < memoryBlocks.length - 1) {
    if (
      memoryBlocks[i].status === "free" &&
      memoryBlocks[i + 1].status === "free"
    ) {
      memoryBlocks[i].sizeKB += memoryBlocks[i + 1].sizeKB;
      memoryBlocks.splice(i + 1, 1);
    } else {
      i++;
    }
  }

  renderGridView();
  renderProcessList();
  updateStats();

  showNotification(
    `✅ Proses ${processId} dihentikan! ${sizeReleased} KB memori dibebaskan.`
  );
};

/**
 * Update informasi fragmentasi
 */
function updateFragmentationInfo() {
  const fragmentationDiv = document.getElementById("fragmentation-info");

  const totalFree = memoryBlocks
    .filter((b) => b.status === "free")
    .reduce((sum, b) => sum + b.sizeKB, 0);

  const largestFree = memoryBlocks
    .filter((b) => b.status === "free")
    .reduce((max, b) => Math.max(max, b.sizeKB), 0);

  const freeBlockCount = memoryBlocks.filter(b => b.status === "free").length;
  const externalFragmentation = totalFree - largestFree;

  fragmentationDiv.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-blue-200 text-sm flex items-center gap-2">
          <i class="fas fa-chart-pie"></i>
          Total Free Memory
        </span>
        <span class="text-white font-bold text-lg">${totalFree} KB</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-blue-200 text-sm flex items-center gap-2">
          <i class="fas fa-cube"></i>
          Largest Free Block
        </span>
        <span class="text-white font-bold text-lg">${largestFree} KB</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-blue-200 text-sm flex items-center gap-2">
          <i class="fas fa-cubes"></i>
          Free Block Count
        </span>
        <span class="text-white font-bold text-lg">${freeBlockCount}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-blue-200 text-sm flex items-center gap-2">
          <i class="fas fa-exclamation-triangle"></i>
          External Fragmentation
        </span>
        <span class="text-white font-bold text-lg">${externalFragmentation} KB</span>
      </div>
      ${externalFragmentation > 0 ? `
        <div class="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg animate-fade-in">
          <p class="text-yellow-300 text-xs flex items-center gap-2">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Memory fragmentation detected! ${externalFragmentation} KB wasted space.</span>
          </p>
        </div>
      ` : `
        <div class="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg animate-fade-in">
          <p class="text-green-300 text-xs flex items-center gap-2">
            <i class="fas fa-check-circle"></i>
            <span>No fragmentation - Memory is optimally used!</span>
          </p>
        </div>
      `}
    </div>
  `;
}

/**
 * Render daftar proses yang sedang berjalan
 */
function renderProcessList() {
  const listContainer = document.getElementById("process-list");

  const allocatedProcesses = [
    ...new Set(
      memoryBlocks
        .filter((b) => b.status === "allocated")
        .map((b) => b.processId)
    ),
  ];

  if (allocatedProcesses.length === 0) {
    listContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fas fa-inbox text-4xl text-white/30 mb-3 block"></i>
        <p class="text-white/50 text-sm">Belum ada proses aktif</p>
        <p class="text-white/30 text-xs mt-1">Tambahkan proses untuk memulai</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = "";

  allocatedProcesses.forEach((id) => {
    const processBlocks = memoryBlocks.filter((b) => b.processId === id);
    const totalSize = processBlocks.reduce((sum, b) => sum + b.sizeKB, 0);
    const startAddress = processBlocks[0] ? processBlocks[0].startAddress : "N/A";
    const numCells = Math.round(totalSize / UNIT_SIZE_KB);
    const color = getColorForProcess(id);

    const processDiv = document.createElement("div");
    processDiv.className = "p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition animate-slide-in";

    processDiv.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full animate-pulse" style="background-color: ${color}"></div>
          <span class="text-white font-bold text-lg">${id}</span>
        </div>
        <button
          onclick="deallocateProcess('${id}')"
          class="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition text-sm font-medium flex items-center gap-1"
          title="Hentikan proses"
        >
          <i class="fas fa-trash text-xs"></i>
          <span>Stop</span>
        </button>
      </div>
      <div class="space-y-2 text-xs">
        <div class="flex justify-between text-white/70">
          <span class="flex items-center gap-1">
            <i class="fas fa-memory text-blue-400"></i>
            Size:
          </span>
          <span class="text-white font-semibold">${totalSize} KB (${numCells} cells)</span>
        </div>
        <div class="flex justify-between text-white/70">
          <span class="flex items-center gap-1">
            <i class="fas fa-map-marker-alt text-green-400"></i>
            Start Address:
          </span>
          <span class="text-white font-semibold">${startAddress} KB</span>
        </div>
        <div class="flex justify-between text-white/70">
          <span class="flex items-center gap-1">
            <i class="fas fa-puzzle-piece text-purple-400"></i>
            Allocation:
          </span>
          <span class="text-white font-semibold">Contiguous</span>
        </div>
        <div class="flex justify-between text-white/70">
          <span class="flex items-center gap-1">
            <i class="fas fa-check-circle text-green-400"></i>
            Status:
          </span>
          <span class="text-green-400 font-semibold">Active</span>
        </div>
      </div>
    `;

    listContainer.appendChild(processDiv);
  });
}

/**
 * Update statistik di sidebar
 */
function updateStats() {
  const totalProcesses = memoryBlocks.filter((b) => b.status === "allocated").length;
  const usedMemory = memoryBlocks
    .filter((b) => b.status === "allocated")
    .reduce((sum, b) => sum + b.sizeKB, 0);
  const freeMemory = TOTAL_MEMORY_KB - usedMemory;
  const utilizationPercent = ((usedMemory / TOTAL_MEMORY_KB) * 100).toFixed(1);

  const totalProcEl = document.getElementById("total-processes");
  const usedEl = document.getElementById("memory-used");
  const freeEl = document.getElementById("memory-free");
  const utilEl = document.getElementById("memory-utilization");

  if (totalProcEl) totalProcEl.textContent = totalProcesses;
  if (usedEl) usedEl.textContent = `${usedMemory} KB`;

  if (freeEl) {
    freeEl.textContent = `${freeMemory} KB`;
    if (freeMemory < 100) {
      freeEl.className = "font-semibold text-red-400";
    } else if (freeMemory < 300) {
      freeEl.className = "font-semibold text-yellow-400";
    } else {
      freeEl.className = "font-semibold text-green-400";
    }
  }

  if (utilEl) {
    utilEl.textContent = `${utilizationPercent}%`;
  }
}

// INISIALISASI
window.onload = initializeMemory;

// Expose functions to global scope
window.addProcess = addProcess;
window.resetMemory = resetMemory;
window.showNotification = showNotification;
window.hideNotification = hideNotification;
window.openAutoTestModal = openAutoTestModal;
window.closeAutoTestModal = closeAutoTestModal;
window.runAutoTest = runAutoTest;
