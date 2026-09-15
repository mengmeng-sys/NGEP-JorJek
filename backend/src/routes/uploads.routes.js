const { Router } = require("express");
const multer = require("multer");
const { supabase } = require("../config/db");
const { requireAuth } = require("../middleware/auth.middleware");

const uploadsRouter = Router();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            const err = new Error(`Unsupported file type: ${file.mimetype}`);
            err.status = 400;
            return cb(err);
        }
        cb(null, true);
    }
});

uploadsRouter.post("/", requireAuth, upload.single("file"), async (req, res, next ) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file provided" });
        }

        const path = `${req.userId}/${Date.now()}-${req.file.originalname}`;

        const { error: uploadError } = await supabase.storage
            .from("attachments")
            .upload(path, req.file.buffer, { contentType: req.file.mimetype });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("attachments").getPublicUrl(path);

        res.status(201).json({ url: data.publicUrl });
    } catch (err) {
        next(err);
    }
});

module.exports = { uploadsRouter };
