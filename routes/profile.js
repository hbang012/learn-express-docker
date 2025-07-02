const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  // 세션에 유저를 만들어놔서 유저면 유저, 아니면 로그인
  if (req.session.user) {
    res.send(`환영합니다, ${req.session.user.name}님!`);
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
});

module.exports = router;
