// 프로미스 실습(pdf 76페이지)
const condition = true; // 컨디션을 true로 해놨기 때문에 if()문에다가 쓰면 true쪽으로 감
const promise = new Promise((resolve, reject) => {
  if (condition) {
    resolve("성공"); // resolve() : then함수가 호출됨. "성공"이 then()으로 넘어감
  } else {
    reject("실패"); // reject() : catch함수가 호출됨. "실패"가 catch()으로 넘어감
  }
});

promise
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error(error);
  });
