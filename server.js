const express = require('express');
const app = express();

function main(isHttp) {
  //CORS handle
  app.use(require('./handlers/cors-handler').cors);

  //server tin tức
  app.use('/site-manager/news', require('./routes/news/news-route'));

  if (isHttp) {
    const httpServer = require('http').createServer(app);
    const portHttp = process.env.PORT || isHttp;
    httpServer.listen(portHttp, () => {
      console.log("Server is running in port: " + portHttp);
    });
  }
}

const isHttp = 9238;

main(isHttp);