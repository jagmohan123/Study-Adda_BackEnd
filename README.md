## StudyAdd Backend
Welcome to the StudyAdd Backend project! This project is built using ExpressJS ,Node.js, MongoDB, mongoose , and 
provides a robust backend for managing various functionalities related to an online EdTech platform.
Below you will find a detailed description of the features and capabilities of this project.

Features
# ADMIN -:
Admin has only one role only he/ she creates the category in the project.

Authentication and Authorization
# Two Category For Registration -:
1) Student -:
2) Instructor/ Teacher-:
# User Registration: 
New users can register with their,Name, role, email and password.
# User Login:
Registered users can log in to their accounts.
# Token-Based Authentication: 
Secure token-based authentication using JWT.
# Role-Based Access Control:
Different access levels for users, instructors, and  admins.
# Password Management
# Forgot Password:
Users can reset their password if they forget it.
# Password Reset: 
Securely reset password using email verification.

# Course Management
# Buy Course: Category Based

Only Those Users can purchase courses which is registered as a student role.
Student can select the category like programming, web devlopment and AI& ML which they wanna enroll.

# Sell Course: Category Based
Instructor Can create the course in selected specified categiry which is created by the admin.
Instructors can make the courses and sell their courses.
# Course Listings:
View all available courses with details like price, description, and instructor information.
# Email Notifications
# Email Sending:
Automated email notifications for user activities such as registration, password reset, and purchase confirmations.
# Mail Templates: 
Predefined email templates for various user interactions.
# Additional Functionalities:
# Student Profile Management:
1.Student can view and update their profile information.
2.My Coures : Users can view their course and completion of courese progress.
3.View Cart: User can add the courses in a cart which they are intrusted in fucture they can buy it.
# Instructor Profile Management:
1.Instructor can view and update their profile information.
2. Instructor can view Their created coures, along with status like course is published, or draft .
3. Instructor can view Their Total revenview along with the income no. of student enroll in each course , each course total earning. 


# Admin Dashboard:
Admins can manage Category section only.



# ENDPOINTES

# Auth Routes
POST /api/v1/auth/sendotp
POST /api/v1/auth/signup - Register a new user
POST /api/login - Log in a user
POST /api/v1/auth/login

# FOR CHANGING PASSWORD FROM THE LOGIN PAGE OR SIGNUP PAGE -:
STEP-1: POST /api/forgot-password - Request a password reset
STEP2:  POST /api/v1/profile/resetPassword-token- Reset the token 
STEP3:  POST /api/forgot-password (http://localhost:3000/update-password/${token}`) - Request a password reset With new Password and confirm password options.

# FOR CHANGING PASSWORD FROM THE PROFILE, You are already login  so you can change by your profile
POST /api/v1/auth/changePassword-> By Their profile student and instructor can change their password directly.

# FOR STUDENT -:
VIEW PROFILE: GET  /api/v1/profile/getUserDetails
VIEW MY COURSES :GET /api/v1/auth/getEnrolledCourses- watch and eroll courses 
MY CART-> add courses in cart  POST dashboard/cart/api/v1/auth/
VIEW SETTINGS AND EDIT PROFILE :PUT /api/v1/profile/updateProfile
Profile image-: PUT /api/v1/profile/updateProfileImage
Create Rating-: /api/v1/course/createRating- Give rating and review comment to the video.
FOR SHOWING REVIEWS ON WEBSITE->GET /api/v1/course/getReviews
SHOW AVERAGE RATING ON THE WEBSITE -: GET /api/v1/course/getReviews
Course Progress: GET /api/v1/course/getReviews/updateCourseProgress
Delete Account: DELETE   /api/v1/profile/deleteProfile







# FOR INSTRUCTOR-: 

# Course Routes

# FOR SECTION
CREATE -:POST  /api/v1/course/addSection - Create Section of the course.
UPDATE -:POST /api/v1/course/updateSection
DELETE -POST /api/v1/course/deleteSection

# FOR SUBSECTION 
POST api/v1/course/addSubSection - Create a Subsection inside section.
POST  /api/v1/course/deleteSubSection -Delete Subsection.
POST /api/v1/course/updateSubSection - Update Subsection.
User Routes
 
# FOR COURSE 
POST-: /api/v1/course/createCourse->CREATE THE COURSE 
GET- : api/v1/course/getAllCourse-> GET ALL COURSE 
GET: api/v1/course/getCourseDetails-> GET SINGLE COURSE
POST: /api/v1/course/editCourse-> EDIT COURSE DETAILS.
GET : /api/v1/course/getInstructorCourses->GET ALL THE INSTRUCTOR COURSES .
POST : /api/v1/course/deleteCourse-> DELETE THE COURSEs
GET /api/profile - Get user profile information
PUT /api/profile - Update user profile information
Instructor Dashboard -: GET /api/v1/profile/instructorDashboard


# Admin Routes
POST: /api/v1/course/createCategory-> CREATE CATEGORY.
GET: /api/v1/course/getCategoryPageDetails-> GET ALL CATEGORY AND THEIR COURSES.
GET: /api/v1/course/getCategoryPageDetails->showAllCategory which is created by the admin.

Contributing
We welcome contributions to improve this project. To contribute, follow these steps:




# Contact
POST : api/v1/user/contact-> For sending email for query 
For any questions or feedback, please reach out to us at info@studyadda.com.

Thank you for using StudyAdd! We hope this project meets your needs for building a comprehensive online EdTech platform backend.
