console.log('util.js called')

// 특정 값 노출 : module.exports = 
// utils 파일이 특정 값을 외부로 노출시키겠다는 뜻이다. => 노출을 시켜줘야 다른 파일이 이 값을 받을 수 있게 된다.

// // 여러 값 노출시키는 방법 1 : array로 export
// name = 'mike'
// add = function(a, b) {
//         return a + b
//     }
// minus : (a, b) => {
//         return a - b
//     } 
// module.exports = {name, add, minus}

// 여러 값 노출시키는 방법 2 : json 객체를 export
module.exports = {

    name : 'mike', // 상수 지정

    add : function(a, b) {
        return a + b
    }, // 상수 함수 지정

    minus : (a, b) => {
        return a - b
    }
}
