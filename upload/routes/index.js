const { Router } = require('express');
const { isAuthenticated, authenticate } = require('../../shared/middlewares/auth');
const { createUpload, updateFiles } = require('../../shared/utils/file');
const controller = require('./controller');

const upload = createUpload();

const router = Router();

router.get('/:id/download', authenticate, controller.download);

router.post(
  '/',
  upload.single('upload'),
  controller.uploadMiddleware,
  controller.upload,
);

router.delete('/', isAuthenticated, controller.removeFileByUrl);
router.delete('/:id', isAuthenticated, controller.removeFileById);

module.exports = router;
