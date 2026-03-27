const Workspace = require('../models/Workspace');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  try {
    const { name, slug } = req.body;

    // Check if user already has a workspace
    const existingWorkspace = await Workspace.findOne({ owner: req.user._id });
    
    if (existingWorkspace) {
      return res.status(400).json({
        success: false,
        message: 'You already have a workspace. Upgrade to create multiple workspaces.'
      });
    }

    // Create workspace
    const workspace = new Workspace({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner',
        joinedAt: new Date()
      }]
    });

    await workspace.save();

    // Create free subscription
    const subscription = new Subscription({
      workspace: workspace._id,
      plan: 'free',
      status: 'active',
      pricing: {
        monthlyPrice: 0,
        yearlyPrice: 0,
        billingCycle: 'monthly'
      },
      features: {
        maxRestaurants: 1,
        maxOrders: 100,
        maxCouriers: 2,
        analyticsEnabled: false,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
        customDomain: false
      },
      trial: {
        isTrialing: false
      }
    });

    await subscription.save();

    // Link subscription to workspace
    workspace.subscription = subscription._id;
    await workspace.save();

    res.status(201).json({
      success: true,
      message: 'Workspace created successfully',
      workspace,
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating workspace',
      error: error.message
    });
  }
};

// @desc    Get user workspaces
// @route   GET /api/workspaces
// @access  Private
exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('subscription')
    .populate('owner', 'name email');

    res.json({
      success: true,
      count: workspaces.length,
      workspaces
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workspaces',
      error: error.message
    });
  }
};

// @desc    Get workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private
exports.getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('subscription')
      .populate('members.user', 'name email')
      .populate('owner', 'name email');

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user has access
    if (!workspace.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workspace'
      });
    }

    res.json({
      success: true,
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workspace',
      error: error.message
    });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
exports.updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner or admin
    if (workspace.owner.toString() !== req.user._id.toString() && 
        !workspace.hasRole(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workspace'
      });
    }

    const allowedUpdates = ['name', 'branding', 'contact', 'settings'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(workspace, updates);
    await workspace.save();

    res.json({
      success: true,
      message: 'Workspace updated successfully',
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating workspace',
      error: error.message
    });
  }
};

// @desc    Invite team member
// @route   POST /api/workspaces/:id/invite
// @access  Private
exports.inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner or admin
    if (workspace.owner.toString() !== req.user._id.toString() && 
        !workspace.hasRole(req.user._id, 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to invite members'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with that email'
      });
    }

    // Check if already a member
    if (workspace.isMember(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    // Add member
    workspace.members.push({
      user: user._id,
      role: role || 'member',
      joinedAt: new Date()
    });

    await workspace.save();

    res.json({
      success: true,
      message: 'Member invited successfully',
      workspace
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error inviting member',
      error: error.message
    });
  }
};

// @desc    Remove team member
// @route   DELETE /api/workspaces/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only workspace owner can remove members'
      });
    }

    await workspace.removeMember(req.params.userId);

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message
    });
  }
};

module.exports = exports;
