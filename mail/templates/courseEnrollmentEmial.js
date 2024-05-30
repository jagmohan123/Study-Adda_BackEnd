exports.courseEnrollmentEmial = (courseName, name) => {
  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .cta {
                display: inline-block;
                padding: 10px 20px;
                background-color: #ffD60A;
                color: #000000;
                text-decoration: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                margin-top: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .highlight {
                font-weight: bold;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
        <a href="https://studynotion-edtech-project.vercel.app"><img class="logo" src="https://res.cloudinary.com/dhfomx8lk/image/upload/v1709388401/StudyAddaMaterial/wlvv2umy1zsakvbuk3e1.png"
		alt="StudyAdda Logo"></a>
            <div class="message">Course Registration Confirmation</div>
            <div class="body">
                <p>Dear ${name},</p>
                <p>
                    You have Successfully Registered for the Course
                    <span class="highlight">${courseName}</span>.We
                    are excited to have you as a participants!
                </p>
                <p>
                    Please log in to your learning dashboard to access the course
                    materials and start your learning.
                    <a href="https://studynotion-edtech-project.vercel.app/dashboard">Go to Dashboard</a>
                </p>
            </div>
            <div class="support">
                If you have any questions or need assistance, please feel free to reach
                out to <a href="mailto:info@studyadda.com">info@studyadda.com</a>
                we are here to help you
            </div>
        </div>
    </body>
    
    </html>`;
};
