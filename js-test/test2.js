// non-blocking I/O 의 예시
function run() {
  console.log("3초 후 실행");
}
console.log("시작");
setTimeout(run, 3000); // 3000밀리세컨 - 3초
console.log("끝");
