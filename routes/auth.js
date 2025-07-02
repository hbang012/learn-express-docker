// 항상 라우터 만들땐 express ,
// 라우터를 만드는거니 경로 작성이 아님

const express = require('express');
const router = express.Router();

// 사용자별 세션데이터를 생성해야하므로 원래는 post가
// 맞으나 지금은 프론트가 없고 브라우저 입력요청은 get 요청임
// 쓰든 안쓰든 req , res 넣어줌
router.get('/login', (req, res) => {
  // 프론트에서 넘어왔다 치는 사용자 데이타 (임의)
  const { username, password } = {
    username: 'adam',
    password: '1234',
  };

  // 실제로는 이부분에 sk쿼리가 넘어온다고 하는데
  // DB에서 사용자 정보확인

  // session 객체에 key 생성 유저 아이디, 이름 집어넣기
  // user 라는 key 생성 , 지금은 id:1이라 했지만 실제론 DB의 id값 넣기
  if (username === 'adam' && password === '1234') {
    req.session.user = { id: 1, name: '관리자' };
    res.send('로그인 성공! 세션이 설정되었습니다.');
  } else {
    // 401은 인증오류
    res
      .status(401)
      .send('로그인 실패! 아이디 또는 비밀번호가 올바르지 않습니다.');
  }
});

// 로그아웃
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    // app 에서 설정한 쿠키 이름, 쿠키삭제 기능
    res.clearCookie('session-cookie');
    res.send('로그아웃 완료! 세션이 삭제되었습니다.');
  });
});

module.exports = router;
