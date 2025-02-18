const express = require("express");
const app = express();
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ip restrictions
app.use((req, res, next) => {
  console.log("Incoming Request IP:", req.ip);

  const allowedIps = ['::1', '127.0.0.1'];  
  if (!allowedIps.includes(req.ip)) {
    return res.status(403).send('Forbidden');
  }
  next();
});

//Rate limitters
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);


// AES Encryption/Decryption Middleware
const ENCRYPTION_KEY =  '12345678901234567890123456789012';
const IV_LENGTH = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// //Middleware to decrypt request payloads
app.use((req, res, next) => {
  if (req.body.encryptedData) {
    try {
      req.body = JSON.parse(decrypt(req.body.encryptedData));
    } catch (error) {
      return res.status(400).json({ error: 'Invalid encrypted payload' });
    }
  }
  next();
});

// //Middleware to encrypt response payloads
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    originalJson.call(this, { encryptedData: encrypt(JSON.stringify(data)) });
  };
  next();
});


//DATABSE SYNC//
// const db = require("./app/models");
// const syncDatabase = async () => {
//   try {
//     // Normal Sync (Without Dropping Tables)
//     await db.sequelize.sync();
//     console.log("Database synced successfully.");
    
//     // Uncomment the below line **ONLY IF** you want to drop & recreate tables
//     // await db.sequelize.sync({ force: true });
//     // console.log("Database dropped & re-synced.");
//   } catch (error) {
//     console.error("Database sync failed:", error.message);
//   }
// };
// syncDatabase();

app.get("/health", (req, res) => {
  res.json({ message: "Active." });
});

require("./app/routes/user.routes")(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
