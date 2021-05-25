const { Router } = require('express');
const { authenticate, isAttended } = require('../../../../middlewares/auth');
const controller = require('./controller');
const {kafkaConsumer} = require('../../../../kafka/consumer')
const router = Router();
//문제 제출
//목록
//문제별 보기
//사용자별 보기
//router.get('/', authenticate, controller.getScores);
router.get('/', kafkaConsumer);
router.post('/', isAttended, controller.createScore);

module.exports = router;
