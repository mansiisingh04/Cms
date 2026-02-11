const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const artifactController = require("../controllers/artifact.controller");

router.post("/", auth, artifactController.createArtifact);
router.get("/", artifactController.getArtifacts);
router.put("/like/:id", auth, artifactController.toggleLike);

module.exports = router;
