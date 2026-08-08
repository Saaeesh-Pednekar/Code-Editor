import express from "express";
import { runCpp } from "../compiler/cppRunner.js";

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const { code, stdin } = req.body;

        if (!code || !code.trim()) {

            return res.status(400).json({

                success: false,

                type: "validation_error",

                language: "cpp",

                output: "",

                error: "No source code provided.",

                exitCode: -1,

                executionTime: 0

            });

        }

        const result = await runCpp(
            code,
            stdin ?? ""
        );

        return res.json(result);

    }

    catch (err) {

        return res.status(500).json({

            success: false,

            type: "server_error",

            language: "cpp",

            output: "",

            error: err.message,

            exitCode: -1,

            executionTime: 0

        });

    }

});

export default router;