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

const permissions = [
  'judge',
  'qna',
];

const fileTypes = [
  'Contest',
  'Problem',
  'Submit'
];

const programmingLanguages = [
  'c',
  'c++',
  'java',
  'python2',
  'python3',
  'kotlin',
  'go',
  'node',
];

const centers = [
  '사업지원팀',
  'SW전공교육센터',
  'SW기초교육센터',
  'SW융합교육센터',
  'SW융합교육센터',
  'SW산학협력센터',
  '오픈소스SW센터'
];


exports.NOT_OPERATOR_ROLES = notOperatorRoles;
exports.ROLES = roles;
exports.PERMISSIONS = permissions;
exports.CENTERS = centers;
exports.FILE_TYPES = fileTypes;
exports.PROGRAMMING_LANGUAGES = programmingLanguages;
