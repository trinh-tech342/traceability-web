function formatSmartDateTime(dateVal, timeVal) {
    const d = dateVal ? new Date(dateVal) : null;
    const t = timeVal ? new Date(timeVal) : null;

    let datePart = "";
    let timePart = "";

    // Xử lý phần Ngày (Nếu không phải năm 1899 thì mới lấy ngày)
    if (d && !isNaN(d.getTime()) && d.getFullYear() !== 1899) {
        datePart = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    // Xử lý phần Giờ (Ưu tiên lấy từ timeVal, nếu không có thì lấy từ dateVal)
    const targetTime = (t && !isNaN(t.getTime())) ? t : d;
    if (targetTime && !isNaN(targetTime.getTime())) {
        timePart = `${String(targetTime.getHours()).padStart(2, '0')}:${String(targetTime.getMinutes()).padStart(2, '0')}`;
    }

    // Gộp lại: Nếu có cả hai thì cách nhau khoảng trắng, nếu chỉ có một thì hiện một
    return [timePart, datePart].filter(Boolean).join(" ") || "-";
}
// Hàm định dạng cho tất cả các ô ngày tháng
function formatDateOnly(isoString) {
    if (!isoString || isoString === 'N/A') return 'N/A';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
}
// Dán link Web App bạn vừa Copy ở bước trên vào đây
const API_URL = 'https://script.google.com/macros/s/AKfycbzPpFrQX4rmGc4G8x1ea1rduBQ884tYDzy7KOHQ-J7g3V9VvsUPUnb2kc9prFDpHq1s/exec';

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
            <div class="info-item"><b>Hạn sử dụng</b> ${formatDateOnly(product.HSD)}</div>
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
        <td>${item.Ingridient || 'N/A'}</td>
        <td>${item.quantity || '0'}</td>
        <td>${item.machine_value || '-'}</td>
        <td>${formatSmartDateTime(item.date_start, item.time_start)}</td>
        <td>${formatSmartDateTime(item.date_finish, item.time_finish)}</td>
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
