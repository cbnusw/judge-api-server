const { Router } = require('express');
const { authenticate, hasPermission } = require('../../../../middlewares/auth');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getProblems);
router.get('/:id', authenticate, controller.getProblem);
router.post('/', ...hasPermission('judge'), controller.createProblem);
router.put('/:id', ...hasPermission('judge'), controller.updateProblem);
router.delete('/:id', ...hasPermission('judge'), controller.removeProblem);

module.exports = router;