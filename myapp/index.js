const express = require('express');
const passport = require('passport');
const { JWTStrategy } = require('@sap/xssec');
const xsenv = require('@sap/xsenv');
const { getProducts, getProductsByName } = require('./lib/repository');

const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Carregar configurações do serviço UAA
xsenv.loadEnv();
passport.use(new JWTStrategy(xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa));

app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

// Middleware para verificar o escopo de leitura
function checkReadScope(req, res, next) {
  if (req.authInfo.checkLocalScope('read')) {
    return next();
  } else {
    console.log('Missing the expected scope');
    res.status(403).end('Forbidden');
  }
}

app.put('/callback/v1.0/tenants/*', function (req, res) {
  var consumerSubdomain = req.body.subscribedSubdomain;
  var tenantAppURL = "https:\/\/" + consumerSubdomain + "-approuter-product-list-ap25." + "cfapps.br10.hana.ondemand.com/products";
  res.status(200).send(tenantAppURL);
  });

app.delete('/callback/v1.0/tenants/*', function (req, res) {
  var consumerSubdomain = req.body.subscribedSubdomain;
  var tenantAppURL = "https:\/\/" + consumerSubdomain + "-approuter-product-list-ap25." + "cfapps.br10.hana.ondemand.com/products";
  res.status(200).send(tenantAppURL);
});



// Rotas
app.get('/products', checkReadScope, getProducts);
app.use('/', express.static('static/'));

app.listen(port, () => {
  console.log('Application listening at port %s', port);
});
