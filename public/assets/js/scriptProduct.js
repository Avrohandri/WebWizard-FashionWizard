document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productName = urlParams.get('name');

    if (productName) {
        try {
            const response = await fetch(`/api/product?name=${encodeURIComponent(productName)}`);
            const product = await response.json();
            console.log('Product details:', product); // Log product details for debugging

            if (product.name) {
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-price').textContent = `Rp ${formatRupiah(product.price)}`;
                document.getElementById('product-description').textContent = product.description;
                document.getElementById('product-image').src = `assets/images/products/${product.image}`;

                // Event listener untuk tombol "Add to Cart"
                const addToCartBtn = document.querySelector('.add-cart-btn');
                if (addToCartBtn) {
                    addToCartBtn.addEventListener('click', () => addToCart(product));
                }

                // Event listener untuk tombol "Buy Now"
                const buyNowBtn = document.querySelector('.buy-now-btn');
                if (buyNowBtn) {
                    buyNowBtn.addEventListener('click', () => buyNow(product));
                }
            } else {
                document.body.innerHTML = '<h1>Product not found.</h1>';
            }
        } catch (error) {
            console.error('Failed to load product details:', error);
            document.body.innerHTML = '<h1>Failed to load product details.</h1>';
        }
    } else {
        document.body.innerHTML = '<h1>Product not found.</h1>';
    }

    // Pop-up modal functionality
    const modal = document.getElementById("fit-assistant-modal");
    const fitAssistantBtn = document.querySelector(".fit-assistant-btn");
    const closeModalBtn = document.querySelector(".close-btn");

    if (fitAssistantBtn) {
        fitAssistantBtn.onclick = function() {
            modal.style.display = "block";
        }
    }

    if (closeModalBtn) {
        closeModalBtn.onclick = function() {
            modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    const continueBtn = document.querySelector(".continue-btn");
    if (continueBtn) {
        continueBtn.addEventListener("click", () => {
            const age = document.getElementById("age").value;
            const height = document.getElementById("height").value;
            const weight = document.getElementById("weight").value;

            if (!age || !height || !weight) {
                alert("Please fill out all fields");
                return;
            }

            const size = determineSize(age, height, weight);
            displaySizeResult(size);
        });
    }
});

function addToCart(product) {
    const productName = product.name;
    const productPrice = product.price;
    const selectedSize = document.getElementById('size').value;

    const newItem = {
        title: productName,
        price: parseFloat(productPrice),
        size: selectedSize,
        imgSrc: `assets/images/products/${product.image}`,
        quantity: 1
    };

    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    const existingItemIndex = cartItems.findIndex(item => item.title === productName && item.size === selectedSize);
    if (existingItemIndex !== -1) {
        cartItems[existingItemIndex].quantity += 1;
    } else {
        cartItems.push(newItem);
    }
    
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    alert('Item added to cart!');
}

function buyNow(product) {
    const productName = product.name;
    const productPrice = product.price;
    const selectedSize = document.getElementById('size').value;

    const newItem = {
        title: productName,
        price: parseFloat(productPrice),
        size: selectedSize,
        imgSrc: `assets/images/products/${product.image}`,
        quantity: 1
    };

    // Simpan item yang akan dibeli di localStorage dan arahkan ke halaman checkout
    localStorage.setItem('buyNowItem', JSON.stringify(newItem));
    window.location.href = 'checkout.html';
}

// Helper function untuk format Rupiah
function formatRupiah(angka) {
    let number_string = angka.toString().split('.')[0];
    let sisa = number_string.length % 3;
    let rupiah = number_string.substr(0, sisa);
    let ribuan = number_string.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    return rupiah;
}

// Algoritma untuk Fit Assistant
function determineSize(age, height, weight) {
    const normalizedHeight = height / 100; // tinggi dalam meter
    const normalizedWeight = weight; // berat dalam kg

    let size = "";

    if (normalizedHeight < 1.55) {
        if (normalizedWeight < 50) size = "S";
        else if (normalizedWeight < 60) size = "M";
        else size = "L";
    } else if (normalizedHeight < 1.75) {
        if (normalizedWeight < 60) size = "M";
        else if (normalizedWeight < 75) size = "L";
        else size = "XL";
    } else {
        if (normalizedWeight < 70) size = "L";
        else size = "XL";
    }

    return size;
}

function displaySizeResult(size) {
    const sizeResultDiv = document.getElementById("size-result");
    const recommendedSizeSpan = document.getElementById("recommended-size");
    
    recommendedSizeSpan.textContent = size;
    sizeResultDiv.style.display = "block";
}
