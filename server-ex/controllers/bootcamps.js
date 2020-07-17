// "행동"들을 이 파일에 저장해놓고 가져다 쓸 것임.
//      라우터의 "액션"들을 빼서 컨트롤러에 담아놓는다.
// 함수별로 하나씩 exports한다. (nodejs문법 : exports.함수이름 = 함수내용)

// @desc    모든 정보를 다 조회
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: "Show all bootcamps", middleware: req.hello });
};

// @desc    해당 아이디의 정보 조회
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Show bootcamp ${req.params.id}번`,
  });
};

// @desc    새로운 정보를 insert
// @route   POST /api/v1/bootcamps
// @access  Public
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: "Craate new bootcamp",
  });
};

// @desc    기존 정보를 update
// @route   PUT /api/v1/bootcamps/:id
// @access  Public
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Update bootcamp ${req.params.id}`,
  });
};

// @desc    해당 경로를 delete
// @route   DELETE /api/v1/bootcamps/:id
// @access  Public
exports.deleteBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: `Delete bootcamp ${req.params.id}`,
  });
};
