import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;
const server = createServer(app);
const io = new Server(server);

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);
const staticPath = join(__dirname, "../Public");
const viewPath = join(__dirname, "../Views");
const assetPath = join(__dirname, "../Assets");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    origin: `http://localhost:${port}`,
    methods: ["post", "put"]
}));
app.use("/Public", express.static(staticPath));
app.use("/Assets", assetPath);
app.set("view engine", "hbs");
app.set("views", viewPath);

server.listen(port, ()=>{
    console.log(`Server is running at : http://localhost:${port}`);
});