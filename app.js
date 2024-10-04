// Select DOM elements
const addCard = document.getElementById("add-card");
const grid = document.getElementById("grid");
const uploadModal = document.getElementById("uploadModal");
const uploadBtn = document.getElementById("uploadBtn");
const closeModal = document.getElementById("closeModal");
const pdfInput = document.getElementById("pdfInput");

// Open the modal when "+" is clicked
addCard.addEventListener("click", () => {
  uploadModal.classList.remove("hidden");
});

// Close the modal
closeModal.addEventListener("click", () => {
  uploadModal.classList.add("hidden");
});

// Upload PDF and add a new card to the grid
uploadBtn.addEventListener("click", () => {
  const file = pdfInput.files[0];

  if (file && file.type === "application/pdf") {
    const reader = new FileReader();
    reader.onload = function(e) {
      const pdfData = e.target.result;

      // Create a new card
      const card = document.createElement("div");
      card.className = "p-6 bg-white rounded-lg shadow-lg cursor-pointer";
      card.innerHTML = `<h3 class="text-lg font-semibold mb-2">${file.name}</h3>
                        <canvas class="pdf-canvas w-full h-40 border"></canvas>`;

      grid.insertBefore(card, addCard);  // Add new card before the "+" card

      // Render the PDF in the card using pdf.js
      renderPDF(pdfData, card.querySelector(".pdf-canvas"));

      // Event to open the full PDF viewer
      card.addEventListener("click", () => {
        openFullPDF(pdfData);
      });

      // Hide modal and reset file input
      uploadModal.classList.add("hidden");
      pdfInput.value = "";
    };

    reader.readAsDataURL(file);
  } else {
    alert("Please select a valid PDF file.");
  }
});

// Render PDF using pdf.js
function renderPDF(pdfData, canvas) {
  const loadingTask = pdfjsLib.getDocument({ data: atob(pdfData.split(",")[1]) });
  loadingTask.promise.then(pdf => {
    pdf.getPage(1).then(page => {
      const scale = 0.8;
      const viewport = page.getViewport({ scale: scale });
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
    });
  });
}

// Open a full PDF viewer
// function openFullPDF(pdfData) {
//   const viewerWindow = window.open();
//   viewerWindow.document.write(`
//     <html>
//       <head>
//         <title>PDF Viewer</title>
//       </head>
//       <body>
//         <canvas id="full-pdf-canvas" style="width: 100%; height: 100vh;"></canvas>
//         <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js"></script>
//         <script>
//           const pdfData = "${pdfData}";
//           const canvas = document.getElementById("full-pdf-canvas");

//           const loadingTask = pdfjsLib.getDocument({ data: atob(pdfData.split(",")[1]) });
//           loadingTask.promise.then(pdf => {
//             pdf.getPage(1).then(page => {
//               const scale = 1;
//               const viewport = page.getViewport({ scale: scale });
//               const context = canvas.getContext("2d");
//               canvas.height = viewport.height;
//               canvas.width = viewport.width;

//               const renderContext = {
//                 canvasContext: context,
//                 viewport: viewport,
//               };
//               page.render(renderContext);
//             });
//           });
//         </script>
//       </body>
//     </html>
//   `);
// }
// Open a full PDF viewer using the native browser PDF viewer
function openFullPDF(pdfData) {
  const byteArray = atob(pdfData.split(",")[1]);
  const binaryArray = new Uint8Array(byteArray.length);
  
  for (let i = 0; i < byteArray.length; i++) {
    binaryArray[i] = byteArray.charCodeAt(i);
  }

  const blob = new Blob([binaryArray], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  // Open the PDF in a new tab with the browser's native PDF viewer
  window.open(blobUrl);
}
