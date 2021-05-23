const { Router } = require('express');
const { hasPermission, hasRole, isAuthenticated } = require('../../../../middlewares/auth');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getContests);
router.get('/me', isAuthenticated, controller.getMyContests);
router.get('/applying', controller.getApplyingContests);
router.get('/:id', controller.getContest);
router.post('/:id/enroll', isAuthenticated, controller.enrollContest);
router.post('/:id/unenroll', isAuthenticated, controller.unenrollContest);
router.post('/', ...hasRole(), controller.createContest);
router.put('/:id', ...hasRole(), controller.updateContest);
router.delete('/:id', ...hasRole(), controller.removeContest);

module.exports = router;
