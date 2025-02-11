/*************************************************************
 * 1. Mapeo de categorías por columna
 *    (Cada columna de la 1..6 usa su propia lista)
 *************************************************************/
const categoriesByColumn = {
  1: ["1", "2", "3", "4", "5"],                // Col 1: Puntuación
  2: ["Juego", "Película", "Libro", "Podcast"],// Col 2: Tipo
  3: ["Rockstar", "Team Cherry", "Studio Ghibli"], // Col 3: Autor/Director
  4: ["1999", "2018", "2020", "2023"],         // Col 4: Fecha
  5: ["Rockstar Games", "Nintendo", "Team Cherry"], // Col 5: Publisher
  6: ["Pendiente", "Terminado", "En progreso"] // Col 6: Estado
};

/*************************************************************
 * 2. Referencias a elementos del DOM
 *************************************************************/
const tableBody        = document.getElementById('tableBody');
const addRowBtn        = document.getElementById('addRowBtn');
const popupMenu        = document.getElementById('popupMenu');
const categoryList     = document.getElementById('categoryList');
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn   = document.getElementById('addCategoryBtn');
const popupTitle       = document.getElementById('popupTitle');

// Variables para saber en qué celda/columna estamos trabajando
let currentCell   = null;
let currentColumn = null;

/*************************************************************
 * 3. Funciones de utilidad para categorías
 *************************************************************/

/**
 * Retorna el array de categorías para la columna dada.
 * Si no existe, crea una lista vacía para esa columna.
 */
function getCategoriesForColumn(colIndex) {
  if (!categoriesByColumn[colIndex]) {
    categoriesByColumn[colIndex] = [];
  }
  return categoriesByColumn[colIndex];
}

/**
 * Renderiza la lista de categorías en el menú emergente,
 * usando la columna actual (currentColumn).
 */
function renderCategoryList() {
  categoryList.innerHTML = "";
  const catArray = getCategoriesForColumn(currentColumn);

  catArray.forEach(cat => {
    const rowDiv = document.createElement('div');
    
    // Texto de la categoría (click para asignar)
    const catSpan = document.createElement('span');
    catSpan.textContent = cat;
    catSpan.addEventListener('click', () => {
      if (currentCell) {
        currentCell.textContent = cat;
      }
      hidePopupMenu();
    });

    // Botón para eliminar la categoría
    const removeBtn = document.createElement('button');
    removeBtn.textContent = "x";
    removeBtn.title = `Eliminar la categoría "${cat}"`;
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evita que se seleccione el span
      if (confirm(`¿Eliminar la categoría "${cat}"?`)) {
        const updatedArray = catArray.filter(c => c !== cat);
        categoriesByColumn[currentColumn] = updatedArray;
        renderCategoryList();
      }
    });

    rowDiv.appendChild(catSpan);
    rowDiv.appendChild(removeBtn);
    categoryList.appendChild(rowDiv);
  });
}

/**
 * Agrega una nueva categoría si no existe
 */
function addNewCategory() {
  const newCat = newCategoryInput.value.trim();
  if (!newCat) return; // Evita agregar cadenas vacías
  const catArray = getCategoriesForColumn(currentColumn);

  if (!catArray.includes(newCat)) {
    catArray.push(newCat);
    newCategoryInput.value = "";
    renderCategoryList();
  }
}

/*************************************************************
 * 4. Mostrar/ocultar menú emergente
 *************************************************************/

/**
 * Muestra el menú emergente cerca de la celda, con la lista
 * de la columna colIndex.
 */
function showPopupMenu(cell, colIndex) {
  currentCell   = cell;
  currentColumn = colIndex;

  // Opcional: cambiar título según columna
  popupTitle.textContent = `Seleccionar categoría (Columna ${colIndex})`;

  renderCategoryList();

  // Calcula posición para el menú
  const cellRect = cell.getBoundingClientRect();
  popupMenu.style.display = 'block';
  popupMenu.style.top  = (window.scrollY + cellRect.bottom) + 'px';
  popupMenu.style.left = (window.scrollX + cellRect.left) + 'px';

  // Limpia el input
  newCategoryInput.value = "";
}

/**
 * Cierra el menú emergente y resetea variables
 */
function hidePopupMenu() {
  popupMenu.style.display = 'none';
  currentCell   = null;
  currentColumn = null;
  newCategoryInput.value = "";
}

/*************************************************************
 * 5. Configurar eventos
 *************************************************************/

// Añadir nueva categoría al hacer clic
addCategoryBtn.addEventListener('click', addNewCategory);

// Cerrar el menú si se hace clic fuera
document.addEventListener('click', (e) => {
  if (popupMenu.style.display === 'block') {
    // Verifica si el clic no fue dentro del popup ni en la celda
    if (!popupMenu.contains(e.target) && e.target !== currentCell) {
      hidePopupMenu();
    }
  }
});

/**
 * Configura la celda para usar el menú emergente (quita contentEditable).
 */
function setupCategoryCell(cell, colIndex) {
  cell.contentEditable = false;
  cell.addEventListener('click', (e) => {
    e.stopPropagation();
    showPopupMenu(cell, colIndex);
  });
}

/*************************************************************
 * 6. Ajustar filas existentes al cargar la página
 *************************************************************/
window.addEventListener('DOMContentLoaded', () => {
  // Para cada fila existente, configuramos columnas 1..6
  Array.from(tableBody.rows).forEach(row => {
    for (let colIndex = 1; colIndex <= 6; colIndex++) {
      const cell = row.cells[colIndex];
      if (cell) {
        setupCategoryCell(cell, colIndex);
      }
    }
  });
});

/*************************************************************
 * 7. Crear nuevas filas (botón "+ Agregar una fila")
 *************************************************************/
addRowBtn.addEventListener('click', () => {
  const newRow = document.createElement('tr');

  for (let colIndex = 0; colIndex < 8; colIndex++) {
    const td = document.createElement('td');
    
    // Col 0 (Nombre) y col 7 (Resumen) => editable
    if (colIndex === 0 || colIndex === 7) {
      td.contentEditable = true;
    } else {
      // Col 1..6 => menú emergente
      setupCategoryCell(td, colIndex);
    }
    // Valor inicial en blanco (o lo que quieras)
    td.textContent = "";
    newRow.appendChild(td);
  }

  tableBody.appendChild(newRow);
  // (Opcional) Enfocamos la primera celda
  newRow.cells[0].focus();
});
