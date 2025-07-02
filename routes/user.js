const express = require('express');
const router = express.Router();
// mysql 정보 가져오기
const connection = require('../config/mysql');

// POST /user - 사용자 생성 요청
// get요청이 아님
// 엔드 포인트는 /user
router.post('/user', (req, res) => {
  // 프론트에서 요청시 body에 전달해주는데
  // 그 객체가 req.에 넘어오고 구조분해로 사용
  const { name, age, comment } = req.body;

  // 필수값 체크 : name, age는 DB에서 not null 이므로 필수
  // 이름이 없거나 나이가 없으면 -> 이건 에러다 라는 조건문
  // 프론트 요청 잘못된 것 (md문서 상태코드 참조)
  if (!name || !age) {
    return res.status(400).send('필수 필드 없음: name, age');
  }

  // 보통은 길기 때문에 변수에 넣어서 작성
  // 변수가 들어갈땐 자리 표시자라는 ? 로 자리 만들어야함
  const query = 'INSERT INTO user (name, age, comment) VALUES (?, ?, ?)';
  // 무조건 1개더라도 객체로 작성
  // comment는 undefind 일 수 있으며 DB 에 저장불가하므로
  // 없을시(undefind) 일시 null로 처리, undefind 못넣음
  const values = [name, age, comment || null];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('유저 생성 에러:', err.message);
      return res.status(500).send('Database error');
    }
    res.json(result);
  });
});

router.get('/user', (req, res) => {
  // 위에서 커넥션 객체를 받았음
  // 쿼리를 날릴 수 있는 query 메서드
  // mysql 문법처럼 작성
  connection.query('SELECT * FROM user', (err, result) => {
    if (err) {
      console.error('사용자 가져오기 에러: ', err.message);
      return res.status(500).send('데이터베이스 에러');
    }
    // 에러가 아닌경우 result 받아주기
    res.json(result);
  });
});

// // GET /user/:id보다 위에 있어야함
router.get('/user/search', (req, res) => {
  // 쿼리파라메터를받는데, 여러개 들어올 수
  // 있으므로 객체 구조분해로 받는다
  const { search } = req.query;

  // 쿼리는 처음부터는 없을 수 있음
  // 클릭해서 들어오는 것이기때문
  if (!search) {
    return res.status(400).send('검색어를 입력하세요');
  }

  // LIKE = 문자열 검색 연산자
  // `%${search}%` 가 들어감
  const query = 'SELECT * FROM user WHERE name LIKE ?';
  // 형식문자열
  const searchValue = `%${search}%`;

  // 커넥션 쿼리로 날려주고/알려주고
  connection.query(query, [searchValue], (err, result) => {
    // 여기서 나는 에러는 쿼리 DB에러
    if (err) {
      console.error('사용자 검색 에러:', err.message);
      return res.status(500).send('Database error');
    }

    // 찾는 사람이 없을 수 있음
    // result는 무조건 배열로 넘겨줌
    if (result.length === 0) {
      return res.status(404).send('검색된 사용자 없음');
    }

    res.json(result);
  });
});

// PASS 파라메터 API
// :id 에서 알아서 정해도 됨
router.get('/user/:id', (req, res) => {
  // 받아주기
  const { id } = req.params;
  console.log(id);
  const query = 'SELECT * FROM user WHERE user_id = ?';

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('사용자 가져오기 에러:', err.message);

      return res.status(500).send('Database error');
    }

    if (result.length === 0) {
      return res.status(404).send('사용자 없음');
    }

    res.json(result[0]);
  });
});

// 특정 ID에 대한 유저 정보 수정
// 유저의 id에 대한 유저 정보를 수정
router.patch('/user/:id', (req, res) => {
  const { id } = req.params;
  const { name, age, comment } = req.body;

  // 수정할 내용이 모두 없으면 잘못된 요청
  // name, age, comment 모두 없으면 문제 : 고칠게없음
  if (!name && !age && !comment) {
    return res.status(400).send('수정할 내용 없음');
  }

  // 수정할 내용이 정해져있지 않아 배열로 처리
  // 쿼리 문자가 들어갈 업데이트 배열
  // 값이 들어갈 values 배열
  const updates = [];
  const values = [];

  // ?에 values 배열이 들어감
  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (age) {
    updates.push('age = ?');
    values.push(age);
  }
  if (comment) {
    updates.push('comment = ?');
    values.push(comment);
  }
  values.push(id);

  // 쿼리 만들기                       한칸 띄워야 오류안남
  const query = `UPDATE user SET ${updates.join(', ')} WHERE user_id = ?`;

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error('사용자 수정 에러:', err.message);
      return res.status(500).send('Database error');
    }
    res.json(result);
  });
});

// user id에 대한 특정 id 삭제
router.delete('/user/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM user WHERE user_id = ?';

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('사용자 삭제 에러:', err.message);
      return res.status(500).send('Database error');
    }

    // results.affectedRows는 삭제된 행의 개수를 나타냄(mysql에서 보내줌)
    //  Rows는 줄, affected는 적용된 이란 느낌의 뜻
    //  0인 경우는 삭제 될게 없다 , 못찾았단 뜻

    if (result.affectedRows === 0) {
      return res.status(404).send('사용자가 없습니다');
    }

    res.json(result);
  });
});

module.exports = router;
