// --- KONSTANTA SIMULASI ---
const TOTAL_MEMORY_KB = 256;
const PAGE_SIZE_KB = 4;
const N_FRAMES = TOTAL_MEMORY_KB / PAGE_SIZE_KB; // 64 Frames
const PAGE_SIZE_BYTES = PAGE_SIZE_KB * 1024; // 4096 Bytes

// --- STATUS SIMULASI GLOBAL ---
let physicalMemory = []; // Array of Frame objects
let processes = {}; // Dictionary of Process objects, keyed by Process ID
let nextProcessId = 1;

// --- STRUKTUR DATA (DITINJAU ULANG) ---

// Struktur Frame (dalam array physicalMemory)
/*
{
    frameId: 0,
    status: 'free' | 'allocated',
    processId: null | 'P1',
    pageId: null | 0 
}
*/

// Struktur Proses (dalam dictionary processes)
/*
'P1': {
    id: 'P1',
    sizeKB: 20,
    nPages: 5,
    pageTable: [
        // { pageId: 0, frameId: 5, valid: true }
    ]
}
*/

// --- FUNGSI INTI JAVASCRIPT ---

/**
 * Menampilkan notifikasi pop-up custom.
 * @param {string} message - Pesan yang akan ditampilkan.
 */
function showNotification(message) {
  document.getElementById('notification-message').innerText = message;
  document.getElementById('custom-notification').style.display = 'block';
}

/**
* Menyembunyikan notifikasi pop-up.
*/
function hideNotification() {
  document.getElementById('custom-notification').style.display = 'none';
}

// 1. Initializer
function initializeMemory() {
  // Pastikan physicalMemory kosong sebelum inisialisasi
  physicalMemory = [];

  for (let i = 0; i < N_FRAMES; i++) {
    physicalMemory.push({
      frameId: i,
      status: "free",
      processId: null,
      pageId: null,
    });
  }

  // Panggil fungsi render yang sudah kita buat
  renderMemoryGrid();
  renderProcessList(); // Untuk inisialisasi dropdown/daftar kosong
}

// 2. Logika Alokasi
function addProcess() {
  // 1. Ambil ukuran dari input
  const sizeKB = parseInt(document.getElementById("process-size").value);
  //if (isNaN(sizeKB) || sizeKB <= 0) return alert("Ukuran proses tidak valid.");
  if (isNaN(sizeKB) || sizeKB <= 0) return showNotification("Ukuran proses tidak valid.");

  // 2. Hitung jumlah page yang dibutuhkan
  const nPages = Math.ceil(sizeKB / PAGE_SIZE_KB);

  // 3. Cari Frame yang tersedia (Implementasi First-Fit untuk Frame)
  const availableFrames = physicalMemory
    .filter((f) => f.status === "free")
    .slice(0, nPages);

    if (availableFrames.length < nPages) {
      return showNotification(`Memori tidak cukup! Proses butuh ${nPages} Frame, tersedia hanya ${availableFrames.length}.`);
    }

  // if (availableFrames.length < nPages) {
  //   return alert(
  //     `Memori tidak cukup! Proses butuh ${nPages} Frame, tersedia hanya ${availableFrames.length}.`
  //   );
  // }

  // 4. Alokasikan dan perbarui status global (physicalMemory dan processes)
  const processId = `P${nextProcessId++}`;
  const newProcess = {
    id: processId,
    sizeKB: sizeKB,
    nPages: nPages,
    pageTable: [],
  };

  availableFrames.forEach((frame, index) => {
    // Update physicalMemory
    frame.status = "allocated";
    frame.processId = processId;
    frame.pageId = index;

    // Update Page Table
    newProcess.pageTable.push({
      pageId: index,
      frameId: frame.frameId,
      valid: true,
    });
  });

  processes[processId] = newProcess;

  // 5. Update tampilan
  renderMemoryGrid();
  renderProcessList();
}

// 3. Logika Translasi Alamat
function translateAddress() {
  // Implementasi perhitungan Alamat Logis -> Alamat Fisik
  const processId = document.getElementById("translate-process-id").value;
  const logicalAddress = parseInt(
    document.getElementById("logical-address").value
  );

  // Dapatkan P (Page Number) dan D (Offset)
  const pageNumber = Math.floor(logicalAddress / PAGE_SIZE_BYTES);
  const offset = logicalAddress % PAGE_SIZE_BYTES;

  // Cek di Tabel Halaman
  const process = processes[processId];
  if (!process || pageNumber >= process.nPages) {
    return (document.getElementById("translation-result").innerText =
      "Alamat Logis tidak valid atau Proses tidak ada.");
  }

  const pageEntry = process.pageTable.find((p) => p.pageId === pageNumber);

  if (pageEntry && pageEntry.valid) {
    const frameNumber = pageEntry.frameId;
    // Hitung Alamat Fisik
    const physicalAddress = frameNumber * PAGE_SIZE_BYTES + offset;

    document.getElementById("translation-result").innerHTML = `
            Alamat Logis: **${logicalAddress}** (Bytes) <br>
            Page Number (P): **${pageNumber}** <br>
            Offset (D): **${offset}** (Bytes) <br>
            Mapping: Page ${pageNumber} di Frame **${frameNumber}** <br>
            Alamat Fisik: **${physicalAddress}** (Bytes)
        `;
    // Implementasi highlight Frame di visualisasi...
  } else {
    document.getElementById("translation-result").innerText =
      "Page tidak valid (Page Fault/Swap Out).";
  }
}

// --- FUNGSI RENDERING (PERLU DIIMPLEMENTASIKAN) ---

// Fungsi yang bertanggung jawab membuat dan mewarnai grid memori di HTML.
function renderMemoryGrid() {
  const gridContainer = document.getElementById("memory-grid");
  gridContainer.innerHTML = ""; // Kosongkan grid sebelum render ulang

  physicalMemory.forEach((frame) => {
    const frameEl = document.createElement("div");
    frameEl.classList.add("frame");

    // Tentukan status dan kelas warna
    if (frame.status === "free") {
      frameEl.classList.add("free");
      frameEl.innerHTML = `
              <span class="frame-id">F: ${frame.frameId}</span>
              <span>BEBAS</span>
          `;
    } else {
      // Tambahkan class berdasarkan Process ID untuk pewarnaan
      frameEl.classList.add(`process-${frame.processId}`);
      frameEl.innerHTML = `
              <span class="frame-id">F: ${frame.frameId}</span>
              <span>${frame.processId}</span>
              <span>P: ${frame.pageId}</span>
          `;
    }

    // Tambahkan event listener jika nanti kita ingin highlight
    // frameEl.onclick = () => showFrameDetail(frame.frameId);

    gridContainer.appendChild(frameEl);
  });
}

// Fungsi yang bertanggung jawab menampilkan daftar proses aktif dan mengupdate dropdown translasi.
function renderProcessList() {
  const listContainer = document.getElementById("process-list");
  const selectDropdown = document.getElementById("translate-process-id");

  listContainer.innerHTML = "";
  selectDropdown.innerHTML = "";

  const processIds = Object.keys(processes);

  if (processIds.length === 0) {
    listContainer.innerHTML = "<p>Tidak ada proses aktif.</p>";
    return;
  }

  processIds.forEach((id) => {
    const process = processes[id];

    // 1. Tambahkan ke Daftar Proses (dengan tombol Deallocate)
    const processDiv = document.createElement("div");
    processDiv.innerHTML = `
          <div style="margin: 10px 0; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
              <strong>${id}</strong> (Size: ${process.sizeKB}KB, Pages: ${process.nPages})
              <button onclick="deallocateProcess('${id}')" 
                      style="float: right; background-color: #e74c3c; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                  Hentikan
              </button>
              <button onclick="showPageTable('${id}')" 
                      style="float: right; margin-right: 10px; background-color: #3498db; color: white; border: none; padding: 5px 10px; cursor: pointer;">
                  Lihat Page Table
              </button>
          </div>
      `;
    listContainer.appendChild(processDiv);

    // 2. Tambahkan ke Dropdown Translasi Alamat
    const option = document.createElement("option");
    option.value = id;
    option.innerText = `${id} (${process.sizeKB}KB)`;
    selectDropdown.appendChild(option);
  });

  // Pilih Proses pertama secara default
  selectDropdown.value = processIds[0];
}

/**
 * Fungsi pembantu untuk menampilkan Tabel Halaman di area Detail Info
 * @param {string} processId - ID Proses yang Page Tablenya akan ditampilkan
 */
function showPageTable(processId) {
  const process = processes[processId];
  const tableBody = document
    .getElementById("page-table")
    .querySelector("tbody");
  tableBody.innerHTML = "";

  if (!process) return;

  process.pageTable.forEach((entry) => {
    const row = tableBody.insertRow();
    row.insertCell().innerText = entry.pageId;
    row.insertCell().innerText = entry.frameId !== null ? entry.frameId : "N/A";
    row.insertCell().innerText = entry.valid
      ? "Valid (In Memory)"
      : "Invalid (Swapped)";
    row.style.backgroundColor = entry.valid ? "#e8f8f5" : "#fdedec";
  });
}

/**
 * Membebaskan semua Frame yang dialokasikan ke suatu Proses.
 * @param {string} processId - ID Proses yang akan dihentikan (e.g., 'P1').
 */
function deallocateProcess(processId) {
  if (!processes[processId]) {
    // alert(`Proses ${processId} tidak ditemukan.`);
    return showNotification(`Kesalahan: Proses ${processId} tidak ditemukan.`);
  }

  // 1. Perbarui physicalMemory: Set Frame yang digunakan menjadi 'free'
  physicalMemory.forEach((frame) => {
    if (frame.processId === processId) {
      frame.status = "free";
      frame.processId = null;
      frame.pageId = null;
    }
  });

  // 2. Hapus Proses dari daftar global
  delete processes[processId];

  // 3. Update tampilan
  renderMemoryGrid();
  renderProcessList();

  // Opsional: Kosongkan tabel halaman dan hasil translasi
  document.getElementById("page-table").querySelector("tbody").innerHTML = "";
  document.getElementById("translation-result").innerText = "";
  // 4. Tampilkan Notifikasi Keberhasilan
  showNotification(`Proses ${processId} telah dihentikan! ${nPagesReleased} Frame memori dibebaskan.`);
  // alert(
  //   `Proses ${processId} telah dihentikan dan ${
  //     processes[processId]?.nPages || "semua"
  //   } Frame telah dibebaskan.`
  // );
}

// --- INICIALISASI SAAT HALAMAN DIMUAT ---
window.onload = initializeMemory;
