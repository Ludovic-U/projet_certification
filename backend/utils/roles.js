module.exports.isAdmin = (user) => {
  if (user && user.roles.includes('admin')) {
    return true; // User is admin
  }
  return false; // User is not admin
}
module.exports.isManager = (user) => {
  if (user && user.roles.includes('manager')) {
    return true; // User is manager
  }
  return false; // User is not manager
}
module.exports.isProjectManager = (user) => {
  if (user && user.roles.includes('project_manager')){
    return true; // User is project manager
  }
  return false; // User is not project manager
}