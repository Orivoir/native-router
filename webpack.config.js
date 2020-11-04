const path = require('path');

module.exports = {

  entry: ["@babel/polyfill", "./src/Router.js" ],
  output: {
    filename: "Router.poly.js",
    path: path.resolve( __dirname, "./dist/" )
  },
};