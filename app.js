// app은 미들웨어 실행용도로만

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

const indexRouter = require('./routes');
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');

//  dotenv 활성화
dotenv.config();

// 익스프레스 인스턴스 생성
const app = express();
// nextjs가 3000 이므로 포트 변경
app.set('port', process.env.PORT || 3001);

// 미들웨어설정
// 모든 출처에 대해 요청허용
app.use(cors());
app.use(morgan('dev'));

// public으로 정적 폴더를 정적 폴더로 지정
// 데이터이미지를 /public/images에 넣고 경로를 db에 저장하여 프론트로 보내줌
app.use('/', express.static(path.join(__dirname, 'public')));

// 프론트에서 넘어온 json을 req.body에 변환하여 담아줌
app.use(express.json());

// 쿼리파라미터 값으로 한글이 들어올 경우 인코딩해줌, extended: false면 querystring모듈 사용
app.use(express.urlencoded({ extended: false }));

// 서명된 쿠키를 파싱하여 req.signedCookies 객체에 담아줌
app.use(cookieParser(process.env.COOKIE_SECRET));

// 세션쿠키 설정
// - session이란게 보인다는건 사용자별 세션 정보를 쿠키에 저장
app.use(
  session({
    // 세션 데이터 수정사항 없을 경우 저장하지 않음
    resave: false,
    // 세션에 저장할 내용이 없을 경우 세션을 저장하지 않음
    saveUninitialized: false,
    // 세션쿠키의 비밀키
    secret: process.env.COOKIE_SECRET,
    cookie: {
      // 자바스크립트로 쿠키 접근 방지
      httpOnly: true,
      // https가 아닌 환경에서도 사용할 수 있도록
      secure: false,
    },
    name: 'session-cookie',
  })
);

// 라우터 설정 (불러오기)
app.use(indexRouter);
app.use(userRouter);
app.use(authRouter);
app.use(profileRouter);

// 에러처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

// 서버 실행
app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
