const express = require('express');
const https = require('https');
const app = express();
const bodyParser = require('body-parser')
// SDK de Mercado Pago
const mercadopago = require('mercadopago');
const fs = require('fs');

var key = fs.readFileSync(__dirname + '/../ssl/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/../ssl/selfsigned.crt');
var options = {
  key: key,
  cert: cert
};

//middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Agrega credenciales
//ACA IRIA LA REAL
mercadopago.configure({
	access_token: "APP_USR-4156353893147073-060817-79fb32f7510503cec7c76a70cc6da56a-772344190"
});

//ROUTES
app.post('/checkout', (req, res) => {
	// Crea un objeto de preferencia
	let preference = {
		items: [
			{
				title: req.body.title,
				unit_price: parseInt(req.body.price),
				quantity: 1,
			}
		]
	};

	mercadopago.preferences.create(preference)
		.then(function (response) {
			//ACA VA LA RTA DE NUESTRO SERVIDOR
			
			res.redirect(response.body.init_point)
		}).catch(function (error) {
			console.log(error);
		});
})

//SERVER
/*
app.listen(3000, () => {
	console.log('server on port 3000')
})
*/
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(3000);

console.log('[Cami-App] Hello There');