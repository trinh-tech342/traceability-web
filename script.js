// Thay các link này bằng link CSV thực tế từ Google Sheets của bạn
const SHEET_LOT_INFO_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsl9LECSCDb82qUb7iIEU67XDtOsIeGBEXytLelidtSZCMgLKqcsRBUp1ZEMGOLccOz3kOB4KT65xq/pub?gid=457318854&single=true&output=csv'; 
const SHEET_RECIPE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsl9LECSCDb82qUb7iIEU67XDtOsIeGBEXytLelidtSZCMgLKqcsRBUp1ZEMGOLccOz3kOB4KT65xq/pub?gid=472003237&single=true&output=csv';
const SHEET_MATERIALS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSsl9LECSCDb82qUb7iIEU67XDtOsIeGBEXytLelidtSZCMgLKqcsRBUp1ZEMGOLccOz3kOB4KT65xq/pub?gid=0&single=true&output=csv';

async function traceProduct() {
    const lotNo = document.getElementById('lotInput').value.trim();
    const resultArea = document.getElementById('resultArea');
    const loader = document.getElementById('loader');
    const errorMsg = document.getElementById('errorMsg');

    if (!lotNo) {
        alert("Vui lòng nhập mã lô!");
        return;
    }

    // Reset giao diện
    resultArea.style.display = 'none';
    errorMsg.innerText = '';
    loader.style.display = 'block';

    try {
        // 1. Fetch dữ liệu từ Google Sheets (giả lập qua fetch)
        // Trong thực tế, bạn dùng: const response = await fetch(SHEET_URL);
        // Ở đây tôi viết logic xử lý dữ liệu tổng quát:
        
        const lotData = await fetchData(SHEET_LOT_INFO_URL);
        const recipeData = await fetchData(SHEET_RECIPE_URL);

        // 2. Tìm thông tin chung của Lot
        const product = lotData.find(row => row.lot_no === lotNo);

        if (!product) {
            throw new Error("Không tìm thấy mã lô này trong hệ thống.");
        }

        // 3. Hiển thị thông tin chung
        document.getElementById('productInfo').innerHTML = `
            <div class="info-item"><b>Mã Lô</b> ${product.lot_no}</div>
            <div class="info-item"><b>Số lượng</b> ${product.quantity}</div>
            <div class="info-item"><b>Hạn sử dụng (HSD)</b> ${product.HSD}</div>
            <div class="info-item"><b>Khách hàng</b> ${product.customer}</div>
        `;

        // 4. Tìm và hiển thị nguyên liệu/công thức
        const ingredients = recipeData.filter(row => row.lot_no === lotNo);
        let tableHtml = '';
        ingredients.forEach(item => {
            tableHtml += `
                <tr>
                    <td>${item.recipe || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>${item.machine_value}</td>
                    <td>${item.time_start} ${item.date_start}</td>
                    <td>${item.time_finish} ${item.date_finish}</td>
                </tr>
            `;
        });
        document.getElementById('ingredientBody').innerHTML = tableHtml;

        loader.style.display = 'none';
        resultArea.style.display = 'block';

    } catch (err) {
        loader.style.display = 'none';
        errorMsg.innerText = err.message;
    }
}

// Hàm hỗ trợ đọc CSV từ Google Sheets
async function fetchData(url) {
    // Lưu ý: Đây là mã giả định logic parse CSV. 
    // Bạn nên dùng thư viện PapaParse để parse CSV chính xác hơn.
    const response = await fetch(url);
    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, i) => {
            obj[header.trim()] = values[i]?.trim();
            return obj;
        }, {});
    });
}
