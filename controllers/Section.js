const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
exports.createSection = async (req, res) => {
  try {

    const { sectionName, courseId } = req.body;
    // validate the section
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Section Name  and coureseId both are mandetory ",
      });
    }
    // create the section
    const newSection = await Section.create({ sectionName });
    console.log("New Sections is ", newSection);


    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    console.log("Updated course Schema is", updatedCourse);

    // return the response
    res.status(201).json({
      success: true,
      message: "New section has created successfully ",
      data: updatedCourse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while creating the section , Internal server Problem ",
    });
  }
};

// update the section details
exports.updateSection = async (req, res) => {
  try {
    //step-1 fecth the data
    const { sectionName, sectionId, courseId } = req.body;

    console.log(sectionName, sectionId, courseId);
    //step-2  validate the data

    if (!sectionName || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Section Name and sectionId and courseId all are mandetory ",
      });
    }

    //step-3 update the section details
    const updateSectionDetails = await Section.findByIdAndUpdate(
      sectionId,
      //   on the basis of sectionId we update the name of the section
      { sectionName },
      { new: true }
    );

    //step-4 no need to update the course schema bcs
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    //step-5 return response
    return res.status(200).json({
      success: true,
      message: " Section Details has updated successfully",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while Updating the section Details, Internal server Problem ",
    });
  }
};

// delete the section
exports.deleteSection = async (req, res) => {
  try {


    const { sectionId, courseId } = req.body;

    console.log("SectionID IS =>", sectionId, "CourseID IS=>", courseId);
    //step-2 validate the section
    if (!sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "SectionId and coureseId both are mandetory ",
      });
    }

    // remove the sectionId which is going to delete
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });

    // find the section of given sectionid
    const section = await Section.findById(sectionId);
    console.log("section info is", section);
    // validate the section details
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "No Section found",
      });
    }

    // $in operator selects the documents where the value of a field equals any value in the specified array.
    await SubSection.deleteMany({ _id: { $in: section.subSection } });

    //step-4 Finally delete the section
    // const deleteSection =
    await Section.findByIdAndDelete({ _id: sectionId });
    // console.log("deleted section is ", deleteSection);

    //step-5 update the Course schema bcs Course schema there is Coursecontent array
    

    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    console.log(
      "Updated Course Scheema after removing section id from it ",
      course
    );

    // step-5
    res.status(200).json({
      success: true,
      message: "Section has been deleted ",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message:
        "Error Occured while deleting the section , Internal server Problem ",
    });
  }
};
