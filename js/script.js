function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Close mobile menu if open
    const navLinks = document.getElementById('nav-links-list');
    if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// pencarian 
function handleSearch() {
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  const products = document.querySelectorAll(".product-card");

  if (!query) {
    // Jika input kosong, tampilkan semua produk
    products.forEach(p => p.style.display = "block");
  } else {
    // Filter produk sesuai query
    products.forEach(p => {
      const name = p.dataset.name.toLowerCase();
      p.style.display = name.includes(query) ? "block" : "none";
    });
  }
  // Reset: sembunyikan search bar lagi di layar kecil
  if (window.innerWidth <= 1000) {
    const searchBar = document.querySelector(".search-bar");
    searchBar.classList.remove("active");
    document.getElementById("search-input").value = ""; // kosongkan input
  }
}

function toggleMobileSearch() {
  const searchBar = document.querySelector(".search-bar");
  searchBar.classList.toggle("active");
}



// Initialize cart functionality
let cart = [];
let currentTransactionDetails = {
    items: [],
    total: 0,
    receiverName: '',
    deliveryAddress: '',
    phoneNumber: '', // Added phone number
    paymentMethod: ''
};

// Function to format number to Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

// Function to show custom notification modal
function showNotification(message) {
    document.getElementById('notification-message').textContent = message;
    document.getElementById('notification-modal').style.display = 'block';
}

// Function to close custom notification modal
function closeNotification() {
    document.getElementById('notification-modal').style.display = 'none';
}

function addToCart(productName, productPrice, quantity = 1) {
    const priceNum = parseInt(productPrice); // Ensure price is a number
    const qtyNum = parseInt(quantity);

    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += qtyNum;
    } else {
        cart.push({
            name: productName,
            price: priceNum,
            quantity: qtyNum
        });
    }
    
    updateCartCount();
    showNotification(`${qtyNum}x ${productName} telah ditambahkan ke keranjang!`);
}

function showCart() {
    const cartModal = document.getElementById('cart-modal');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    
    cartItemsContainer.innerHTML = ''; // Clear previous items
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
    } else {
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            const itemSubtotal = item.price * item.quantity;
            itemElement.innerHTML = `
                <span>${item.name} (x${item.quantity})</span>
                <span>
                    ${formatRupiah(itemSubtotal)} 
                    <button class="remove-btn" data-index="${index}" style="margin-left:10px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; padding:2px 6px;">Hapus</button>
                </span>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += itemSubtotal;
        });

        // Tambahkan event listener untuk tombol hapus
        cartItemsContainer.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                removeFromCart(idx);
            });
        });
    }
    
    cartTotalPriceElement.textContent = formatRupiah(total);
    cartModal.style.display = 'block';
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1); // Hapus item dari array cart
        updateCartCount();
        showCart(); // Refresh tampilan keranjang
    }
}

function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Modified checkout function to handle both cart and direct buy
function checkout(productToBuyNow = null, quantity = 1) {
    let itemsToProcess = [];
    let totalAmount = 0;

    if (productToBuyNow) {
        // If buying directly, create a temporary cart for this product
        itemsToProcess.push({
            name: productToBuyNow.name,
            price: parseInt(productToBuyNow.price),
            quantity: parseInt(quantity)
        });
        totalAmount = parseInt(productToBuyNow.price) * parseInt(quantity);
    } else {
        // If checking out from the main cart
        if (cart.length === 0) {
            showNotification('Keranjang Anda kosong. Silakan tambahkan produk terlebih dahulu.');
            return;
        }
        itemsToProcess = cart;
        totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Store transaction details
    currentTransactionDetails.items = itemsToProcess;
    currentTransactionDetails.total = totalAmount;

    closeCart(); // Close cart modal if open
    closeProductDetailModal(); // Close product detail modal if open

    const paymentModal = document.getElementById('payment-modal');
    const paymentTotalAmountElement = document.getElementById('payment-total-amount');
    
    paymentTotalAmountElement.textContent = formatRupiah(totalAmount);
    document.getElementById('receiver-name').value = ''; // Clear previous input
    document.getElementById('delivery-address').value = ''; // Clear previous input
    document.getElementById('phone-number').value = ''; // Clear previous input
    document.getElementById('payment-method').value = ''; // Clear previous input
    paymentModal.style.display = 'block';
}

// New function for direct "Buy Now"
function buyNow(productName, productPrice, quantity = 1) {
    const product = { name: productName, price: productPrice };
    checkout(product, quantity); // Pass the product and quantity directly to checkout
}

function closePaymentModal() {
    document.getElementById('payment-modal').style.display = 'none';
}

function processPayment() {
    const receiverName = document.getElementById('receiver-name').value;
    const deliveryAddress = document.getElementById('delivery-address').value;
    const phoneNumber = document.getElementById('phone-number').value; // Get phone number
    const paymentMethod = document.getElementById('payment-method').value;

    if (!receiverName || !deliveryAddress || !phoneNumber || !paymentMethod || paymentMethod === "") {
        showNotification('Mohon lengkapi semua detail pengiriman dan pembayaran.');
        return;
    }

    // Store collected details
    currentTransactionDetails.receiverName = receiverName;
    currentTransactionDetails.deliveryAddress = deliveryAddress;
    currentTransactionDetails.phoneNumber = phoneNumber; // Store phone number
    currentTransactionDetails.paymentMethod = paymentMethod;

    // Simulate payment processing
    console.log('Memproses pembayaran Anda...'); // Log to console instead of alert
    
    setTimeout(() => {
        closePaymentModal();
        
        // Populate confirmation modal
        document.getElementById('conf-receiver-name').textContent = currentTransactionDetails.receiverName;
        document.getElementById('conf-delivery-address').textContent = currentTransactionDetails.deliveryAddress;
        document.getElementById('conf-phone-number').textContent = currentTransactionDetails.phoneNumber; // Display phone number
        document.getElementById('conf-payment-method').textContent = currentTransactionDetails.paymentMethod;
        document.getElementById('conf-total-amount').textContent = formatRupiah(currentTransactionDetails.total);

        const productList = document.getElementById('conf-product-list');
        productList.innerHTML = ''; // Clear previous list
        currentTransactionDetails.items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name} (x${item.quantity}) - ${formatRupiah(item.price * item.quantity)}`;
            productList.appendChild(listItem);
        });

        document.getElementById('confirmation-modal').style.display = 'block';
        
        // Clear the global cart after any successful payment
        cart = []; 
        updateCartCount(); 

        // Clear payment form fields for next transaction
        document.getElementById('receiver-name').value = '';
        document.getElementById('delivery-address').value = '';
        document.getElementById('phone-number').value = '';
        document.getElementById('payment-method').value = '';

    }, 2000); // Simulate 2 seconds processing time
}

function closeConfirmationModal() {
    document.getElementById('confirmation-modal').style.display = 'none';
}

// Product Detail Modal Functions
function showProductDetail(productData) {
    const modal = document.getElementById('product-detail-modal');
    document.getElementById('product-detail-image').src = productData.image;
    document.getElementById('product-detail-name').textContent = productData.name;
    document.getElementById('product-detail-rating').innerHTML = generateStarRating(productData.rating);
    document.getElementById('product-detail-price').textContent = formatRupiah(productData.price);
    document.getElementById('product-detail-description').textContent = productData.description;
    
    // Set data attributes for buttons in detail modal
    const detailAddToCartBtn = document.getElementById('detail-add-to-cart');
    const detailBuyNowBtn = document.getElementById('detail-buy-now');
    const detailQuantityInput = document.getElementById('detail-quantity');

    detailAddToCartBtn.dataset.name = productData.name;
    detailAddToCartBtn.dataset.price = productData.price;
    detailBuyNowBtn.dataset.name = productData.name;
    detailBuyNowBtn.dataset.price = productData.price;
    detailQuantityInput.value = 1; // Reset quantity to 1

    modal.style.display = 'block';
}

function closeProductDetailModal() {
    document.getElementById('product-detail-modal').style.display = 'none';
}

function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    // Add empty stars to make it 5 total
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>'; // far for empty star
    }
    return stars + ` (${rating})`;
}


// Event listeners for "Keranjang" buttons
document.querySelectorAll('.cart-btn').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent product card click
        const productName = this.dataset.name;
        const productPrice = this.dataset.price;
        const quantityInput = this.closest('.product-actions').querySelector('.quantity-input');
        const quantity = quantityInput ? quantityInput.value : 1;
        addToCart(productName, productPrice, quantity);
    });
});

// Event listeners for "Buy Now" buttons
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent product card click
        const productName = this.dataset.name;
        const productPrice = this.dataset.price;
        const quantityInput = this.closest('.product-actions').querySelector('.quantity-input');
        const quantity = quantityInput ? quantityInput.value : 1;
        buyNow(productName, productPrice, quantity); // Call the new buyNow function
    });
});

// Event listener for product card clicks (to show detail modal)
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function() {
        const productData = {
            name: this.dataset.name,
            price: this.dataset.price,
            description: this.dataset.description,
            image: this.dataset.image,
            rating: parseFloat(this.dataset.rating)
        };
        showProductDetail(productData);
    });
});

// Event listeners for buttons inside product detail modal
document.getElementById('detail-add-to-cart').addEventListener('click', function() {
    const productName = this.dataset.name;
    const productPrice = this.dataset.price;
    const quantity = document.getElementById('detail-quantity').value;
    addToCart(productName, productPrice, quantity);
    closeProductDetailModal();
});

document.getElementById('detail-buy-now').addEventListener('click', function() {
    const productName = this.dataset.name;
    const productPrice = this.dataset.price;
    const quantity = document.getElementById('detail-quantity').value;
    buyNow(productName, productPrice, quantity);
    closeProductDetailModal();
});

// Mobile menu toggle
document.getElementById('mobile-menu').addEventListener('click', function() {
    const navLinks = document.getElementById('nav-links-list');
    navLinks.classList.toggle('active');
});

// Show home section by default
if (!window.location.hash) {
    showSection('home');
}