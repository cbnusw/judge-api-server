const { Router } = require('express');
const { hasRole, isAuthenticated } = require('../../../../middlewares/auth');
const { handleAccessContestProblem } = require('./middlewares');
const controller = require('./controller');

const router = Router();

router.get('/', controller.getContests);
router.get('/me', isAuthenticated, controller.getMyContests);
router.get('/registered', isAuthenticated, controller.getRegisteredContests);
router.get('/applying', controller.getApplyingContests);
router.get('/:id', controller.getContest);
router.get(
  '/:id/problems',
  isAuthenticated,
  handleAccessContestProblem,
  controller.getContestProblems
);

router.post('/', ...hasRole(), controller.createContest);
router.post('/:id/problem', ...hasRole(), controller.createContestProblem);
router.post('/:id/enroll', isAuthenticated, controller.enrollContest);
router.post('/:id/unenroll', isAuthenticated, controller.unenrollContest);
router.put('/:id', ...hasRole(), controller.updateContest);
router.put('/:id/problem/:problemId', ...hasRole(), controller.updateContestProblem);
router.delete('/:id', ...hasRole(), controller.removeContest);

module.exports = router;
