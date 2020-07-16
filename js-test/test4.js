function findAndSaveUser(Users) {
  Users.findOne({})
    .then((user) => {
      user.name = "zero";
      return user.save();
    })
    .then((user) => {
      // 위에서 에러 없으면 여기로 옴
      return Users.findOne({ gender: "m" });
    })
    .catch((err) => {
      // 에러가 오면 여기서 잡는다
      console.log(err);
    });
  // 이렇게 코드를 짜는 방식을 프로미스라고 한다
}

// 위와 아래는 error 빼고는 같은 내용의 코드다.
async function findAndSaveUser(Users) {
  try {
    let user = await Users.findOne({});
    // await : 이거 다 실행하면 아래로 내려가라. 이거 다 될 때까지 기다려라. 성공해야 아래로 내려간다.
    user.name = "zero";
    user = await user.save();
    user = await Users.findOne({ gender: "m" });
  } catch (error) {
    console.error(error);
  }
}
