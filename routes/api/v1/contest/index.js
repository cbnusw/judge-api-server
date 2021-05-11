const { Router } = require('express');
const { authenticate, hasPermission } = require('../../../../middlewares/auth');
const controller = require('./controller');

const router = Router();

router.get('/', authenticate, controller.getContests);
router.post('/enroll', authenticate, controller.enrollContest);
router.post('/unenroll', authenticate, controller.unenrollContest);
router.get('/:id', authenticate, controller.getContest);
router.post('/', ...hasPermission('judge'), controller.createContest);
router.put('/:id', ...hasPermission('judge'), controller.updateContest);
router.delete('/:id', ...hasPermission('judge'), controller.removeContest);

module.exports = router;
