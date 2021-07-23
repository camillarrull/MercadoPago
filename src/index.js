'use strict';
 
const { readFileSync } = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const https = require('http');
const mysql = require('mysql');
const mercadopago = require('mercadopago'); 
require('dotenv').config();
 
/*
https/ssl

const key	= readFileSync('/etc/letsencrypt/live/francoromaniello.com-0001/privkey.pem', 'utf8');
const cert = readFileSync('/etc/letsencrypt/live/francoromaniello.com-0001/fullchain.pem', 'utf8');
*/

mercadopago.configure({
    access_token: process.env.MERCADOPAGO_TOKEN
});

let connection = null;

const onConnect = () => {
	return new Promise((resolve, reject)=> {
		connection = mysql.createConnection({
			host: process.env.MYSQL_HOST,
			user: process.env.MYSQL_USER,
			password: process.env.MYSQL_PASSWORD,
			database: process.env.MYSQL_DB,
		});
		
		connection.connect(function(error) {
			if(error) {
				console.log('[MySql Service] Error al conectar con el servidor.');
				reject('[MySql Service] Error al conectar con el servidor.');
				return;
			}

			console.log('[MySql Service] Conectado.');
			resolve('[MySql Service] Conectado.');
		})
	});
}
 
onConnect()
	.then(async () => {
	app.use(cors());
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.post('/webhook/payment', (req, res) => {
		console.log(req.body);
		res.status(200).send('ok');
	});
	
	// Esta ruta es llamada por tu formulario previo a mandarlo a MercadoPago
	app.post('/checkout', (req, res) => {
		console.log('SELECT * FROM items WHERE id="'+parseInt(req.body.item_id)+'"');
		console.log(req.body);

		connection.query('SELECT * FROM items WHERE id="'+parseInt(req.body.item_id)+'"', function (error, result, fields) {
			if (error) {
				console.log('[Mysql] Error on load item.');
				res.response(401).send('error al cargar el checkout.');

				return;
			}
			
			result = result[0];
			
			// Crea un objeto de preferencia
			// NO obtener el precio del producto desde lo que pasas por medio de res/req por que puede ser modificado por el 
			// usuario final.
			let preference = {
				items: [
					{
						title: result.name,
						unit_price: parseFloat(result.price),
						quantity: 1,
					}
				],
				redirect_urls: {
					failure: process.env.MERCADOPAGO_REDIRECT_URL,
					pending: process.env.MERCADOPAGO_REDIRECT_URL,
					success: process.env.MERCADOPAGO_REDIRECT_URL
				},
			};
		
			mercadopago.preferences.create(preference)
			.then(function (response) {
				console.log(response.body.id);
				
				connection.query("INSERT INTO payment (name, email, payment_id, status) VALUES (?,?,?,'PENDING')",
				[req.body.name, req.body.email, response.body.id],
				function(error, results, fields) {
					if(error) {
						console.log(error);
						res.status(401).send('error');
						
						return;
					}

					res.redirect(response.body.init_point);
				});
			}).catch(function (error) {
				console.log(error);
				
				res.status(401).send('error');
			});
		});
	});
	
	app.post('/pagado', (req, res) => {
		console.log('pagado exitoso');
	});

	app.get('*', (req, res) => { 
		res.sendFile(path.join(__dirname, '../public/index.html'));
	});
	
	const httpsServer = https.createServer(/*{key, cert}, */app);
	httpsServer.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, ()=> console.log(`Server on-line on ${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`));
}).catch( (err)=> console.log(err) );