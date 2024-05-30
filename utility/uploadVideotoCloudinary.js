const cloudinary = require("cloudinary").v2;
function uploadVideotoCloudinary (file, folder, height, quality) {
  const options = { folder };
  if (height) {
    options.height = height;
  }
  if (quality) {
    options.quality = quality;
  }

  //   automatically find the type of image
  options.resource_type = "auto";
  return cloudinary.uploader.upload(file.tempFilePath, options);
}
module.exports=uploadVideotoCloudinary;
