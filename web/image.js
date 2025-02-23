const host = 'mariiy.myds.me:403';
const imageTypes = ['intensity', 'eew', 'report', 'lpgm'];
let ws;
let recieved_data = {
    intensity: '',
    eew: '',
    report: '',
    lpgm: '',
};

function connectWebSocket() {
    ws = new WebSocket(`ws://${host}`);

    ws.onopen = () => {
        console.log('已連接到伺服器');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type && data.url) {
            console.log(`receive data: ${data.url}`);
            recieved_data[data.type] = data.url;
        };
        updateImage(data);
    };

    ws.onclose = () => {
        console.log('連接已關閉，嘗試重新連接...');
        setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket 錯誤:', error);
    };
}

function updateImage(data) {
    if (data.type && data.url) {
        const img = document.getElementById(data.type);
        if (img) {
            img.src = data.url;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const box = document.querySelector('.box');
    box.innerHTML = imageTypes.map(type => `
        <img src="" alt="" id="${type}" class="img">
    `).join('');
    
    document.querySelectorAll('.img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function() {
            copyImageUrl(this);
        });
    });
    connectWebSocket();
});

async function copyImageUrl(element) {
    const toast = document.querySelector('.copy-toast');
    try {
        const url = element.src;
        await navigator.clipboard.writeText(url);
        const fileName = url.split('/').pop();
        toast.textContent = `${fileName} 複製成功`;
    } catch (err) {
        console.error('複製失敗:', err);
        toast.textContent = '複製失敗:' + err;
    }

    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
};