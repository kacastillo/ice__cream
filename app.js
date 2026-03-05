// Import the express module

import express from 'express';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';


// Create an instance of an Express application

const app = express();
dotenv.config();

const pool = mysql2.createPool({

    host: process.env.DB_HOST,

    user: process.env.DB_USER,

    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,

    port: process.env.DB_PORT

}).promise();

// Database test route (for debugging)
app.get('/db-test', async (req, res) => {


    try {


  const orders = await pool.query('SELECT * FROM orders');

       res.send(orders[0]);


    } catch (err) {


       console.error('Database error:', err);

       res.status(500).send('Database error: ' + err.message);

    }

});



// Define the port number where our server will listen

const PORT = 3006;
let orders = []; //empty array


// Define a default "route" ('/')
 app.use(express.static('public'));
 app.use(express.json());
 app.set('view engine','ejs');
 app.use(express.urlencoded({extended:true}));



app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('home');
});

// Display all orders

app.get('/admin', async (req, res) => {


    try {

        // Fetch all orders from database, newest first

        const [orders] = await pool.query('SELECT * FROM orders ORDER BY timestamp DESC');  


        // Render the admin page

        res.render('admin', { orders });        


    } catch (err) {

        console.error('Database error:', err);

        res.status(500).send('Error loading orders: '

+ err.message);

    }

});



// Confirmation route - handles form submission

app.post('/confirm', async (req, res) => {


    try {

        // Get form data from req.body

        const order = req.body;        


        // Log the order data (for debugging)

        console.log('New order submitted:', order);

          // Convert toppings array to comma-separated string 

  order.toppings = Array.isArray(order.toppings) ?

              order.toppings.join(", ") : ""; 


        // SQL INSERT query with placeholders to prevent SQL injection

        const sql =

`INSERT INTO orders(customer, email, flavor, cone, toppings)

 VALUES (?, ?, ?, ?, ?);`;


        // Parameters array must match the order of ? placeholders

          // Make sure your property names match your order names

        const params = [

           order.customer,

           order.email,

                order.flavor,

                order.cone,

                order.toppings

        ];

        // Execute the query and grab the primary key of the new row

        const result = await pool.execute(sql, params);

        console.log('Order saved with ID:', result[0].insertId);


        // Render confirmation page with the adoption data

        res.render('confirmation', { order });        


    } catch (err) {


        console.error('Error saving order:', err);

        res.status(500).send('Sorry, there was an error processing your order. Please try again.');

    }

});

app.post('/orders', (req, res) => {
const {
  name,
  email,
  flavor,
  cone, 
  comments
} = req.body;


let toppings = req.body['toppings[]'] || []; //topping as an array

  const order = {
    name,
    email,
    flavors: Array.isArray(flavor) ? flavor : [flavor],
    cone,
    toppings: Array.isArray(toppings) ? toppings : [toppings],
    comment: comments,
    timestamp: new Date()
  }
  orders.push(order);
  res.render('confirm', {order});
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);

});

