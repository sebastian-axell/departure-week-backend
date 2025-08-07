require('dotenv').config();
const cors = require('cors');
let express = require('express');
const middleware = require("./middleware/middleware")
const { createClient } = require('@supabase/supabase-js')
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');

let port = 4040;
let app = express();

app.use(middleware.setCorsHeaders);
app.use(cors(middleware.corsOptions));
app.use(express.json());

const eventSchema = Joi.object({
  id: Joi.number().integer().required(),
  date: Joi.string().isoDate().required(),
  title: Joi.string().max(100).required(),
  description: Joi.string().max(500).required(),
  attendees: Joi.array().items(Joi.string().max(50)).required()
});

function sanitizeEventData(data) {
  return {
    ...data,
    title: sanitizeHtml(data.title),
    description: sanitizeHtml(data.description),
    attendees: data.attendees.map(name => sanitizeHtml(name))
  };
}

const supabase = createClient(
  process.env.supabaseUrl,
  process.env.supa_key
)

app.get('/stuff', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('stuff')
      .select('*')

    if (error != null) {
      throw new Error(error.message)
    }
    
    res.json(data);
  } catch (error) {

    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/events', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error != null) {
      throw new Error(error.message)
    }

    res.json(data);

  } catch (error) {

    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post("/events", async (req, res) => {
  const { error, value } = eventSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      error: 'Invalid request'
    });
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .upsert(req.body);

    if (error != null) {
      throw new Error(error.message)
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: 'Internal server error' })
  }
})

app.post("/email", async (req, res) => {
  try {
    console.log(req.body);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});

module.exports = app;