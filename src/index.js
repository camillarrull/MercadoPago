'use strict';
 
const { readFileSync } = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const https = require('https');
//const { Connection } = require('./configs/db');
//const router = require('./routes/routes');
//const swaggerUi = require('swagger-ui-express'); 
//const swaggerDocument = require('../swagger.json'); 
 
//require('dotenv').config();
 
const host = '127.0.0.1';
const port = 3000;
 
const key	= readFileSync('ssl/key.key', 'utf8');
const cert = readFileSync('ssl/cert.crt', 'utf8');
 /*
const onConnect = () => {
	return new Promise((resolve, reject)=> {
	const { connection } = new Connection();
	connection.authenticate()
		.then( () => resolve('CONECTADO A DB') )
		.catch( (error) => reject(`Error ${error}`) );
	});
}
 
onConnect()
	.then(async () => {*/
	app.use(cors());
	//app.use(express.static(path.join(__dirname, 'public/cs-dashboard')));
	app.use(express.json());
	//app.use('/', router);
 
	app.get('*', (req, res) => { 
		res.sendFile(path.join(__dirname, 'public/index.html'));
	});
	
	app.post('/webhook/payment', (req, res) => {
		console.log(req.body);
		res.status(200).send('ok');
	});
	
	app.get('/', (req, res) => {
		console.log(req.body);
		res.status(200).send('ok');
	});
	//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); 
	
	const httpsServer = https.createServer({key, cert}, app);
	httpsServer.listen(port, host, ()=> console.log(`Server Online port ${host}:${port}`));
//}).catch( (err)=> console.log(err) );