// Dán link Web App bạn vừa Copy ở bước trên vào đây
const API_URL = 'https://script.google.com/macros/s/AKfycbwmWI5IjcbFSGeRrUrCuKswbuZqAyVEIS8war7n1qrtHUEK2DSfmHX9Np6qz8V-_YBq/exec';

async function traceProduct() {
    const lotNo = document.getElementById('lotInput').value.trim();
    const resultArea = document.getElementById('resultArea');
    const loader = document.getElementById('loader');
    const errorMsg = document.getElementById('errorMsg');

    if (!lotNo) {
        alert("Vui lòng nhập mã lô!");
        return;
    }

    resultArea.style.display = 'none';
    errorMsg.innerText = '';
    loader.style.display = 'block';

    try {
        // 1. Fetch dữ liệu JSON từ App Script
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Không thể kết nối với máy chủ.");
        
        const allData = await response.json();

        // 2. Tìm thông tin chung của Lot (Trong bảng lot_info)
        const product = allData.lot_info.find(row => String(row.lot_no) === lotNo);

        if (!product) {
            throw new Error("Không tìm thấy mã lô: " + lotNo);
        }

        // 3. Hiển thị thông tin chung
        document.getElementById('productInfo').innerHTML = `
            <div class="info-item"><b>Mã Lô</b> ${product.lot_no || 'N/A'}</div>
            <div class="info-item"><b>Số lượng</b> ${product.quantity || '0'}</div>
            <div class="info-item"><b>Hạn sử dụng</b> ${product.HSD || 'N/A'}</div>
            <div class="info-item"><b>Khách hàng</b> ${product.customer || 'N/A'}</div>
        `;

        // 4. Lọc TẤT CẢ nguyên liệu/công thức có cùng lot_no (Trong bảng san_xuat)
        const ingredients = allData.san_xuat.filter(row => String(row.lot_no) === lotNo);
        
        if (ingredients.length === 0) {
            document.getElementById('ingredientBody').innerHTML = '<tr><td colspan="5" style="text-align:center">Không có dữ liệu nguyên liệu chi tiết.</td></tr>';
        } else {
            let tableHtml = '';
            ingredients.forEach(item => {
                tableHtml += `
                    <tr>
                        <td>${item.recipe || 'N/A'}</td>
                        <td>${item.quantity || '0'}</td>
                        <td>${item.machine_value || '-'}</td>
                        <td>${item.time_start || ''} ${item.date_start || ''}</td>
                        <td>${item.time_finish || ''} ${item.date_finish || ''}</td>
                    </tr>
                `;
            });
            document.getElementById('ingredientBody').innerHTML = tableHtml;
        }

        loader.style.display = 'none';
        resultArea.style.display = 'block';

    } catch (err) {
        loader.style.display = 'none';
        errorMsg.innerText = "Lỗi: " + err.message;
        console.error(err);
    }
}
