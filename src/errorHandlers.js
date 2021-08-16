export const notFoundErrorHandler = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ success: false, message: err.message });
  } else {
    next(err);
  }
}; // 404

export const badRequestErrorHandler = (err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send(err.errorsList);
  } else {
    next(err);
  }
}; // 400

export const forbiddenErrorHandler = (err, req, res, next) => {
  if (err.status === 403) {
    res.status(403).send({ success: false, message: err.message });
  } else {
    next(err);
  }
}; // 403

export const genericServerErrorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ success: false, message: "Generic Server Error" });
}; // 500
