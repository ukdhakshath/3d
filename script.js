const modelViewer = document.querySelector("#printerModel");


// Model Loading Started

modelViewer.addEventListener("load", () => {

  console.log("3D Model Loaded Successfully");

});


// Model Error

modelViewer.addEventListener("error", (event) => {

  console.error("Error Loading Model:", event);

});


// AR Status

modelViewer.addEventListener("ar-status", (event) => {

  console.log("AR Status:", event.detail.status);

});