const { Router } = require('express');
const { authenticate, hasPermission } = require('../../../../shared/middlewares/auth');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getProblems);
router.get('/:id', authenticate, controller.getProblem);
router.post('/', ...hasPermission('problem'), controller.createProblem);
router.put('/:id', ...hasPermission('problem'), controller.updateProblem);
router.delete('/:id', ...hasPermission('problem'), controller.removeProblem);

module.exports = router;
