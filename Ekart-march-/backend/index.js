const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const nodemailer = require("nodemailer");
const { connection } = require("./connect.js");
const bcrypt = require("bcryptjs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const session = require("express-session");
const { checkUserToken } = require("./middleware/authentication.js");
// importing routes

const dotenv = require("dotenv");
// const fileUpload = require('express-fileupload')

dotenv.config();


app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});


app.use(
  session({
    secret: "your-secret-key", // Change this to a strong, secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production if using HTTPS
  })
);


app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const handleDatabaseError = (err, res, message) => {
  console.error(message, err);
  return res.status(500).json({ error: "Internal Server Error" });
};




//SIGNUP

app.post("/signup", async (req, res) => {
  const { username, email, mobile, password } = req.body;

  try {
    // Check if the email already exists in the database
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(
      checkEmailQuery,
      [email],
      async (emailErr, emailResults) => {
        if (emailErr) {
          console.error("Error checking email:", emailErr);
          return res
            .status(500)
            .json({ success: false, message: "Error checking email" });
        }

        if (emailResults.length > 0) {
          // If email already exists, return an error message
          return res
            .status(400)
            .json({ success: false, message: "Email already exists" });
        }

        // Check if the mobile number already exists in the database
        const checkMobileQuery = "SELECT * FROM users WHERE mobile = ?";
        connection.query(
          checkMobileQuery,
          [mobile],
          async (mobileErr, mobileResults) => {
            if (mobileErr) {
              console.error("Error checking mobile:", mobileErr);
              return res
                .status(500)
                .json({ success: false, message: "Error checking mobile" });
            }

            if (mobileResults.length > 0) {
              // If mobile number already exists, return an error message
              return res
                .status(400)
                .json({
                  success: false,
                  message: "Mobile number already exists",
                });
            }

            // Check if the password or mobile number format is incorrect
            const isValidMobile = /^\d{10}$/.test(mobile); // Validate 10 digits for mobile number
            if (!isValidMobile) {
              return res
                .status(400)
                .json({
                  success: false,
                  message: "Mobile number should be 10 digits only",
                });
            }

            // Hash the password before saving it
            const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

            // Insert the hashed password into the database
            const INSERT_USER_QUERY =
              "INSERT INTO users (username, email, mobile, password) VALUES (?, ?, ?, ?)";
            connection.query(
              INSERT_USER_QUERY,
              [username, email, mobile, hashedPassword],
              (err, userResults) => {
                if (err) {
                  console.error("Error creating user:", err);
                  return res
                    .status(500)
                    .json({ success: false, message: "Error creating user" });
                }

                // Sending welcome email
                const transporter = nodemailer.createTransport({
                  service: "gmail",
                  auth: {
                    user: "realmdefend@gmail.com", // Replace with your email address
                    pass: "hzictfxkvagjvodi", // Replace with your email password or app-specific password
                  },
                });

                const mailOptions = {
                  from: "realmdefend@gmail.com",
                  to: email,
                  subject: "Welcome to our platform!",
                  text: `Dear ${username},\nThank you for signing up! Welcome to our platform.`,
                };

                transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    console.error("Error sending email:", error);
                    // Handle error (e.g., inform the user about email sending failure)
                  } else {
                    console.log("Email sent:", info.response);
                    // Email sent successfully (you can add any additional logic here)
                  }
                });

                res
                  .status(200)
                  .json({
                    success: true,
                    message: "User created successfully",
                  });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    res
      .status(500)
      .json({ success: false, message: "Error during signup process" });
  }
});


app.post("/signin", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const FIND_USER_QUERY =
      "SELECT * FROM users WHERE email = ? OR mobile = ?";

    connection.query(
      FIND_USER_QUERY,
      [identifier, identifier], // Check both email and mobile
      async (err, results) => {
        if (err) {
          console.error("Error finding user:", err);
          return res
            .status(500)
            .json({ success: false, message: "Error finding user" });
        }

        if (results.length > 0) {
          const user = results[0];

          const isPasswordValid = await bcrypt.compare(
            password,
            user.password
          );

          if (isPasswordValid) {
            // Continue with the sign-in process
            const timestamp = Date.now();
            const token = jwt.sign(
              { id: user.id, timestamp },
              process.env.JWT_SECRET || "secretkey"
            );
            res.cookie("accessToken", token, {
              httpOnly: true,
            });
            const { password, ...others } = user;

            return res.status(200).json(others);
          } else {
            return res
              .status(401)
              .json({ success: false, message: "Invalid credentials" });
          }
        } else {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }
      }
    );
  } catch (error) {
    console.error("Error during signin:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error during signin" });
  }
});

// .....................................

// forgotpassword

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "realmdefend@gmail.com", // Replace with your email address
    pass: "hzictfxkvagjvodi", // Replace with your email password or app-specific password
  },
});

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit OTP
};

// Temporary storage for email during password reset
let emailForPasswordReset = "";

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();

    // Store the email temporarily for password reset
    emailForPasswordReset = email;

    // Check if the email exists in the users table
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    connection.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        console.error("Error checking email:", err);
        return res.status(500).json({ message: "Error checking email" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Email not found. Please sign up." });
      }

      // Create the otp_storage table if it doesn't exist
      const createOTPTableQuery = `
        CREATE TABLE IF NOT EXISTS otp_storage (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp VARCHAR(10) NOT NULL
        )
      `;
      connection.query(createOTPTableQuery, (tableErr, tableResult) => {
        if (tableErr) {
          console.error("Error creating otp_storage table:", tableErr);
          return res
            .status(500)
            .json({ message: "Error creating otp_storage table" });
        }

        // Insert the email and OTP into the otp_storage table
        const insertOTPQuery =
          "INSERT INTO otp_storage (email, otp) VALUES (?, ?)";
        connection.query(
          insertOTPQuery,
          [email, otp],
          (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Error inserting OTP:", insertErr);
              return res.status(500).json({ message: "Error inserting OTP" });
            }

            // Send email with OTP
            const mailOptions = {
              from: "realmdefend@gmail.com",
              to: email,
              subject: "Password Reset OTP",
              text: `Your OTP for password reset is: ${otp}`,
            };

            transporter.sendMail(mailOptions, (error) => {
              if (error) {
                console.error("Error sending email:", error);
                return res
                  .status(500)
                  .json({ message: "Failed to send OTP. Please try again." });
              } else {
                console.log("Email sent");
                return res
                  .status(200)
                  .json({ message: "OTP sent successfully." });
              }
            });
          }
        );
      });
    });
  } catch (error) {
    console.error("Error in send-otp endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/verify-otp", async (req, res) => {
  try {
    const { otp } = req.body;

    // Retrieve the stored OTP for the provided email from the otp_storage table
    const getStoredOTPQuery = "SELECT * FROM otp_storage WHERE email = ?";

    // Use Promise to handle the database query
    const results = await new Promise((resolve, reject) => {
      connection.query(
        getStoredOTPQuery,
        [emailForPasswordReset],
        (err, results) => {
          if (err) {
            console.error("Error retrieving stored OTP:", err);
            reject(err); // Reject the Promise with the error
          } else {
            resolve(results); // Resolve the Promise with the query results
          }
        }
      );
    });

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "OTP not found. Please try again." });
    }

    const storedOTP = results[0].otp;

    if (otp !== storedOTP) {
      return res
        .status(401)
        .json({ message: "Incorrect OTP. Please try again." });
    }

    // OTP matches, proceed with the password reset logic or other actions
    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error in verify-otp endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Check if emailForPasswordReset contains a stored email for password reset
    if (!emailForPasswordReset) {
      console.error("No email found for password reset");
      return res
        .status(400)
        .json({ message: "Email not provided for password reset." });
    }

    // Hash the new password before updating in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Using bcrypt for hashing

    // Proceed to update the hashed password in the users table for the stored email
    const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
    connection.query(
      updatePasswordQuery,
      [hashedPassword, emailForPasswordReset],
      (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating password:", updateErr);
          return res
            .status(500)
            .json({ message: "Failed to update password. Please try again." });
        }

        if (updateResult.affectedRows === 0) {
          console.error("Password update unsuccessful - Email not found");
          return res
            .status(404)
            .json({ message: "Email not found. Please sign up." });
        }

        console.log("Password updated successfully");

        // Clear the stored email after successful password update

        // Delete the stored OTP record after successful password update
        const deleteOTPQuery = "DELETE FROM otp_storage WHERE email = ?";

        connection.query(
          deleteOTPQuery,
          [emailForPasswordReset],
          (deleteErr, deleteResult) => {
            if (deleteErr) {
              console.error("Error deleting OTP record:", deleteErr);
              return res
                .status(500)
                .json({ message: "Error deleting OTP record" });
            }
            console.log("OTP record deleted");
            emailForPasswordReset = "";
            return res
              .status(200)
              .json({ message: "Password updated successfully" });
          }
        );
      }
    );
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post('/upload', upload.single('image'), (req, res) => {
  try {
    // Extract form data from the request body
    const { title, brandName, productCost, description, category, quantity } = req.body;

    // Get the uploaded image file path
    const imagePath = req.file.path;

    // If 'rating' is not present in the form data, set it to null
    const rating = req.body.rating || null;

    // Save data to MySQL database
    connection.query(
      'INSERT INTO Allproducts (title,Brand, product_cost, description, category, image_path, rating, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, brandName, productCost, description, category, imagePath, rating, quantity],
      (err, results) => {
        if (err) {
          console.error('Error saving data to MySQL:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send a success response
        res.json({ success: true });
      }
    );
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/adminproducts', (req, res) => {
  // Query the database to retrieve product name and quantity
  connection.query('SELECT title, quantity FROM Allproducts', (err, results) => {
    if (err) {
      console.error('Error retrieving product data from MySQL:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Send the product data as JSON response
    res.json(results);
  });
});


app.get('/allproducts', (req, res) => {
  const query = 'SELECT * FROM allproducts';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});



app.get('/product/:id', (req, res) => {
  const productId = req.params.id;

  const query = 'SELECT * FROM allproducts WHERE id = ?';

  connection.query(query, [productId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const productDetails = results[0];
    res.json(productDetails);
  });
});








app.post("/logout", (req, res) => {
  const cookiesToClear = ["accessToken", "userRole"]; // Add all your cookie names here

  cookiesToClear.forEach((cookieName) => {
    res.clearCookie(cookieName, {
      secure: true,
      sameSite: "none",
    });
  });

  res.status(200).json({ message: "User has been logged out." });
});

















const PORT = process.env.PORT || 8800;


app.listen(PORT,'0.0.0.0', () => {
  console.log(`server running on ${PORT}`);
});



