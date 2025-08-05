require('dotenv').config();
const cors = require('cors');
let express = require('express');
const middleware = require("./middleware/middleware")
const { createClient } = require('@supabase/supabase-js')

let port = 4040;
let app = express();
let pool;

app.use(middleware.setCorsHeaders);
app.use(cors(middleware.corsOptions));
app.use(express.json());

const supabase = createClient(
  process.env.supabaseUrl,
  process.env.supa_key
)

app.get('/data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*');

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post("/email", async (req, res) => {
  try {
    console.log(req.body)
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