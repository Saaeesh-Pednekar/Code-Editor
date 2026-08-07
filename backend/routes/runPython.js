import express from "express";
import { runPython } from "../compiler/pythonRunner.js";

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const { code, stdin } = req.body;

        if (!code) {

            return res.status(400).json({

                success: false,

                error: "No source code provided."

            });

        }

        const result = await runPython(code, stdin);

        res.json(result);

    } catch (err) {

        res.status(500).json({

            success: false,

            output: "",

            error: err.message

        });

    }

});

export default router;