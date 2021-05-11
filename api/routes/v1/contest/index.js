const { Router } = require('express');
const { authenticate, hasPermission } = require('../../../../shared/middlewares/auth');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getContests);
router.post('/enroll',  controller.enrollContest);
router.post('/unenroll',  controller.unenrollContest);
router.get('/:id', authenticate, controller.getContest);
router.post('/', ...hasPermission('contest'), controller.createContest);
router.put('/:id', ...hasPermission('contest'), controller.updateContest);
router.delete('/:id', ...hasPermission('contest'), controller.removeContest);

module.exports = router;
