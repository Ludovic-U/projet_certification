/**
 * Middleware to check if user has super_admin role
 * This middleware should be used for admin-only routes
 * 
 * Usage: Add this middleware after authenticateUser for routes that should
 * only be accessible by super_admin
 */
module.exports.isSuperAdmin = (req, res, next) => {
  // Check if user exists (should be set by authenticateUser middleware)
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized - No user authenticated" });
  }

  // Check if user has super_admin role
  const roles = req.user.roles || [];
  if (!roles.includes("super_admin")) {
    return res.status(403).json({ 
      error: "Forbidden - Super Admin access required",
      requiredRole: "super_admin",
      currentRoles: roles
    });
  }

  next();
};

/**
 * Middleware to check if user has admin_client or super_admin role
 * This is for routes accessible by any admin level (super_admin or admin_client)
 */
module.exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized - No user authenticated" });
  }

  const roles = req.user.roles || [];
  const isAdminLevel = roles.includes("super_admin") || roles.includes("admin_client");
  
  if (!isAdminLevel) {
    return res.status(403).json({ 
      error: "Forbidden - Admin access required",
      requiredRoles: ["super_admin", "admin_client"],
      currentRoles: roles
    });
  }

  next();
};

/**
 * Middleware to check specific permission
 * @param {string|string[]} permission - Permission name(s) required
 */
module.exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized - No user authenticated" });
    }

    const permissions = req.user.permissions || [];
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    
    const hasPermission = requiredPermissions.some(p => permissions.includes(p));
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: "Forbidden - Insufficient permissions",
        requiredPermissions: requiredPermissions,
        currentPermissions: permissions
      });
    }

    next();
  };
};
