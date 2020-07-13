// // 파일 만들기 과정

// // 1) node.js에서 fs 모듈(라이브러리)를 불러와 상수로 저장한다.
// // const는 상수 선언시 사용. 옛날 문법(오리지날, 전통적 문법) = 자바의 import와 같음.
// const fs = require('fs') // 이 라이브러리를 상수 fs에 저장하라. 지금 지정한 라이브러리를 변경하지 못하게 해야하므로 상수(const)로 저장한다.

// // // 2) fs.writeFileSync()로 실제 파일을 만들 수 있다.
// // fs.writeFileSync('note.txt', '안녕하세요')
// //     // 파라미터 설명 : 파일 이름 설정, 파일 내용 입력

// // 실습 문제 1
// // appendFileSync 라는 함수를 이용해서 note.txt파일에 새로운 내용을 추가하세요.
// // 실행해서 결과를 확인합니다.
// try {
//     fs.appendFileSync('note.txt', '\n내용추가', 'utf8')
//   } catch (err) {
//     /* Handle the error */
//   }

// validator 패키지 가져다 쓰기(선언)
const validator = require('validator')

// email, url 형식 체크하기(true or false로 리턴)
let ret = validator.isEmail('abc@naver.com')
ret = validator.isURL('http://naver.com')
console.log(ret)

// 실습문제 2
// chalk라는 패키지를 설치.
// app.js 파일에서 로딩.
// 문자열로 "Success!"라고 출력하되, 녹색(green)으로 출력.
const chalk = require('chalk')
console.log(chalk.green('Success!'))
// 위에서 찍은 문자열을 bold체로 출력해보자.
console.log(chalk.green.bgGray.underline.bold('Success!'))