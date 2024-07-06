function formatRupiah(amount) {
    return 'Rp. ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function updateCartTotal() {
    let subTotal = 0;
    const rows = document.querySelectorAll('.cart-page-inner tbody tr');
    rows.forEach(row => {
        const price = parseFloat(row.querySelector('.price').textContent.replace(/[^\d]/g, ''));
        const quantity = parseInt(row.querySelector('.qty input').value);
        const total = price * quantity;
        row.querySelector('.total').textContent = formatRupiah(total);
        subTotal += total;
    });
    document.getElementById('sub-total').textContent = formatRupiah(subTotal);
    document.getElementById('grand-total').textContent = formatRupiah(subTotal + 25000); // 25,000 for shipping cost
}

function loadCart() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="img">
                    <a href="product.html?name=${encodeURIComponent(item.title)}"><img src="${item.imgSrc}" alt="Image"></a>
                    <p>${item.title}</p>
                </div>
            </td>
            <td class="price">${formatRupiah(item.price)}</td>
            <td>
                <div class="qty">
                    <button class="btn-minus"><i class="fa fa-minus"></i></button>
                    <input type="text" value="${item.quantity}">
                    <button class="btn-plus"><i class="fa fa-plus"></i></button>
                </div>
            </td>
            <td class="total">${formatRupiah(item.price * item.quantity)}</td>
            <td><button class="btn-remove"><i class="fa fa-trash"></i></button></td>`;
        cartItemsContainer.appendChild(row);
    });

    updateCartTotal();
    updateCartEvents();
}

function updateCartEvents() {
    const cartItemsContainer = document.getElementById('cart-items');

    // Hapus semua event listener sebelumnya untuk menghindari duplikasi
    const newCartItemsContainer = cartItemsContainer.cloneNode(true);
    cartItemsContainer.parentNode.replaceChild(newCartItemsContainer, cartItemsContainer);

    newCartItemsContainer.addEventListener('click', function (event) {
        if (event.target.closest('.btn-remove')) {
            const button = event.target.closest('.btn-remove');
            const row = button.closest('tr');
            const title = row.querySelector('.img p').textContent;
            row.remove();
            removeFromCart(title);
            updateCartTotal();
        } else if (event.target.closest('.btn-minus')) {
            const button = event.target.closest('.btn-minus');
            const input = button.nextElementSibling;
            let value = parseInt(input.value);
            if (value > 1) {
                value--;
                input.value = value;
                updateQuantity(input.closest('tr').querySelector('.img p').textContent, value);
                updateCartTotal();
            }
        } else if (event.target.closest('.btn-plus')) {
            const button = event.target.closest('.btn-plus');
            const input = button.previousElementSibling;
            let value = parseInt(input.value);
            value++;
            input.value = value;
            updateQuantity(input.closest('tr').querySelector('.img p').textContent, value);
            updateCartTotal();
        }
    });

    document.getElementById('update-cart').addEventListener('click', function () {
        updateCartTotal();
    });
}

function removeFromCart(title) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems = cartItems.filter(item => item.title !== title);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function updateQuantity(title, quantity) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const item = cartItems.find(item => item.title === title);
    if (item) {
        item.quantity = quantity;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadCart();
    updateCartTotal();
    updateCartEvents();
});
