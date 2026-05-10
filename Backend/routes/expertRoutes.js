const express = require("express");
const {
    getExperts,
    getExpertById,
    createExpert,
    deleteExpert,
} = require("../controllers/expertController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getExperts);
router.get("/:id", getExpertById);
router.post("/", protect, adminOnly, createExpert);
router.delete("/:id", protect, adminOnly, deleteExpert);

module.exports = router;