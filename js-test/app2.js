// // 다른 파일에 있는 정보를 가져오는 방법

// // utils.js 파일 안에 있는, name 값을 사용하려고 한다.
const utils = require('./utils.js')
// // 보통 가져오기만 할 때는 require('./utils.js').name으로 적지 않는다.
// // 처음 가져올 때는 통째로 가져와서 쓴다.

console.log(utils.name)
// name을 지정하지 않고 실행하면 name is not defined 에러가 뜬다.
// utils.js 에서 module.exports = name 을 지정하고 돌아와서 여기서 호출할 수 있음.

// utils.js의 함수 add() 불러오기
let sum = utils.add(4, -2)
console.log(sum)

// // 실습 문제1
// // 새로운 파일 note.js 만들어서 그 안에 getNotes라는 함수를 만든다
// // 이 함수는 "Hello ~"를 리턴한다.
// // app2.js에서 이 함수를 불러와서 콘솔에 로그를 찍어라.
// const getNotes = require('./notes.js')
// console.log(getNotes())

console.log(utils.minus(1, 10))