// ========================
// DOM Elements
// ========================
const categoriesList = document.getElementById("categories-list"); // sidebar
const productGrid = document.getElementById("product-grid");       // products section
const cartItemsContainer = document.getElementById("cart-items"); // cart list
const totalPriceEl = document.getElementById("total-price");      // total price



const spinner = document.getElementById("spinner");

  // ========================
  // Spinner Controls
  // ========================
  function showSpinner() {
    spinner.style.display = "block";
  }

  function hideSpinner() {
    spinner.style.display = "none";
  }

// ========================
// Cart Data
// ========================
let cart = []; // stores added plants

// ========================
// 1️⃣ Fetch all categories and display as sidebar buttons
// ========================
fetch("https://openapi.programming-hero.com/api/categories")
  .then(res => res.json())
  .then(data => {
    const categories = data.categories || [];

    categories.forEach(cat => {
      const li = document.createElement("li");
      li.textContent = cat.category_name;
      li.classList.add("category-btn");
      li.dataset.id = cat.id;
      categoriesList.appendChild(li);

      // Click category to load plants
      li.addEventListener("click", () => {
        // Highlight selected category
        document.querySelectorAll(".category-btn").forEach(el => el.classList.remove("active"));
        li.classList.add("active");

        fetchPlantsByCategory(cat.id);
      });
    });

    // Automatically select the first category
    if (categories.length > 0) {
      categoriesList.firstChild.classList.add("active");
      fetchPlantsByCategory(categories[0].id);
    }
  })
  .catch(err => console.error("Error fetching categories:", err));

// ========================
// 2️⃣ Fetch plants by category and show in product grid
// ========================
function fetchPlantsByCategory(categoryId) {
  productGrid.innerHTML = "Loading plants...";

  fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
    .then(res => res.json())
    .then(data => {
      const plants = data.plants || [];
      productGrid.innerHTML = ""; // clear previous products

      if (plants.length === 0) {
        productGrid.textContent = "No plants found in this category.";
        return;
      }

      plants.forEach(plant => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
          <div class="card-image">
            <img src="${plant.image}" alt="${plant.name}" style="width:100%; height:200px; object-fit:cover;">
          </div>
          <div class="card-content">
            <h3 class="tree-name">${plant.name}</h3>
            <p class="tree-desc">${plant.description}</p>
            <span class="tree-tag">${plant.category}</span>
            <div class="card-footer">
              <span class="price">৳${plant.price}</span>
              <button class="add-btn">Add to Cart</button>
            </div>
          </div>
        `;

        productGrid.appendChild(card);

        // Click "Add to Cart"
        const addBtn = card.querySelector(".add-btn");
        addBtn.addEventListener("click", () => {
          addToCart(plant);
        });
      });
    })
    .catch(err => {
      productGrid.textContent = "Error loading plants.";
      console.error("Error fetching plants by category:", err);
    });
}

// ========================
// Add plant to cart
// ========================
function addToCart(plant) {
  const existing = cart.find(item => item.id === plant.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({...plant, quantity: 1});
  }
  renderCart();
}

// ========================
// Remove one quantity of plant from cart
// ========================
function removeOneFromCart(plantId) {
  const item = cart.find(i => i.id === plantId);
  if (!item) return;

  item.quantity -= 1; // reduce quantity by 1
  if (item.quantity <= 0) {
    // remove completely if quantity reaches 0
    cart = cart.filter(i => i.id !== plantId);
  }
  renderCart();
}

// ========================
// Render Cart Items
// ========================
function renderCart() {
  cartItemsContainer.innerHTML = ""; // clear cart

  if (cart.length === 0) {
    cartItemsContainer.textContent = "Your cart is empty.";
    totalPriceEl.textContent = "৳0";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.marginBottom = "8px";

    // Left side: Plant name (bold) + price x quantity
    const left = document.createElement("div");
    left.innerHTML = `
      <strong>${item.name}</strong><br>
      ৳${item.price} x ${item.quantity}
    `;

    // Right side: red X for removing one quantity
    const right = document.createElement("span");
    right.textContent = "×";
    right.style.color = "red";
    right.style.cursor = "pointer";
    right.style.fontWeight = "bold";
    right.style.fontSize = "22px"; // slightly bigger
    right.style.transition = "transform 0.2s";
    
    // Hover effect
    right.addEventListener("mouseover", () => {
      right.style.transform = "scale(1.3)";
    });
    right.addEventListener("mouseout", () => {
      right.style.transform = "scale(1)";
    });

    // On click, remove one quantity
    right.addEventListener("click", () => removeOneFromCart(item.id));

    div.appendChild(left);
    div.appendChild(right);

    cartItemsContainer.appendChild(div);

    total += item.price * item.quantity;
  });

  totalPriceEl.textContent = `৳${total}`;
}

// ========================
// Count-Up Animation with + Sign
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter => {
    const targetText = counter.dataset.target; // e.g., "500K", "120", "30"
    
    // Extract numeric part only for counting
    let targetNumber = parseInt(targetText.replace(/\D/g, ""));
    let suffix = targetText.replace(/\d/g, ""); // keep K if exists

    let count = 0;
    const speed = Math.ceil(targetNumber / 20); // adjust speed

    const updateCount = () => {
      count += speed;
      if (count > targetNumber) count = targetNumber;
      counter.textContent = `${count}${suffix}+`; // always add +

      if (count < targetNumber) {
        requestAnimationFrame(updateCount); // smooth animation
      }
    };

    updateCount();
  });
});

// ========================
// Smooth Scroll for Buttons
// ========================

// Navbar Plant a Tree → Impact section
const navbarPlantBtn = document.getElementById("navbar-plant-tree");
const impactSection = document.getElementById("impact-section");
navbarPlantBtn.addEventListener("click", () => {
  impactSection.scrollIntoView({ behavior: "smooth" });
});

// Hero Get Involved → Choose Your Trees section
const heroBtn = document.getElementById("hero-get-involved");
const productSection = document.getElementById("product-grid-section");
heroBtn.addEventListener("click", () => {
  productSection.scrollIntoView({ behavior: "smooth" });
});
