const refreshInterval = 5000;
const imageUrls = {
    intensity: 'https://api-1.exptech.dev/file/images/intensity',
    eew: 'https://api-1.exptech.dev/file/images/eew',
    report: 'https://api-1.exptech.dev/file/images/report',
    lpgm: 'https://api-1.exptech.dev/file/images/lpgm'
};

let lastImages = {
    intensity: '',
    eew: '',
    report: '',
    lpgm: ''
};

async function getLatestImageUrl(baseUrl) {
    try {
        const response = await fetch(baseUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'))
            .map(a => a.href)
            .filter(href => href.endsWith('.jpg') && !href.includes('CWAEEW1-1.jpg'));

        if (baseUrl.includes('report')) {
            return getLatestReportImage(links, baseUrl);
        }
        return links.length ? `${baseUrl}/${links.sort().pop().split('/').pop()}` : null;
    } catch (error) {
        console.error(`Error fetching ${baseUrl}:`, error);
        return null;
    }
}

function getLatestReportImage(links, baseUrl) {
    const pattern = /(\d{4}-\d{4}-\d{6})\.jpg/;
    const validImages = links
        .map(link => {
            const match = link.match(pattern);
            if (match) {
                const date = new Date(
                    match[1].replace(/(\d{4})-(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/, 
                    '$1-$2-$3T$4:$5:$6')
                );
                return { date, link };
            }
            return null;
        })
        .filter(item => item !== null);

    if (validImages.length) {
        const latest = validImages.sort((a, b) => b.date - a.date)[0];
        return `${baseUrl}/${latest.link.split('/').pop()}`;
    }
    return null;
}

async function updateImages() {
    for (const [type, baseUrl] of Object.entries(imageUrls)) {
        const latestUrl = await getLatestImageUrl(baseUrl);
        if (latestUrl && latestUrl !== lastImages[type]) {
            document.getElementById(type).src = latestUrl;
            lastImages[type] = latestUrl;
        }
    }
}

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
}

document.querySelectorAll('.img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
        copyImageUrl(this);
    });
});

updateImages();
setInterval(updateImages, refreshInterval); 