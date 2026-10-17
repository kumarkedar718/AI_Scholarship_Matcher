const validateScholarshipInput = (data) => {
  const errors = {};
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Scholarship title is required';
  }
  if (!data.provider || data.provider.trim() === '') {
    errors.provider = 'Provider name is required';
  }
  if (!data.description || data.description.trim() === '') {
    errors.description = 'Description is required';
  }
  if (!data.amountText || data.amountText.trim() === '') {
    errors.amountText = 'Amount text is required';
  }
  if (!data.officialUrl || data.officialUrl.trim() === '') {
    errors.officialUrl = 'Official application URL is required';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = { validateScholarshipInput };
