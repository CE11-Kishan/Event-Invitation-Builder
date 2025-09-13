import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;
const startedAt = Date.now();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
