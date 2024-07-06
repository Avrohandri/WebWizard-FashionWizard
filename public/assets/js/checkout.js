function formatRupiah(amount) {
    return 'Rp. ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function loadCartFromLocalStorage() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';

    let subTotal = 0;

    cartItems.forEach(item => {
        const row = document.createElement('tr');
        const total = item.price * item.quantity;
        subTotal += total;

        row.innerHTML = `
            <td>
                <div class="img">
                    <a href="product.html?name=${encodeURIComponent(item.title)}"><img src="${item.imgSrc}" alt="Image"></a>
                    <p>${item.title}</p>
                </div>
            </td>
            <td class="price">${formatRupiah(item.price)}</td>
            <td class="quantity">${item.quantity}</td>
            <td class="total">${formatRupiah(total)}</td>
        `;
        cartItemsContainer.appendChild(row);
    });

    document.getElementById('sub-total').textContent = formatRupiah(subTotal);
    document.getElementById('grand-total').textContent = formatRupiah(subTotal + 25000); // 25,000 for shipping cost
}

document.addEventListener('DOMContentLoaded', function () {
    loadCartFromLocalStorage();
});
