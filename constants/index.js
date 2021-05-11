const notOperatorRoles = [
  'staff',    // 교직원(충북대 소속만)
  'student',  // 학생(충북대 소속만)
  'member',   // 충북대 소속 외 회원
];

const roles = [
  'admin',
  'operator',
  ...notOperatorRoles,
];

const fileTypes = [];

exports.NOT_OPERATOR_ROLES = notOperatorRoles;
exports.ROLES = roles;
exports.FILE_TYPES = fileTypes;
