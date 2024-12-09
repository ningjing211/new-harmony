const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static assets from the "public" directory (for images, sounds, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the "dist" directory (the built files from Parcel)
app.use(express.static(path.join(__dirname, 'dist')));


// Serve the main HTML file from the "dist" directory (after build)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// 提供 JSON 檔案資料的 API
app.get('/api/images-order', (req, res) => {
  const jsonFilePath = path.join(__dirname, '/imagesOrder.json');
  console.log('Checking JSON file at:', jsonFilePath);
  console.log('File exists:', fs.existsSync(jsonFilePath));
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).send('Error reading data');
      } else {
        res.json(JSON.parse(data));
      }
  });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

