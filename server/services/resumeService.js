const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const Student = require('../models/Student');
const { parseResume } = require('./resumeParserService');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadResume = async (userId, file) => {
  if (!file) {
    const error = new Error("No file uploaded");
    error.status = 400;
    throw error;
  }

  const student = await Student.findOne({ user: userId });
  if (!student) {
    const error = new Error("Student profile required");
    error.status = 404;
    throw error;
  }

  // Intentionally NOT deleting the old resume from Cloudinary.
  // This preserves the link for past applications that hold a reference to it.

  // Upload new resume to Cloudinary
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "intelligent-campus/resumes",
        resource_type: "raw" 
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });

  student.resume = {
    url: result.secure_url,
    public_id: result.public_id
  };

  await student.save();

  // Parse the resume PDF to extract profile data
  let parsedData = null;
  try {
    parsedData = await parseResume(file.buffer);
  } catch (err) {
    console.error("Resume parsing failed (non-fatal):", err.message);
  }

  return {
    message: "Resume uploaded successfully",
    resume: student.resume,
    parsedData
  };
};

