exports.calculateScore = (student, job) => {

  let score = 0;

  score += (student.cgpa / 10) * 50;

  const matchedSkills = student.skills.filter(skill =>
    job.requiredSkills?.includes(skill)
  );

  const skillScore =
    (matchedSkills.length / (job.requiredSkills?.length || 1)) * 30;

  score += skillScore;

  score += Math.min(student.experience * 5, 20);

  return Math.round(score);
};