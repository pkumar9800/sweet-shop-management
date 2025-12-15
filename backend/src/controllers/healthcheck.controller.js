import mongoose from 'mongoose';

export const healthCheck = (req, res) => {
  const dbState = mongoose.connection.readyState;

  const dbStatusMap = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING'
  };

  res.status(200).json({
    status: 'OK',
    service: 'Sweet Shop API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbStatusMap[dbState] || 'UNKNOWN'
  });
};