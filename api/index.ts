require('dotenv').config();
const cors = require('cors');
let express = require('express');
const middleware = require("./middleware/middleware")
const { createClient } = require('@supabase/supabase-js')
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');
const nodemailer = require('nodemailer');
const { generateProductEmailHTML } = require('./html/createHtml');


let port = 4040;
let app = express();

app.use(middleware.setCorsHeaders);
app.use(cors(middleware.corsOptions));
app.use(express.json());

const allowedCategories = ["bedroom", "living room", "kitchen"];

const eventSchema = Joi.object({
  id: Joi.number().integer().required(),
  date: Joi.string().isoDate().required(),
  title: Joi.string().max(100).required(),
  description: Joi.string().max(500).required(),
  attendees: Joi.array().items(Joi.string().max(50)).required()
});

const itemSchema = Joi.object({
  id: Joi.number().integer().required(),
  src: Joi.array().items(Joi.string().max(100)).min(1).required(), // array of valid URLs
  sold: Joi.boolean().required(),
  heading: Joi.string().max(100).required(),
  description: Joi.string().max(1000).required(),
  interestee: Joi.string().max(50).required(),
  tags: Joi.array()
    .items(Joi.string().valid(...allowedCategories))
    .min(1)
    .required()
});

const supabase = createClient(
  process.env.supabaseUrl,
  process.env.supa_key
);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: process.env.email_user,
    pass: process.env.password
  }
});

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
  const { error, value } = itemSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });

  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
    });
  }
  try {
    const item = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New interest alert for ${item.heading}`,
      html: generateProductEmailHTML(item)
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return console.error('Email failed:', err);
      }
      console.log('Email sent:', info.response);
    });

    generateProductEmailHTML(item)


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