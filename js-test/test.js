function first() {
  // 함수의 정의
  second();
  console.log("첫번째");
}
function second() {
  third();
  console.log("두번째");
}
function third() {
  console.log("세번째");
}
first(); // 함수의 호출
