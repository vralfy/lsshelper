if (!document.lss_helper.helper) {
  document.lss_helper.helper = {};
}

document.lss_helper.helper.formatNumber = (arg) => {
  return arg.toString().padStart(2, '0');
}