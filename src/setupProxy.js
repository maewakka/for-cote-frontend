const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  // 기존 /api 프록시
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // /api로 시작하는 경로를 제거
      },
    })
  );

  // 새로운 /api2 프록시 추가
  app.use(
    "/api2",
    createProxyMiddleware({
      target: "http://localhost:5051", // 다른 서버에 프록시를 연결할 수 있음
      changeOrigin: true,
      pathRewrite: {
        '^/api2': '', // /api2로 시작하는 경로를 제거
      },
    })
  );

    // 새로운 /api2 프록시 추가
    app.use(
      "/baekjoon",
      createProxyMiddleware({
        target: "https://www.acmicpc.net", // 다른 서버에 프록시를 연결할 수 있음
        changeOrigin: true,
        pathRewrite: {
          '^/baekjoon': '', // /api2로 시작하는 경로를 제거
        },
      })
    );
};
