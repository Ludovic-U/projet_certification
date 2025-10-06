const { body, validationResult } = require("express-validator");

const createQuestionValidators = [
  body("label")
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("category")
    .notEmpty()
    .withMessage("category is required")
    .bail()
    .isString(),
  body("numberOfSelectionableOpt").optional().isInt({ min: 1 }),
  body("isRelevant").optional().isBoolean(),
  body("hasMultipleOpenResponse").optional().isBoolean(),
  body("shouldMultiply").optional().isBoolean(),
  body("questionIdParent").optional().isInt(),
  body("types").optional().isArray(),
  body("projects").optional().isArray(),
  body("options").optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const updateQuestionValidators = [
  body("label")
    .optional()
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("category")
    .optional()
    .notEmpty()
    .withMessage("category is required")
    .bail()
    .isString(),
  body("numberOfSelectionableOpt").optional().isInt({ min: 1 }),
  body("isRelevant").optional().isBoolean(),
  body("hasMultipleOpenResponse").optional().isBoolean(),
  body("shouldMultiply").optional().isBoolean(),
  body("questionIdParent").optional().isInt(),
  body("types").optional().isArray(),
  body("projects").optional().isArray(),
  body("options").optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const createResponseValidators = [
  body("label")
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("projectId").isInt(),
  body("questionId").isInt(),
  body("optionId").optional().isInt(),
  body("responseIdParent").optional().isInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const updateResponseValidators = [
  body("label")
    .optional()
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("projectId").optional().isInt(),
  body("questionId").optional().isInt(),
  body("optionId").optional().isInt(),
  body("responseIdParent").optional().isInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const createTypeValidators = [
  body("label")
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("projects").optional().isArray(),
  body("questions").optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const updateTypeValidators = [
  body("label")
    .optional()
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("projects").optional().isArray(),
  body("questions").optional().isArray(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const createOptionValidators = [
  body("label")
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("questionId").isInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const updateOptionValidators = [
  body("label")
    .optional()
    .notEmpty()
    .withMessage("label is required")
    .bail()
    .isString()
    .trim()
    .isLength({ min: 3, max: 255 }),
  body("questionId").isInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// If Suggestion added
// const createSuggestionValidators = [];
// const updateSuggestionValidators = [];

module.exports = {
  createQuestionValidators,
  updateQuestionValidators,
  createResponseValidators,
  updateResponseValidators,
  createTypeValidators,
  updateTypeValidators,
  createOptionValidators,
  updateOptionValidators,
};
