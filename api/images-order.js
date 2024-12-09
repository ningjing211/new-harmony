const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const jsonFilePath = path.join(process.cwd(), '/imagesOrder.json');

    // 檢查文件是否存在
    if (!fs.existsSync(jsonFilePath)) {
        console.error('JSON file not found:', jsonFilePath);
        return res.status(404).json({ error: 'File not found' });
    }

    // 讀取文件並返回 JSON 數據
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return res.status(500).json({ error: 'Error reading data' });
        }
        try {
            res.status(200).json(JSON.parse(data));
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).json({ error: 'Error parsing data' });
        }
    });
}
