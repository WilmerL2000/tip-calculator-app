let client = {
  table: '',
  time: '',
  order: [],
};

const categories = {
  1: 'Comida',
  2: 'Bebidas',
  3: 'Postres',
};

const btnSaveClient = document.querySelector('#guardar-cliente');
btnSaveClient.addEventListener('click', saveClient);

/**
 * The function saves client information and displays an error message if any required fields are
 * empty.
 */
function saveClient() {
  const table = document.querySelector('#mesa').value;
  const time = document.querySelector('#hora').value;

  const emptyFields = [table, time].some((field) => field === '');
  if (emptyFields) {
    const existAlert = document.querySelector('.invalid-feedback');
    if (!existAlert) {
      const alert = document.createElement('DIV');
      alert.classList.add('invalid-feedback', 'd-block', 'text-center');
      alert.textContent = 'Todos los campos son obligatorios';
      document.querySelector('.modal-body form').appendChild(alert);

      setTimeout(() => {
        alert.remove();
      }, 3000);
    }
  } else {
    client = { ...client, table, time };

    const modalForm = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalForm);
    modalBootstrap.hide();

    showSections();
    getDishes();
  }
}

/**
 * The function shows all sections that have the class "d-none" by removing that class from them.
 */
function showSections() {
  const hideSections = document.querySelectorAll('.d-none');
  hideSections.forEach((section) => section.classList.remove('d-none'));
}

/**
 * This function fetches data from a URL and displays it as dishes.
 */
function getDishes() {
  const url = 'http://localhost:4000/dishes';
  fetch(url)
    .then((resp) => resp.json())
    .then((data) => showDishes(data))
    .catch((err) => console.error(err));
}

function showDishes(dishes) {
  const content = document.querySelector('#platillos .contenido');
  dishes.forEach((dish) => {
    const row = document.createElement('DIV');
    row.classList.add('row', 'py-3', 'border-top');

    const name = document.createElement('DIV');
    name.classList.add('col-md-4');
    name.textContent = dish.name;

    const price = document.createElement('DIV');
    price.classList.add('col-md-3', 'fw-bold');
    price.textContent = `$${dish.price}`;

    const category = document.createElement('DIV');
    category.classList.add('col-md-3');
    category.textContent = categories[dish.category];

    const quantityInput = document.createElement('INPUT');
    quantityInput.type = 'number';
    quantityInput.min = 0;
    quantityInput.value = 0;
    quantityInput.id = `product-${dish.id}`;
    quantityInput.classList.add('form-control');
    quantityInput.onchange = () => {
      const quantity = +quantityInput.value;
      addDish({ ...dish, quantity });
    };

    const add = document.createElement('DIV');
    add.classList.add('col-md-2');
    add.appendChild(quantityInput);

    row.appendChild(name);
    row.appendChild(price);
    row.appendChild(category);
    row.appendChild(add);

    content.appendChild(row);
  });
}

/**
 * The function updates the client's order by adding or removing a dish based on its quantity.
 * @param product - an object representing a dish or product that a client wants to add to their order.
 * It has properties such as id (unique identifier for the dish), quantity (number of dishes to add),
 * and possibly other properties such as name, price, etc.
 */
function addDish(product) {
  let { order } = client;

  if (product.quantity > 0) {
    if (order.some((item) => item.id === product.id)) {
      const updatedOrder = order.map((item) => {
        if (item.id === product.id) {
          item.quantity = product.quantity;
        }
        return item;
      });

      client.order = [...updatedOrder];
    } else {
      client.order = [...order, product];
    }
  } else {
    const result = order.filter((item) => item.id !== product.id);
    client.order = [...result];
  }

  cleanHTML();

  if (client.order.length) {
    updateSummary();
  } else {
    messageEmptyOrder();
  }
}

/**
 * The function updates the summary of a client's order by creating and appending HTML elements to the
 * page.
 */
function updateSummary() {
  const content = document.querySelector('#resumen .contenido');

  const summary = document.createElement('DIV');
  summary.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

  //   Table Info
  const table = document.createElement('P');
  table.textContent = 'Mesa: ';
  table.classList.add('fw-bold');

  const tableSpan = document.createElement('SPAN');
  tableSpan.textContent = client.table;
  tableSpan.classList.add('fw-normal');

  //   Time Info
  const time = document.createElement('P');
  time.textContent = 'Hora: ';
  time.classList.add('fw-bold');

  const timeSpan = document.createElement('SPAN');
  timeSpan.textContent = client.time;
  timeSpan.classList.add('fw-normal');

  table.appendChild(tableSpan);
  time.appendChild(timeSpan);

  const heading = document.createElement('H3');
  heading.textContent = 'Platillos consumidos';
  heading.classList.add('my-4', 'text-center');

  const group = document.createElement('UL');
  group.classList.add('list-group');

  const { order } = client;
  order.forEach((item) => {
    const { name, quantity, price, id } = item;

    const list = document.createElement('LI');
    list.classList.add('list-group-item');

    const nameEl = document.createElement('H4');
    nameEl.classList.add('my-4');
    nameEl.textContent = name;

    const quantityEl = document.createElement('P');
    quantityEl.classList.add('fw-bold');
    quantityEl.textContent = 'Cantidad: ';

    const quantityVal = document.createElement('SPAN');
    quantityVal.classList.add('fw-normal');
    quantityVal.textContent = quantity;

    // Item Price
    const priceEl = document.createElement('P');
    priceEl.classList.add('fw-bold');
    priceEl.textContent = 'Precio: ';

    const priceVal = document.createElement('SPAN');
    priceVal.classList.add('fw-normal');
    priceVal.textContent = `$${price}`;

    // Item Subtotal
    const subtotalEl = document.createElement('P');
    subtotalEl.classList.add('fw-bold');
    subtotalEl.textContent = 'Subtotal: ';

    const subtotalVal = document.createElement('SPAN');
    subtotalVal.classList.add('fw-normal');
    subtotalVal.textContent = calcSubtotal(price, quantity);

    const btnRemove = document.createElement('BUTTON');
    btnRemove.classList.add('btn', 'btn-danger');
    btnRemove.textContent = 'Eliminar del pedido';
    btnRemove.onclick = () => removeProduct(id);

    quantityEl.appendChild(quantityVal);
    priceEl.appendChild(priceVal);
    subtotalEl.appendChild(subtotalVal);

    list.appendChild(nameEl);
    list.appendChild(quantityEl);
    list.appendChild(priceEl);
    list.appendChild(subtotalEl);
    list.appendChild(btnRemove);

    group.appendChild(list);
  });

  summary.appendChild(heading);
  summary.appendChild(table);
  summary.appendChild(time);
  summary.appendChild(group);

  content.appendChild(summary);

  tipForm();
}

/**
 * The function removes all child elements from a specific HTML element.
 */
function cleanHTML() {
  const content = document.querySelector('#resumen .contenido');
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
}

/**
 * The function calculates the subtotal by multiplying the price and quantity and returns it in a
 * formatted string.
 * @param price - The price of a single item.
 * @param quantity - The quantity parameter represents the number of items being purchased.
 */
const calcSubtotal = (price, quantity) => `$${price * quantity}`;

/**
 * The function removes a product from the client's order and updates the summary and HTML accordingly.
 * @param id - The id of the product that needs to be removed from the client's order.
 */
function removeProduct(id) {
  let { order } = client;

  const result = order.filter((item) => item.id !== id);
  client.order = [...result];

  cleanHTML();

  if (client.order.length) {
    updateSummary();
  } else {
    messageEmptyOrder();
  }

  const removedProduct = `#product-${id}`;
  const inputProduct = document.querySelector(removedProduct);
  inputProduct.value = 0;
}

/**
 * The function adds a message to the order summary if it is empty.
 */
function messageEmptyOrder() {
  const content = document.querySelector('#resumen .contenido');

  const text = document.createElement('P');
  text.classList.add('text-center');
  text.textContent = 'Añade los elementos del pedido';

  content.appendChild(text);
}

/**
 * The function creates a form for selecting a tip percentage and adds it to a specific section of a
 * webpage.
 */
function tipForm() {
  const content = document.querySelector('#resumen .contenido');

  const form = document.createElement('DIV');
  form.classList.add('col-md-6', 'formulario');

  const divForm = document.createElement('DIV');
  divForm.classList.add('card', 'py-2', 'px-3', 'shadow');

  const heading = document.createElement('H3');
  heading.classList.add('my-4', 'text-center');
  heading.textContent = 'Propina';

  //   10%
  const radio10 = document.createElement('INPUT');
  radio10.type = 'radio';
  radio10.name = 'tip';
  radio10.value = '10';
  radio10.classList.add('form-check-input');
  radio10.onclick = calcTip;

  const radio10Lbl = document.createElement('LABEL');
  radio10Lbl.textContent = '10%';
  radio10Lbl.classList.add('form-check-label');

  const radio10Div = document.createElement('DIV');
  radio10Div.classList.add('form-check');

  radio10Div.appendChild(radio10);
  radio10Div.appendChild(radio10Lbl);

  //   25%
  const radio25 = document.createElement('INPUT');
  radio25.type = 'radio';
  radio25.name = 'tip';
  radio25.value = '25';
  radio25.classList.add('form-check-input');
  radio25.onclick = calcTip;

  const radio25Lbl = document.createElement('LABEL');
  radio25Lbl.textContent = '25%';
  radio25Lbl.classList.add('form-check-label');

  const radio25Div = document.createElement('DIV');
  radio25Div.classList.add('form-check');

  radio25Div.appendChild(radio25);
  radio25Div.appendChild(radio25Lbl);

  //   50%
  const radio50 = document.createElement('INPUT');
  radio50.type = 'radio';
  radio50.name = 'tip';
  radio50.value = '50';
  radio50.classList.add('form-check-input');
  radio50.onclick = calcTip;

  const radio50Lbl = document.createElement('LABEL');
  radio50Lbl.textContent = '50%';
  radio50Lbl.classList.add('form-check-label');

  const radio50Div = document.createElement('DIV');
  radio50Div.classList.add('form-check');

  radio50Div.appendChild(radio50);
  radio50Div.appendChild(radio50Lbl);

  divForm.appendChild(heading);
  divForm.appendChild(radio10Div);
  divForm.appendChild(radio25Div);
  divForm.appendChild(radio50Div);

  form.appendChild(divForm);

  content.appendChild(form);
}

/**
 * The function calculates the tip and total amount for an order based on the selected tip percentage.
 */
function calcTip() {
  const { order } = client;
  let subtotal = 0;

  order.forEach((item) => {
    subtotal += item.quantity * item.price;
  });

  const tipSelected = +document.querySelector('[name="tip"]:checked').value;

  const tip = (subtotal * tipSelected) / 100;

  const total = subtotal + tip;

  showTotal(subtotal, total, tip);
}

function showTotal(subtotal, total, tip) {
  const divTotals = document.createElement('DIV');
  divTotals.classList.add('total-pagar', 'my-5');

  //   Subtotal
  const subtotalParr = document.createElement('P');
  subtotalParr.classList.add('fs-4', 'fw-bold', 'mt-2');
  subtotalParr.textContent = 'Subtotal  Consumo: ';

  const subtotalSpan = document.createElement('SPAN');
  subtotalSpan.classList.add('fw-normal');
  subtotalSpan.textContent = `$${subtotal}`;

  //   Tip
  const tipParr = document.createElement('P');
  tipParr.classList.add('fs-4', 'fw-bold', 'mt-2');
  tipParr.textContent = 'Propina: ';

  const tipSpan = document.createElement('SPAN');
  tipSpan.classList.add('fw-normal');
  tipSpan.textContent = `$${tip}`;

  //   Total
  const totalParr = document.createElement('P');
  totalParr.classList.add('fs-4', 'fw-bold', 'mt-2');
  totalParr.textContent = 'Propina: ';

  const totalSpan = document.createElement('SPAN');
  totalSpan.classList.add('fw-normal');
  totalSpan.textContent = `$${total}`;

  subtotalParr.appendChild(subtotalSpan);
  tipParr.appendChild(tipSpan);
  totalParr.appendChild(totalSpan);

  const totalPayDiv = document.querySelector('.total-pagar');
  if (totalPayDiv) totalPayDiv.remove();

  divTotals.appendChild(subtotalParr);
  divTotals.appendChild(tipParr);
  divTotals.appendChild(totalParr);

  const form = document.querySelector('.formulario > div');
  form.appendChild(divTotals);
}
