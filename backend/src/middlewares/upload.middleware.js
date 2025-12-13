import multer from 'multer';

// Store file in memory (Buffer) instead of disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

export const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Limit: 2MB
});