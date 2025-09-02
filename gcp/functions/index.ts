import { http } from '@google-cloud/functions-framework';
import express from 'express';
import cors from 'cors';
import { BigQuery } from '@google-cloud/bigquery';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Storage } from '@google-cloud/storage';

// Initialize services
const bigquery = new BigQuery();
const secretClient = new SecretManagerServiceClient();
const storage = new Storage();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://storage.googleapis.com', 'https://health-insight-ventures.web.app'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Query BigQuery for user
    const query = `
      SELECT id, email, password_hash, role, first_name, last_name
      FROM \`health_insight_platform.users\`
      WHERE email = @email
      LIMIT 1
    `;
    
    const options = {
      query: query,
      params: { email }
    };
    
    const [rows] = await bigquery.query(options);
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Verify password (implement bcrypt comparison)
    // const isValid = await bcrypt.compare(password, user.password_hash);
    
    // For now, return success (implement proper auth)
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token: 'jwt-token-here' // Implement JWT
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Users routes
app.get('/api/users', async (req, res) => {
  try {
    const query = `
      SELECT id, first_name, last_name, email, role, created_at
      FROM \`health_insight_platform.users\`
      ORDER BY created_at DESC
      LIMIT 100
    `;
    
    const [rows] = await bigquery.query(query);
    res.json(rows);
    
  } catch (error) {
    console.error('Users query error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Resources routes
app.get('/api/resources', async (req, res) => {
  try {
    const { category, city, state } = req.query;
    
    let query = `
      SELECT *
      FROM \`health_insight_platform.resources\`
      WHERE verified = true
    `;
    
    const params: any = {};
    
    if (category) {
      query += ` AND category = @category`;
      params.category = category;
    }
    
    if (city) {
      query += ` AND LOWER(city) = LOWER(@city)`;
      params.city = city;
    }
    
    if (state) {
      query += ` AND LOWER(state) = LOWER(@state)`;
      params.state = state;
    }
    
    query += ` ORDER BY rating DESC, review_count DESC LIMIT 50`;
    
    const options = { query, params };
    const [rows] = await bigquery.query(options);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Resources query error:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
});

// Appointments routes
app.get('/api/appointments', async (req, res) => {
  try {
    const { patient_id, provider_id } = req.query;
    
    let query = `
      SELECT *
      FROM \`health_insight_platform.appointments\`
      WHERE 1=1
    `;
    
    const params: any = {};
    
    if (patient_id) {
      query += ` AND patient_id = @patient_id`;
      params.patient_id = patient_id;
    }
    
    if (provider_id) {
      query += ` AND provider_id = @provider_id`;
      params.provider_id = provider_id;
    }
    
    query += ` ORDER BY start_time ASC`;
    
    const options = { query, params };
    const [rows] = await bigquery.query(options);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Appointments query error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

// Medications routes
app.get('/api/medications', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }
    
    const query = `
      SELECT *
      FROM \`health_insight_platform.medications\`
      WHERE user_id = @user_id AND active = true
      ORDER BY created_at DESC
    `;
    
    const options = {
      query: query,
      params: { user_id }
    };
    
    const [rows] = await bigquery.query(options);
    res.json(rows);
    
  } catch (error) {
    console.error('Medications query error:', error);
    res.status(500).json({ message: 'Failed to fetch medications' });
  }
});

// Events routes
app.get('/api/events', async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM \`health_insight_platform.events\`
      WHERE start_time >= CURRENT_TIMESTAMP()
      ORDER BY start_time ASC
      LIMIT 50
    `;
    
    const [rows] = await bigquery.query(query);
    res.json(rows);
    
  } catch (error) {
    console.error('Events query error:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Forum posts routes
app.get('/api/forum/posts', async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = `
      SELECT p.*, u.first_name, u.last_name
      FROM \`health_insight_platform.forum_posts\` p
      LEFT JOIN \`health_insight_platform.users\` u ON p.author_id = u.id
      WHERE p.moderation_status = 'approved'
    `;
    
    const params: any = {};
    
    if (category) {
      query += ` AND p.category = @category`;
      params.category = category;
    }
    
    query += ` ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT 20`;
    
    const options = { query, params };
    const [rows] = await bigquery.query(options);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Forum posts query error:', error);
    res.status(500).json({ message: 'Failed to fetch forum posts' });
  }
});

// Wellness tips routes
app.get('/api/wellness-tips', async (req, res) => {
  try {
    const { user_id, category } = req.query;
    
    let query = `
      SELECT *
      FROM \`health_insight_platform.wellness_tips\`
      WHERE 1=1
    `;
    
    const params: any = {};
    
    if (user_id) {
      query += ` AND user_id = @user_id`;
      params.user_id = user_id;
    }
    
    if (category) {
      query += ` AND category = @category`;
      params.category = category;
    }
    
    query += ` ORDER BY created_at DESC LIMIT 10`;
    
    const options = { query, params };
    const [rows] = await bigquery.query(options);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Wellness tips query error:', error);
    res.status(500).json({ message: 'Failed to fetch wellness tips' });
  }
});

// Export the Express app as a Cloud Function
http('health-insight-api', app);