const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();

// Configure MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student'
});

// connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
  console.log('Server started on port ' + PORT);
  });

  console.log('Connected to MySQL');
});

// configure multer file upload settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from public directory
app.use(express.static(__dirname + '/public'));

// define routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM student';
  db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    res.render('index', { student: results });
  });
});

// display students
app.get('/add', (req, res) => {
  res.render('add');
});

// add student
app.post('/add', upload.single('profile'), (req, res) => {
  const { fullname, age, gender, address, course} = req.body;
  const profile = req.file.filename;

  const sql = 'INSERT INTO student (fullname, age, gender, address, course, profile) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [fullname, age, gender, address, course, profile], (err, result) => {
    if (err) {
      throw err;
    }
    res.redirect('/');
  });
});

//update student through id params
app.get('/update/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM student WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      throw err;
    }
    res.render('update', { student: result[0] });
  });
});

//update student through id params
app.post('/update/:id', upload.single('profile'), (req, res) => {
  const { id } = req.params;
  const { fullname, age, gender, address, course} = req.body;
  const profile = req.file ? req.file.filename : null;

  let sql = 'UPDATE student SET fullname = ?, age = ?, , gender = ?, address = ?, course = ?';
  const values = [fullname, age, gender, address, course];
  if (profile) {
    sql += ', profile = ?';
    values.push(profile);
  }
  sql += ' WHERE id = ?';
  values.push(id);

  db.query(sql, values, (err=> {
    if (err) {
      throw err;
    }
    res.redirect('/');
  }));
});

// delete student
app.get('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM student WHERE id = ?';
  db.query(sql, [id], (err, result) => {
  if (err) {
  throw err;
  }
    res.redirect('/');
  });
});
  