const http = require("http");
const url = require("url");
const routes = require("./routes");
const bodyParse = require("./helpers/bodyParse");

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  console.log(
    `request method: ${req.method} | endpoint: ${parsedUrl.pathname}`
  );

  let { pathname } = parsedUrl;
  let id = null;

  const splitEndPoint = pathname.split("/").filter(Boolean);

  if (splitEndPoint.length > 1) {
    pathname = `/${splitEndPoint[0]}/:id`;
    id = splitEndPoint[1];
  }
  const route = routes.find(
    (routerObj) =>
      routerObj.endpoint === pathname && routerObj.method === req.method
  );

  if (route) {
    req.query = parsedUrl.query;
    req.params = { id };
    res.send = (statusCode, body) => {
      res.writeHead(statusCode, { "content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      bodyParse(req, () => route.handler(req, res));
    } else {
      route.handler(req, res);
    }
  } else {
    res.writeHead(404, { contentType: "text/html" });
    res.end(`cannot ${req.method} ${parsedUrl.pathname}`);
  }
});

server.listen(8080, () =>
  console.log("server is running http://localhost:8080")
);
