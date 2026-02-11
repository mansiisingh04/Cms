// const Artifact = require("../models/artifact.model");
//  exports.createArtifact  = async (req, res) => {
//     const artifact = await Artifact.create({
//         ... req.body,
//         createdBy: req.user.id,

//     });
//     res.json(artifact);
//  };
//  exports.getArtifacts = async (req, res) => {
//     const artifacts = await Artifact.find().populate("createdBy", "email");
//     res.json(artifacts);
//  };
//  exports.toggleLike = async (req, res) => {
//   try {
//     const artifactId = req.params.id;
//     const userId = req.user.id; // from JWT middleware

//     const artifact = await Artifact.findById(artifactId);
//     if (!artifact)
//       return res.status(404).json({ message: "Artifact not found" });

//     const alreadyLiked = artifact.likes.includes(userId);

//     if (alreadyLiked) {
//       // Unlike
//       artifact.likes = artifact.likes.filter(
//         (id) => id.toString() !== userId
//       );
//     } else {
//       // Like
//       artifact.likes.push(userId);
//     }

//     await artifact.save();

//     res.json({
//       message: alreadyLiked ? "Unliked" : "Liked",
//       totalLikes: artifact.likes.length,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error liking artifact" });
//   }
// };
const Artifact = require("../models/artifact.model");

// ✅ Create Artifact
exports.createArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json(artifact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating artifact" });
  }
};

// ✅ Get All Artifacts
exports.getArtifacts = async (req, res) => {
  try {
    const artifacts = await Artifact.find()
      .populate("createdBy", "email")
      .populate("likes", "email");

    res.status(200).json(artifacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching artifacts" });
  }
};

// ✅ Toggle Like
exports.toggleLike = async (req, res) => {
  try {
    const artifactId = req.params.id;
    const userId = req.user.id;

    const artifact = await Artifact.findById(artifactId);

    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    // Proper ObjectId comparison
    const alreadyLiked = artifact.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      // Unlike
      artifact.likes = artifact.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Like
      artifact.likes.push(userId);
    }

    await artifact.save();

    res.status(200).json({
      message: alreadyLiked ? "Unliked successfully" : "Liked successfully",
      totalLikes: artifact.likes.length,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error toggling like" });
  }
};
