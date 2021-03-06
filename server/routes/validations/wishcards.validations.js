const { body, validationResult } = require('express-validator');
const { handleError } = require('../../helper/error');
const { log } = require('../../helper/logger');

const createWishcardValidationRules = () => {
  return [
    body('childBirthday').notEmpty().isString(),
    body('wishItemPrice').notEmpty().isString(),
    body('childFirstName').notEmpty().isString(),
    body('childLastName').notEmpty().isString(),
    body('childInterest').notEmpty().isString(),
    body('wishItemName').notEmpty().isString(),
    body('wishItemPrice').notEmpty().isString(),
    body('wishItemURL').notEmpty().isString(),
    body('childStory').notEmpty().isString(),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    log(res, errors);
    return handleError(res, 400, errors.array({ onlyFirstError: true })[0]);
  }
  next();
};

module.exports = {
  createWishcardValidationRules,
  validate,
};
