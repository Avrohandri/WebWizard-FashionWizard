document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#transaction-table tbody');
    const productTableBody = document.querySelector('#product-table tbody');
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const productRowsPerPageSelect = document.getElementById('productRowsPerPage');
    const prevProductPageButton = document.getElementById('prevProductPage');
    const nextProductPageButton = document.getElementById('nextProductPage');
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const addProductForm = document.getElementById('addProductForm');
    const closeModal = document.querySelector('.close');
    const categorySelect = document.getElementById('category');
    const salesChartCtx = document.getElementById('salesChart').getContext('2d');
    const analysisContent = document.querySelector('.analysis-content');

    let currentPage = 1;
    let rowsPerPage = parseInt(rowsPerPageSelect.value);
    let orders = [];
    let currentProductPage = 1;
    let productRowsPerPage = parseInt(productRowsPerPageSelect.value);
    let products = [];

    async function fetchOrders() {
        try {
            const response = await fetch('/api/orders');
            orders = await response.json();
            displayPage(currentPage);
        } catch (error) {
            console.error('Failed to load transaction orders:', error);
        }
    }

    async function fetchProducts() {
        try {
            const response = await fetch('/api/products');
            products = await response.json();
            displayProductPage(currentProductPage);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch('/api/categories');
            const categories = await response.json();
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.category_name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    async function fetchSalesData() {
        try {
            const response = await fetch('/api/actual-sales');
            const salesData = await response.json();
            const salesByMonth = Array(12).fill(0);

            salesData.forEach(sale => {
                const [year, month] = sale.month.split('-');
                const monthIndex = parseInt(month, 10) - 1;
                salesByMonth[monthIndex] = parseFloat(sale.actual_sales);
            });

            return salesByMonth;
        } catch (error) {
            console.error('Failed to load actual sales data:', error);
            return new Array(12).fill(0); // Default to zeros if there's an error
        }
    }

    async function displayChart() {
        const actualSales = await fetchSalesData();

        const salesExpectations = [20000000, 30000000, 40000000, 30000000, 40000000, 50000000, 60000000, 70000000, 80000000, 90000000, 100000000, 110000000];
        const predictedSales = [18000000, 28000000, 38000000, 32000000, 42000000, 52000000, 62000000, 72000000, 82000000, 92000000, 102000000, 112000000];

        new Chart(salesChartCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Sales Expectations',
                        borderColor: 'rgb(255, 99, 132)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        data: salesExpectations,
                        fill: true,
                    },
                    {
                        label: 'Actual Sales',
                        borderColor: 'rgb(54, 162, 235)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        data: actualSales,
                        fill: true,
                    },
                    {
                        label: 'Predicted Sales',
                        borderColor: 'rgb(255, 205, 86)',
                        backgroundColor: 'rgba(255, 205, 86, 0.2)',
                        data: predictedSales,
                        fill: true,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true,
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Sales'
                        }
                    }
                }
            }
        });

        // Generate analysis based on sales data
        generateAnalysis(actualSales, salesExpectations, predictedSales);
    }

    function displayPage(page) {
        tableBody.innerHTML = '';
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedOrders = orders.slice(start, end);

        paginatedOrders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${start + index + 1}</td>
                <td>${order.order_id}</td>
                <td>${order.customer_name}</td>
                <td>${formatRupiah(order.total_amount)}</td>
                <td>${order.shipping_address}</td>
                <td>${order.payment_method}</td>
                <td>${order.product}</td>
            `;
            tableBody.appendChild(row);
        });

        prevPageButton.classList.toggle('disabled', page === 1);
        nextPageButton.classList.toggle('disabled', end >= orders.length);
    }

    function displayProductPage(page) {
        productTableBody.innerHTML = '';
        const start = (page - 1) * productRowsPerPage;
        const end = start + productRowsPerPage;
        const paginatedProducts = products.slice(start, end);

        paginatedProducts.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${start + index + 1}</td>
                <td>${product.product_id}</td>
                <td>${product.product_name}</td>
                <td>${getCategoryName(product.category_id)}</td>
                <td>${formatRupiah(product.price)}</td>
                <td>${product.stock}</td>
                <td>${product.description}</td>
                <td>${product.color}</td>
                <td><img src="uploads/${product.image}" alt="${product.product_name}" width="50"></td>
            `;
            productTableBody.appendChild(row);
        });

        prevProductPageButton.classList.toggle('disabled', page === 1);
        nextProductPageButton.classList.toggle('disabled', end >= products.length);
    }

    function getCategoryName(categoryId) {
        const categories = {
            1: 'Jackets',
            2: 'T-Shirts',
            3: 'Shirts',
            4: 'Sweatshirts',
            5: 'Dress',
            6: 'Skirts',
            7: 'Shorts',
            8: 'Shoes',
            9: 'Glasses',
            10: 'Bag',
            11: 'Watch',
            12: 'Cap'
        };
        return categories[categoryId] || 'Unknown';
    }

    function formatRupiah(amount) {
        let number_string = amount.toString().replace(/[^,\d]/g, '').toString();
        let split = number_string.split(',');
        let sisa = split[0].length % 3;
        let rupiah = split[0].substr(0, sisa);
        let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

        if (ribuan) {
            let separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
        return 'Rp ' + rupiah;
    }

    async function generateAnalysis(actualSales, salesExpectations, predictedSales) {
        analysisContent.textContent = 'Please wait...';

        try {
            const response = await fetch('/api/generate-analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ actualSales, salesExpectations, predictedSales })
            });

            const data = await response.json();
            analysisContent.textContent = data.message;
        } catch (error) {
            console.error('Failed to generate analysis:', error);
            analysisContent.textContent = 'Failed to generate analysis.';
        }
    }

    rowsPerPageSelect.addEventListener('change', () => {
        rowsPerPage = parseInt(rowsPerPageSelect.value);
        currentPage = 1;
        displayPage(currentPage);
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    nextPageButton.addEventListener('click', () => {
        if ((currentPage * rowsPerPage) < orders.length) {
            currentPage++;
            displayPage(currentPage);
        }
    });

    productRowsPerPageSelect.addEventListener('change', () => {
        productRowsPerPage = parseInt(productRowsPerPageSelect.value);
        currentProductPage = 1;
        displayProductPage(currentProductPage);
    });

    prevProductPageButton.addEventListener('click', () => {
        if (currentProductPage > 1) {
            currentProductPage--;
            displayProductPage(currentProductPage);
        }
    });

    nextProductPageButton.addEventListener('click', () => {
        if ((currentProductPage * productRowsPerPage) < products.length) {
            currentProductPage++;
            displayProductPage(currentProductPage);
        }
    });

    addProductBtn.addEventListener('click', () => {
        addProductModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        addProductModal.style.display = 'none';
    });

    addProductForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(addProductForm);
        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                body: formData,
            });

            const newProduct = await response.json();
            products.push(newProduct);
            displayProductPage(currentProductPage);
            addProductModal.style.display = 'none';
            addProductForm.reset();
        } catch (error) {
            console.error('Failed to add product:', error);
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === addProductModal) {
            addProductModal.style.display = 'none';
        }
    });

    fetchOrders();
    fetchProducts();
    fetchCategories();
    displayChart();
});
