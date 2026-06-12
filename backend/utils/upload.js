// utils/upload.js
// Multer storage for profile pictures and group file sharing.
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function makeStorage(subfolder) {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      // random name + original extension (avoids collisions and weird chars)
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  });
}

const IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const FILE_TYPES = [...IMAGE_TYPES, '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.txt', '.zip'];

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const ok = IMAGE_TYPES.includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Profile picture must be an image.'), ok);
  },
});

const uploadGroupFile = multer({
  storage: makeStorage('groups'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ok = FILE_TYPES.includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('File type not allowed.'), ok);
  },
});

module.exports = { uploadAvatar, uploadGroupFile };
