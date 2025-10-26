// contiguous.js - REVISI LENGKAP

// --- KONSTANTA SIMULASI ---
const TOTAL_MEMORY_KB = 1024;
const UNIT_SIZE_KB = 16;

// --- STATUS SIMULASI GLOBAL ---
let memoryBlocks = []; // Array of Block objects
let nextProcessId = 1;

/**
 * Menampilkan notifikasi pop-up custom.
 * @param {string} message - Pesan yang akan ditampilkan.
 */
function showNotification(message) {
  document.getElementById("notification-message").innerText = message;
  document.getElementById("custom-notification").style.display = "block";
}

/**
 * Menyembunyikan notifikasi pop-up.
 */
function hideNotification() {
  document.getElementById("custom-notification").style.display = "none";
}

// Fungsi pembantu untuk pewarnaan
function getColorForProcess(id) {
  const colors = [
    "#3498db",
    "#2ecc71",
    "#e74c3c",
    "#f1c40f",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
    "#3498db",
  ];
  if (!id || id === "P0") return colors[0]; // Warna default jika diperlukan
  const index = parseInt(id.replace("P", "")) % colors.length;
  return colors[index];
}

// 1. Inisialisasi
function initializeMemory() {
  // Awalnya, satu blok besar yang bebas
  memoryBlocks = [
    {
      startAddress: 0,
      sizeKB: TOTAL_MEMORY_KB,
      status: "free",
    },
  ];
  renderMemoryList();
  renderProcessList();
}

/**
 * Mengalokasikan memori menggunakan strategi First-Fit.
 */
function addProcess() {
  const sizeKB = parseInt(document.getElementById("process-size").value);
  // if (isNaN(sizeKB) || sizeKB <= 0) return alert("Ukuran proses tidak valid.");
  if (isNaN(sizeKB) || sizeKB <= 0)
    return showNotification("Ukuran proses tidak valid.");

  let allocated = false;
  const processId = `P${nextProcessId}`;

  // 1. Cari blok 'free' pertama yang CUKUP BESAR (First-Fit)
  for (let i = 0; i < memoryBlocks.length; i++) {
    const block = memoryBlocks[i];

    if (block.status === "free" && block.sizeKB >= sizeKB) {
      const remainingSize = block.sizeKB - sizeKB;

      // Alokasikan blok baru (menggantikan blok bebas lama)
      const allocatedBlock = {
        startAddress: block.startAddress,
        sizeKB: sizeKB,
        status: "allocated",
        processId: processId,
      };

      // Masukkan blok yang dialokasikan ke posisi saat ini
      memoryBlocks.splice(i, 1, allocatedBlock);

      // Jika ada sisa, buat blok bebas sisa (fragmentasi sisa)
      if (remainingSize > 0) {
        const remainingBlock = {
          startAddress: block.startAddress + sizeKB,
          sizeKB: remainingSize,
          status: "free",
        };
        // Masukkan blok sisa tepat setelah blok yang dialokasikan
        memoryBlocks.splice(i + 1, 0, remainingBlock);
      }

      allocated = true;
      nextProcessId++;
      break;
    }
  }

  if (!allocated) {
    // alert("Memori tidak cukup atau tidak ada blok bebas yang contiguous!");
    return showNotification(
      `Alokasi GAGAL! Memori tidak cukup (${sizeKB} KB). Tidak ada blok kosong CONTIGUOUS yang memenuhi permintaan.`
    );
  }

  // Perbarui Tampilan
  renderMemoryList();
  renderProcessList();
}

/**
 * Melepaskan memori dan menggabungkan blok bebas (Coalescing).
 */
window.deallocateProcess = function (processId) {
  // 1. Ubah status blok menjadi 'free'
  memoryBlocks.forEach((block) => {
    if (block.processId === processId) {
      block.status = "free";
      block.processId = null;
    }
  });

  // 2. Gabungkan (Coalescing) blok-blok yang berdekatan yang sekarang bebas
  let i = 0;
  while (i < memoryBlocks.length - 1) {
    if (
      memoryBlocks[i].status === "free" &&
      memoryBlocks[i + 1].status === "free"
    ) {
      // Gabungkan kedua blok
      memoryBlocks[i].sizeKB += memoryBlocks[i + 1].sizeKB;
      memoryBlocks.splice(i + 1, 1); // Hapus blok berikutnya
    } else {
      i++;
    }
  }

  renderMemoryList();
  renderProcessList();

  // 3. Tampilkan Notifikasi Keberhasilan
  showNotification(
    `Proses ${processId} telah dihentikan! ${sizeReleased} KB memori dibebaskan dan dibersihkan.`
  );
};

// --- FUNGSI RENDERING ---

/**
 * Rendering memori dalam bentuk daftar blok (visualisasi contiguous)
 */
function renderMemoryList() {
  const listContainer = document.getElementById("memory-list");
  listContainer.innerHTML = "";

  memoryBlocks.forEach((block) => {
    const heightPercent = (block.sizeKB / TOTAL_MEMORY_KB) * 100;
    const blockEl = document.createElement("div");

    // Gunakan ukuran minimum untuk visualisasi agar blok kecil tetap terlihat
    const displayHeight = Math.max(15, heightPercent * 2);

    blockEl.style.height = `${displayHeight}px`;
    blockEl.style.backgroundColor =
      block.status === "free" ? "#ecf0f1" : getColorForProcess(block.processId);
    blockEl.style.border = "1px solid #7f8c8d";
    blockEl.style.color = block.status === "free" ? "#7f8c8d" : "white";
    blockEl.style.marginBottom = "2px";
    blockEl.style.display = "flex";
    blockEl.style.alignItems = "center";
    blockEl.style.justifyContent = "center";
    blockEl.style.textAlign = "center";

    // Tampilan yang disederhanakan (1 baris)
    const content =
      block.status === "free"
        ? `BEBAS (${block.sizeKB} KB)`
        : `${block.processId} (${block.sizeKB} KB)`;

    blockEl.innerHTML = `<span>${content}</span>`;
    listContainer.appendChild(blockEl);
  });

  // Hitung dan tampilkan Fragmentasi Eksternal
  const totalFree = memoryBlocks
    .filter((b) => b.status === "free")
    .reduce((sum, b) => sum + b.sizeKB, 0);
  const largestFree = memoryBlocks
    .filter((b) => b.status === "free")
    .reduce((max, b) => Math.max(max, b.sizeKB), 0);

  document.getElementById("fragmentation-info").innerHTML = `
        Total Memori Bebas: <strong>${totalFree} KB</strong>. <br>
        Blok Bebas Terbesar (Max Contiguous): <strong>${largestFree} KB</strong>.
    `;
}

// Fungsi renderProcessList (Detail Proses)
function renderProcessList() {
  const listContainer = document.getElementById("process-list");
  listContainer.innerHTML = "";

  // Cari semua Process ID yang sedang dialokasikan
  const allocatedProcesses = [
    ...new Set(
      memoryBlocks
        .filter((b) => b.status === "allocated")
        .map((b) => b.processId)
    ),
  ];

  allocatedProcesses.forEach((id) => {
    const processBlocks = memoryBlocks.filter((b) => b.processId === id);
    const totalSize = processBlocks.reduce((sum, b) => sum + b.sizeKB, 0);
    const startAddress = processBlocks[0]
      ? processBlocks[0].startAddress
      : "N/A"; // Ambil alamat awal

    const processDiv = document.createElement("div");
    processDiv.innerHTML = `
            <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9;">
                <strong>${id}</strong>
                <button onclick="deallocateProcess('${id}')" 
                        style="float: right; background-color: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                    Hentikan
                </button>
                <br>
                <small>
                    Ukuran: <strong>${totalSize} KB</strong> <br>
                    Alamat Awal: <strong>${startAddress} KB</strong> <br>
                    Tipe Alokasi: <strong>Contiguous (First-Fit)</strong>
                </small>
            </div>
        `;
    listContainer.appendChild(processDiv);
  });
}

// INISIALISASI
window.onload = initializeMemory;
