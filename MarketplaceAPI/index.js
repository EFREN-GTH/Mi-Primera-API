let currentSearchToken = 0;
let selectCategory = false;

const searchForm = document.querySelector("input");
const categoryTitle = document.getElementById("cat-title");
const cardsContainer = document.querySelector(".cards");

getProducts("", currentSearchToken);

// Evento para manejar el buscador
searchForm.addEventListener("keyup", async e => {
  const searchToken = ++currentSearchToken;
  const searchValue = e.target.value;
  
  // Actualizar el título de la categoría con el valor escrito por el teclado
  categoryTitle.textContent = searchValue !== "" ? searchValue : "Todas Las Categorías";
  
  // Eliminar los productos existentes para evitar duplicados
  removeProducts();
  
  // Obtener los productos según el valor escrito
  getProducts(searchValue, searchToken);
});

// Función para obtener los productos
async function getProducts(wantedElement, searchToken) {
  try {
    const searchUrl = "https://dummyjson.com/products/search?q=";
    const categoryUrl = "https://dummyjson.com/products/category/";
    const apiUrl = selectCategory ? `${categoryUrl}${wantedElement}` : `${searchUrl}${wantedElement}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // Agregar los productos solo si el token de búsqueda es el actual
    // Para evitar que se mezclen respuestas de búsquedas anteriores con las más recientes
    if (searchToken === currentSearchToken) {
      addProducts(data.products);
    }
  } catch (error) {
    console.error("Error al obtener los productos:", error);
  }
  selectCategory = false;
}

// Función para agregar los productos en la página
function addProducts(products) {
  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    // Operación para calcular el precio descontado
    const priceOperation = product.price - (product.price * product.discountPercentage / 100);
    const finalValue = priceOperation.toFixed(2);

    // Crear la tarjeta (card) del producto
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}">
      <div class="card-info">
        <div class="price">
          <div class="final-price">
            <span class="final-value">${finalValue}</span>
            <span class="currency">€</span>
          </div>
          <div class="original-price">
            <span class="price-title">Precio original: </span>
            <span class="price-value">${product.price}€</span>
          </div>
        </div>
        <h3>${product.title}</h3>
        <h4>${product.brand}</h4>
        <div class="rating">
          <span class="rating-value">${product.rating}</span>
          <span class="star-icon"><img src="assets/star.svg" alt=""></span>
        </div>
      </div>
    `;

    // Agregar la tarjeta (card) al fragmento
    fragment.appendChild(card);
  });

  // Agregar el fragmento con las tarjetas
  cardsContainer.appendChild(fragment);
}

// Función para eliminar los productos del contenedor
function removeProducts() {
  cardsContainer.innerHTML = "";
}

// Función para obtener las categorías
async function getCategories(done) {
  try {
    const response = await fetch('https://dummyjson.com/products/categories');
    const data = await response.json();
    done(data);
  } catch (error) {
    console.error("Error al obtener las categorías:", error);
  }
}

// Obtener las categorías y crear los elementos del menú
getCategories(data => {
  const list = document.querySelector(".menu-content ul");
  const allCategoriesButton = document.querySelector(".menu-content a[data-category='all']");
  const checkbox = document.querySelector(".menu-check");

  // Función para manejar el evento de clic en una categoría
  const handleCategoryClick = event => {
    event.preventDefault();
    selectCategory = true;

    // Obtener la categoría seleccionada
    const selectedCategory = event.target.getAttribute("data-category");
    
    // Actualizar el título de la categoría
    categoryTitle.textContent = selectedCategory;
    
    // Desactivar la casilla de verificación del menú (cierra el menú)
    checkbox.checked = false;

    // Eliminar los productos actuales
    removeProducts();
    
    // Obtener los productos de la categoría seleccionada
    const searchToken = ++currentSearchToken;
    getProducts(selectedCategory, searchToken);
  };

  data.forEach(category => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.setAttribute("data-category", category);
    link.textContent = category;

    // Agregar el evento de clic a la categoría
    link.addEventListener("click", handleCategoryClick);

    li.appendChild(link);
    list.appendChild(li);
  });

  // Evento de clic para la categoría "Todas Las Categorías"
  allCategoriesButton.addEventListener("click", event => {
    event.preventDefault();
    
    // Actualizar el título de la categoría
    categoryTitle.textContent = "Todas Las Categorías";
    
    // Desactivar la casilla de verificación del menú (cierra el menú)
    checkbox.checked = false;
    
    // Eliminar los productos actuales
    removeProducts();
    
    // Obtener todos los productos
    const searchToken = ++currentSearchToken;
    getProducts("", searchToken);
  });
});