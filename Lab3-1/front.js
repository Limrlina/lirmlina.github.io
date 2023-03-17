function showFileName() {
    var fileInput = document.getElementById("uploaded_file");
    var fileName = fileInput.files[0].name;
    var fileLabel = document.getElementById("file-label");
    fileLabel.innerHTML = fileName;
  }

function checkForm() {
  const name = document.getElementById('name').value;
  const city = document.getElementById('city').value;
  const date = document.getElementById('date').value;
  const address = document.getElementById('address').value;
  const file = document.getElementById('uploaded_file').value;

  const furnitureColours = document.getElementsByName('furniture_colour');
  const furnitureItems = document.getElementsByName('furniture_item[]');
  const quantities = document.getElementsByClassName('quantityField');

  let furnitureColoursChecked = false;
  let furnitureItemsChecked = false;
  let quantitiesFilled = false;

  for (let i = 0; i < furnitureColours.length; i++) {
    if (furnitureColours[i].checked) {
      furnitureColoursChecked = true;
      break;
    }
  }

  for (let i = 0; i < furnitureItems.length; i++) {
    if (furnitureItems[i].checked) {
      furnitureItemsChecked = true;
      break;
    }
  }

  for (let i = 0; i < quantities.length; i++) {
    if (quantities[i].value > 0) {
      quantitiesFilled = true;
      break;
    }
  }

  if (name && city && date && address && file && furnitureColoursChecked && furnitureItemsChecked && quantitiesFilled) {
    document.getElementById('submitButton').disabled = false;
  } else {
    document.getElementById('submitButton').disabled = true;
  }
}
  
  