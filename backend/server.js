const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

// Connect DB
connectDB();

const app = express();

// =======================
// ✅ Create Default Admin
// =======================
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);

      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });

      console.log('✅ Default admin created: admin@example.com / Admin123!');
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

createDefaultAdmin();

// =======================
// ✅ Security Middleware
// =======================
app.use(helmet());

app.use(cors({
  origin: 'https://primetrade-ai-task-swart.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// =======================
// ✅ Rate Limiting
// =======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// =======================
// ✅ Body Parser
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// ✅ Logging (Dev only)
// =======================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// =======================
// ✅ Routes
// =======================
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/tasks', require('./routes/taskRoutes'));

// =======================
// ✅ Swagger Docs
// =======================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =======================
// ✅ Health Check
// =======================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running 🚀',
  });
});

// =======================
// ❌ 404 Handler
// =======================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`,
  });
});

// =======================
// ❌ Global Error Handler
// =======================
app.use(errorHandler);

// =======================
// 🚀 Server Start
// =======================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📄 Docs: http://localhost:${PORT}/api-docs`);
});

// =======================
// ❌ Unhandled Rejection
// =======================
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});