const Category = require("../models/Category");
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
// create the tag
exports.createCategory = async (req, res) => {
  try {
    // fecth all the data of Category which is need tp create the Category
    const { name, description } = req.body;
    // validate the data

    if (!name || !description) {
      return res.status(403).json({
        success: false,
        message: "All feilds are required for the creation of Category",
      });
    }

    // create the Category
    const newCategory = await Category.create({
      name: name,
      description: description,
    });

    console.log("Category details =>", newCategory);

    // return the response

    return res.status(201).json({
      success: true,
      message: "Category is created successfully",
      CategoryData: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "unable to create the New Category, Internal server issue ",
    });
  }
};

// get all the Category
exports.getAllCategory = async (req, res) => {
  try {
    const categoryDetails = await Category.find({
      // name: true,
      // description: true,
    });
    if (categoryDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "There is no category found please create at least one",
      });
    }
    console.log("categories are", categoryDetails);
    return res.status(200).json({
      success: true,
      message: "All the categories are fetched successfully",
      data: categoryDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetched all the Categories, Internal server Issue",
    });
  }
};

// category page details
exports.categoryPageDetails = async (req, res) => {
  try {
    // find the category id
    const { categoryId } = req.body;
    console.log("PRINTING CATEGORY ID: ", categoryId);

    // get all the data of specific category id
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();

    console.log("Selected Courses", selectedCategory);
    // Handle the case when the category is not found
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "No Category found !!!!",
      });
    }

    // check in category if there is no course exist
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    // get Course from different category
    // $ne means not equal to
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = await Category.findOne(
      categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();

    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();



    const allCourses = allCategories.flatMap((category) => category.courses);

    // find the most sellling courses.
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
    console.log("mostSellingCourses COURSE", mostSellingCourses);

    return res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
