let allCategories = [];
let itemCount = 0;
let totalPrice = 0;
let cartItems = {};
let currentCategory = "All Plants";
let treesData = {};

const totalPriceEl = document.getElementById("total-price");
const cartItemsContainer = document.getElementById("cart-items");
const spinner = document.getElementById("spinner");
const productGrid = document.querySelector(".product-grid");
const sidebar = document.querySelector(".sidebar ul");
const modal = document.getElementById("treeModal");
const closeBtn = document.querySelector(".close");

// Initialize
function init() {
  fetchCategoriesAndPlants();
}

// Fetch categories from API
function fetchCategories() {
  return fetch("https://openapi.programming-hero.com/api/categories")
    .then(response => response.json())
    .then(data => {
      allCategories = data.data || [];
      return allCategories;
    })
    .catch(error => {
      console.error("Error fetching categories:", error);
      return [];
    });
}

// Fetch plants from API
function fetchPlantsData() {
  return fetch("https://openapi.programming-hero.com/api/plants")
    .then(response => response.json())
    .then(data => data.data)
    .catch(error => {
      console.error("Error fetching plants:", error);
      return [];
    });
}

// Master initialization - fetch both categories and plants
function fetchCategoriesAndPlants() {
  spinner.classList.add("show");
  
  Promise.all([fetchCategories(), fetchPlantsData()])
    .then(([categories, plants]) => {
      organizeDataByCategory(plants, categories);
      loadCategories();
      loadTrees("All Plants");
      setupEventListeners();
      spinner.classList.remove("show");
    })
    .catch(error => {
      console.error("Error initializing app:", error);
      alert("Failed to load data. Please refresh the page.");
      spinner.classList.remove("show");
    });
}

// Organize API data by category
function organizeDataByCategory(plants, categories) {
  const organizedData = {};
  
  // Initialize All Plants category
  organizedData["All Plants"] = [];
  
  // Initialize categories from API
  categories.forEach(cat => {
    organizedData[cat.name] = [];
  });
  
  plants.forEach((plant, index) => {
    const transformedPlant = {
      id: plant.id || index,
      name: plant.name || "Unknown Plant",
      category: plant.category || "Uncategorized",
      price: plant.price || 300,
      description: plant.description || "A beautiful plant for your garden."
    };
    
    // Add to All Plants
    organizedData["All Plants"].push(transformedPlant);
    
    // Add to category-specific if it exists
    if (organizedData[transformedPlant.category]) {
      organizedData[transformedPlant.category].push(transformedPlant);
    }
  });
  
  treesData = organizedData;
}

// Load categories dynamically
function loadCategories() {
  sidebar.innerHTML = "";
  
  for (const category of Object.keys(treesData)) {
    const li = document.createElement("li");
    if (category === "All Plants") {
      li.classList.add("active");
    }
    li.textContent = category;
    li.addEventListener("click", () => {
      document.querySelectorAll(".sidebar li").forEach(item => item.classList.remove("active"));
      li.classList.add("active");
      currentCategory = category;
      loadTrees(category);
    });
    sidebar.appendChild(li);
  }
}

// Load trees for a category
function loadTrees(category) {
  spinner.classList.add("show");
  
  setTimeout(() => {
    const plants = treesData[category] || [];
    renderCards(plants);
    spinner.classList.remove("show");
  }, 300);
}

// Render cards in 3-column grid
function renderCards(plants) {
  productGrid.innerHTML = "";
  
  if (plants.length === 0) {
    productGrid.innerHTML = "<p style='grid-column: 1/-1; text-align: center; padding: 40px;'>No plants found in this category.</p>";
    return;
  }
  
  plants.forEach(plant => {
    const card = document.createElement("div");
    card.className = "card";
    
    card.innerHTML = `
      <div class="card-image"></div>
      <div class="card-content">
        <h3 class="tree-name" style="cursor: pointer; color: #177d3a; text-decoration: underline;">${plant.name}</h3>
        <p class="tree-desc">${plant.description}</p>
        <span class="tree-tag">${plant.category}</span>
        <div class="card-footer">
          <span class="price">৳${plant.price}</span>
          <button class="add-btn">Add to Cart</button>
        </div>
      </div>
    `;
    
    const treeName = card.querySelector(".tree-name");
    treeName.addEventListener("click", () => openModal(plant));
    
    const addBtn = card.querySelector(".add-btn");
    addBtn.addEventListener("click", () => addToCartWithSpinner(plant));
    
    productGrid.appendChild(card);
  });
}

// Add to Cart with spinner
function addToCartWithSpinner(plant) {
  spinner.classList.add("show");
  
  setTimeout(() => {
    addToCart(plant);
    spinner.classList.remove("show");
    alert(`🌱 ${plant.name} added to cart!`);
  }, 500);
}

// Add item to cart
function addToCart(plant) {
  if (cartItems[plant.name]) {
    cartItems[plant.name].quantity++;
  } else {
    cartItems[plant.name] = { price: plant.price, quantity: 1 };
  }
  
  totalPrice += plant.price;
  itemCount++;
  renderCart();
}

// Render cart items
function renderCart() {
  cartItemsContainer.innerHTML = "";
  
  for (const [itemName, itemData] of Object.entries(cartItems)) {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.dataset.itemName = itemName;
    
    cartItem.innerHTML = `
      <div class="item-info">
        <strong>${itemName}</strong>
        <p>৳${itemData.price} × ${itemData.quantity}</p>
      </div>
      <button class="remove-btn">×</button>
    `;
    
    cartItemsContainer.appendChild(cartItem);
  }
  
  totalPriceEl.innerText = `৳${totalPrice}`;
  attachRemoveListeners();
}

// Attach remove button listeners
function attachRemoveListeners() {
  const removeButtons = document.querySelectorAll(".remove-btn");
  removeButtons.forEach(button => {
    button.addEventListener("click", function () {
      const cartItem = this.closest(".cart-item");
      const itemName = cartItem.dataset.itemName;
      const itemData = cartItems[itemName];
      
      totalPrice -= itemData.price * itemData.quantity;
      itemCount -= itemData.quantity;
      delete cartItems[itemName];
      
      renderCart();
    });
  });
}

// Open modal with plant details
function openModal(plant) {
  document.getElementById("modalImage").src = "Green Earth Project/assets/about.png";
  document.getElementById("modalTreeName").textContent = plant.name;
  document.getElementById("modalTreeDesc").textContent = plant.description;
  document.getElementById("modalTreeCategory").textContent = plant.category;
  document.getElementById("modalTreePrice").textContent = `৳${plant.price}`;
  
  const modalAddBtn = document.getElementById("modalAddBtn");
  modalAddBtn.onclick = () => {
    addToCartWithSpinner(plant);
    modal.style.display = "none";
  };
  
  modal.style.display = "block";
}

// Setup event listeners
function setupEventListeners() {
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
  
  const plantForm = document.getElementById("plant-form");
  if (plantForm) {
    plantForm.addEventListener("submit", e => {
      e.preventDefault();
      alert("🌱 Thank you for supporting Green Earth!");
      e.target.reset();
    });
  }
  
  const counters = document.querySelectorAll(".counter");
  counters.forEach(counter => {
    const updateCounter = () => {
      const target = +counter.getAttribute("data-target");
      const current = +counter.innerText;
      const increment = target / 100;
      
      if (current < target) {
        counter.innerText = Math.ceil(current + increment);
        setTimeout(updateCounter, 20);
      } else {
        counter.innerText = target + "+";
      }
    };
    
    updateCounter();
  });
}

document.addEventListener("DOMContentLoaded", init);
