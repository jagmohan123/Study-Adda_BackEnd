const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const uploadVideotoCloudinary = require("../utility/uploadVideotoCloudinary");
require("dotenv").config();
// create the subsection
exports.createSubSection = async (req, res) => {
  try {
    //step-1 fecth tha data from the body we can pass timeDuration but we can calculate b video kee length
    const { title, description, sectionId } = req.body;

    console.log("title and description is ", title, "   ", description);

    // here video is key in postman when we send the video from postman
    const videoFile = req.files.video;

    console.log("Video from Body", videoFile);

    //step-2 validation of data
    if (!title || !description || !sectionId || !videoFile) {
      return res.status(400).json({
        success: false,
        message: "all feilds are mandetory ",
      });
    }

    // step-3 so upload our video files by  uploadVideotoCloudinary this function
    const uploadVideo = await uploadVideotoCloudinary(
      videoFile,
      process.env.FOLDER_NAME
    );

    console.log("upload video contain", uploadVideo);

    // step-4 create the subsection
    const newSubSection = await SubSection.create({
      title: title,
      description: description,
      timeDuration: `${uploadVideo.duration}`,
      videoUrl: uploadVideo.secure_url,
    });

    // step-5 if i create the subsection so we have to update the section schema bcs 
   

    console.log("New subsection is ", newSubSection);

    const updatedSection = await Section.findOneAndUpdate(
      { _id: sectionId },

      {
        $push: {
          subSection: newSubSection._id,
        },
      },
      { new: true }
    )
      .populate("subSection")
      .exec();

    // step-6 now return the response
    return res.status(201).json({
      success: true,
      message: "New SubSection has been created successfully ",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while creating the SubSection , Internal server Problem ",
    });
  }
};

// update the subsection

exports.updateSubSection = async (req, res) => {
  try {
    //step-1 fecth tha data from the body
    const { sectionId, subSectionId, title, description } = req.body;

    console.log("sectionId", sectionId);
    console.log("subsectionId", subSectionId);

    // step 2 find the subsction details by subsection id
    const subSection = await SubSection.findById(subSectionId);
    console.log("All the subsection details are", subSection);
    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    // step-3 validate all the feilds
    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }

   
    if (req.files && req.files.video !== undefined) {
      const videoFile = req.files.video;
      const uploadedVideo = await uploadVideotoCloudinary(
        videoFile,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl =  uploadedVideo.secure_url;
      //  `${uploadedVideo.duration}` give the total duration of the video
      subSection.timeDuration = `${uploadedVideo.duration}`;
    }

  

    // step-4 update the subsection details

    await subSection.save();
   
    // find updated section and return it
    const updatedSection = await Section.findById(sectionId)
    .populate(
      "subSection"
    );

    console.log("updated data ",updatedSection);


    // step-5 now return the response
    return res.status(200).json({
      success: true,
      message: " SubSection details has been updated successfully ",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while updating the SubSection , Internal server Problem ",
    });
  }
};

// Delete the subsection
exports.deleteSubSection = async (req, res) => {
  try {
    //step-1 fecth tha data from the body
    const { subSectionId, sectionId } = req.body;

    console.log(subSectionId, sectionId);
    //step-2 validation of data
    if (!subSectionId || !sectionId) {
      return res.status(404).json({
        success: false,
        message: "subSectionId and sectionId both are required ",
      });
    }

    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId,
        },
      },
      { new: true }
    );
    // step-3 delete the subsection details
    const deleteSubSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });

    if (!deleteSubSection) {
      return res
        .status(404)
        .json({ success: false, message: "SubSection not found" });
    }

    console.log("Deleted Susection ", deleteSubSection);
        

    // find the updated section and return it
    const updatedSection = await Section.findById(sectionId).populate(
      "subSection"
    );

    console.log("Section schema Updated details", updatedSection);

    // step-5 now return the response
    return res.status(200).json({
      success: true,
      message: " SubSection  has been deleted successfully ",
      data: updatedSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while deleting the SubSection , Internal server Problem ",
    });
  }
};
