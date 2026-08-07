import express from "express";
import cors from "cors";

import pythonRoute from "./routes/runPython.js";
import cppRoute from "./routes/runCpp.js";
import javaRoute from "./routes/runJava.js";

const app = express();

app.use(cors());

app.use(express.json({
    limit: "10mb"
}));

app.get("/", (req, res) => {

    res.json({

        server: "CodeBox Compiler",

        status: "Running"

    });

});

app.use("/api/python", pythonRoute);

app.use("/api/cpp", cppRoute);

app.use("/api/java", javaRoute);

const PORT = 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});