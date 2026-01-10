
import { createServer } from "http";

const port = parseInt(process.env.PORT || "3000", 10);

console.log("Starting Minimal Debug Server...");
console.log(`Environment PORT: ${process.env.PORT}`);

const server = createServer((req, res) => {
    console.log(`[DEBUG_REQUEST] ${req.method} ${req.url} headers=${JSON.stringify(req.headers)}`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Minimal Server is Working!");
});

server.listen(port, "0.0.0.0", () => {
    console.log(`Minimal Server listening on 0.0.0.0:${port}`);
});

server.on("error", (err) => {
    console.error("Server Error:", err);
});
