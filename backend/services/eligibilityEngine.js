/**
 * Rule-Based Eligibility Evaluation Engine
 * Pure, deterministic evaluation of student profile against scholarship eligibility rules.
 */

const evaluateEligibility = (studentProfile, scholarshipCriteria) => {
  const result = {
    status: 'Eligible', // 'Eligible', 'Not Eligible', 'Needs Verification'
    score: 100,
    matchPercentage: 100,
    matchedCriteria: [],
    unmatchedCriteria: [],
    missingCriteria: [],
    explanation: ''
  };

  if (!studentProfile) {
    return {
      status: 'Needs Verification',
      score: 0,
      matchPercentage: 0,
      matchedCriteria: [],
      unmatchedCriteria: [],
      missingCriteria: [{ field: 'Profile', detail: 'Student profile details are missing' }],
      explanation: 'Student profile is missing or incomplete.'
    };
  }

  const crit = scholarshipCriteria || {};
  let totalRulesChecked = 0;
  let rulesPassed = 0;

  // 1. Education Level Check
  if (crit.allowedEducationLevels && crit.allowedEducationLevels.length > 0) {
    totalRulesChecked++;
    if (!studentProfile.educationLevel || studentProfile.educationLevel.trim() === '') {
      result.missingCriteria.push({ field: 'Education Level', detail: 'Education level not specified in student profile' });
    } else {
      const match = crit.allowedEducationLevels.some(l => l.toLowerCase() === studentProfile.educationLevel.trim().toLowerCase());
      if (match) {
        rulesPassed++;
        result.matchedCriteria.push({ field: 'Education Level', detail: `Level "${studentProfile.educationLevel}" matches requirement` });
      } else {
        result.unmatchedCriteria.push({
          field: 'Education Level',
          detail: `Requires ${crit.allowedEducationLevels.join(' or ')}, but student level is "${studentProfile.educationLevel}"`
        });
      }
    }
  }

  // 2. Course Check
  if (crit.allowedCourses && crit.allowedCourses.length > 0) {
    totalRulesChecked++;
    if (!studentProfile.course || studentProfile.course.trim() === '') {
      result.missingCriteria.push({ field: 'Course', detail: 'Course not specified in student profile' });
    } else {
      const match = crit.allowedCourses.some(c => c.toLowerCase() === studentProfile.course.trim().toLowerCase());
      if (match) {
        rulesPassed++;
        result.matchedCriteria.push({ field: 'Course', detail: `Course "${studentProfile.course}" matches criteria` });
      } else {
        result.unmatchedCriteria.push({
          field: 'Course',
          detail: `Requires ${crit.allowedCourses.join(' or ')}, but student course is "${studentProfile.course}"`
        });
      }
    }
  }

  // 3. Branch Check
  if (crit.allowedBranches && crit.allowedBranches.length > 0) {
    totalRulesChecked++;
    if (!studentProfile.branch || studentProfile.branch.trim() === '') {
      result.missingCriteria.push({ field: 'Branch', detail: 'Branch not specified in student profile' });
    } else {
      const match = crit.allowedBranches.some(b => b.toLowerCase() === studentProfile.branch.trim().toLowerCase());
      if (match) {
        rulesPassed++;
        result.matchedCriteria.push({ field: 'Branch', detail: `Branch "${studentProfile.branch}" matches criteria` });
      } else {
        result.unmatchedCriteria.push({
          field: 'Branch',
          detail: `Requires branch in [${crit.allowedBranches.join(', ')}], but student branch is "${studentProfile.branch}"`
        });
      }
    }
  }

  // 4. CGPA / Marks Check
  if (crit.minCgpa !== undefined && crit.minCgpa !== null && crit.minCgpa > 0) {
    totalRulesChecked++;
    const cgpa = studentProfile.cgpaOrPercentage;
    if (cgpa === undefined || cgpa === null || cgpa === 0) {
      result.missingCriteria.push({ field: 'Academic Score (CGPA / Marks)', detail: 'CGPA or Marks not specified in student profile' });
    } else if (Number(cgpa) >= crit.minCgpa) {
      rulesPassed++;
      result.matchedCriteria.push({ field: 'Academic Score', detail: `Student score (${cgpa}) meets minimum requirement (${crit.minCgpa})` });
    } else {
      result.unmatchedCriteria.push({
        field: 'Academic Score',
        detail: `Minimum required score is ${crit.minCgpa}, but student score is ${cgpa}`
      });
    }
  }

  // 5. Family Annual Income Limit Check
  if (crit.maxFamilyIncome !== null && crit.maxFamilyIncome !== undefined && crit.maxFamilyIncome > 0) {
    totalRulesChecked++;
    const income = studentProfile.familyIncomeAnnual;
    if (income === undefined || income === null || income === '') {
      result.missingCriteria.push({ field: 'Family Income', detail: 'Family annual income not specified in profile' });
    } else if (Number(income) <= crit.maxFamilyIncome) {
      rulesPassed++;
      result.matchedCriteria.push({ field: 'Family Income', detail: `Annual income ₹${Number(income).toLocaleString('en-IN')} is within ceiling limit ₹${crit.maxFamilyIncome.toLocaleString('en-IN')}` });
    } else {
      result.unmatchedCriteria.push({
        field: 'Family Income',
        detail: `Upper income limit is ₹${crit.maxFamilyIncome.toLocaleString('en-IN')}, but student family income is ₹${Number(income).toLocaleString('en-IN')}`
      });
    }
  }

  // 6. State of Domicile Check
  if (crit.allowedStates && crit.allowedStates.length > 0) {
    totalRulesChecked++;
    if (!studentProfile.stateOfDomicile || studentProfile.stateOfDomicile.trim() === '') {
      result.missingCriteria.push({ field: 'State Domicile', detail: 'State of domicile not specified in profile' });
    } else {
      const match = crit.allowedStates.some(s => s.toLowerCase() === studentProfile.stateOfDomicile.trim().toLowerCase());
      if (match) {
        rulesPassed++;
        result.matchedCriteria.push({ field: 'State Domicile', detail: `Domicile "${studentProfile.stateOfDomicile}" matches eligible states` });
      } else {
        result.unmatchedCriteria.push({
          field: 'State Domicile',
          detail: `Applicable to ${crit.allowedStates.join(', ')}, but student domicile is "${studentProfile.stateOfDomicile}"`
        });
      }
    }
  }

  // 7. Social Category Check
  if (crit.allowedCategories && crit.allowedCategories.length > 0) {
    totalRulesChecked++;
    if (!studentProfile.category || studentProfile.category.trim() === '') {
      result.missingCriteria.push({ field: 'Social Category', detail: 'Category not specified in profile' });
    } else {
      const match = crit.allowedCategories.some(cat => cat.toLowerCase() === studentProfile.category.trim().toLowerCase());
      if (match) {
        rulesPassed++;
        result.matchedCriteria.push({ field: 'Social Category', detail: `Category "${studentProfile.category}" matches criteria` });
      } else {
        result.unmatchedCriteria.push({
          field: 'Social Category',
          detail: `Eligible categories: ${crit.allowedCategories.join(', ')}, student category: "${studentProfile.category}"`
        });
      }
    }
  }

  // 8. Gender Check
  if (crit.allowedGenders && crit.allowedGenders.length > 0 && !crit.allowedGenders.includes('Any')) {
    totalRulesChecked++;
    if (!studentProfile.gender || studentProfile.gender.trim() === '') {
      result.missingCriteria.push({ field: 'Gender', detail: 'Gender not specified in profile' });
    } else {
      const match = crit.allowedGenders.some(g => g.toLowerCase() === studentProfile.gender.trim().toLowerCase());
      if (match) {
        rulesPassed++;
        result.matchedCriteria.push({ field: 'Gender', detail: `Gender "${studentProfile.gender}" matches criteria` });
      } else {
        result.unmatchedCriteria.push({
          field: 'Gender',
          detail: `Target gender: ${crit.allowedGenders.join(', ')}, student gender: "${studentProfile.gender}"`
        });
      }
    }
  }

  // 9. Disability Requirement Check
  if (crit.requiresDisability) {
    totalRulesChecked++;
    if (studentProfile.isDisability) {
      rulesPassed++;
      result.matchedCriteria.push({ field: 'PWD / Disability Status', detail: 'Person with Disability (PWD) criteria met' });
    } else {
      result.unmatchedCriteria.push({ field: 'PWD / Disability Status', detail: 'Scholarship requires Person with Disability (PWD) status' });
    }
  }

  // 10. Single Girl Child Requirement Check
  if (crit.requiresSingleGirlChild) {
    totalRulesChecked++;
    if (studentProfile.isSingleGirlChild) {
      rulesPassed++;
      result.matchedCriteria.push({ field: 'Single Girl Child', detail: 'Single Girl Child criteria met' });
    } else {
      result.unmatchedCriteria.push({ field: 'Single Girl Child', detail: 'Scholarship specifically reserved for Single Girl Child' });
    }
  }

  // Final Status Synthesis
  if (result.unmatchedCriteria.length > 0) {
    result.status = 'Not Eligible';
    result.explanation = `Ineligible due to ${result.unmatchedCriteria.length} unmatched constraint(s): ${result.unmatchedCriteria.map(u => u.detail).join('; ')}`;
  } else if (result.missingCriteria.length > 0) {
    result.status = 'Needs Verification';
    result.explanation = `Needs verification for ${result.missingCriteria.length} missing profile parameter(s): ${result.missingCriteria.map(m => m.detail).join('; ')}`;
  } else {
    result.status = 'Eligible';
    result.explanation = totalRulesChecked === 0
      ? 'Scholarship is open to all students.'
      : `Student meets all ${result.matchedCriteria.length} evaluated criteria.`;
  }

  // Calculate Match Score percentage
  if (totalRulesChecked === 0) {
    result.score = 100;
    result.matchPercentage = 100;
  } else {
    const matchedCount = result.matchedCriteria.length;
    const pct = Math.round((matchedCount / totalRulesChecked) * 100);
    result.score = pct;
    result.matchPercentage = pct;
  }

  return result;
};

module.exports = { evaluateEligibility };
