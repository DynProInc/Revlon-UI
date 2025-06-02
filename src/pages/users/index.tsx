import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  LinearProgress,
  useTheme,
  alpha,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  SupervisorAccount as AdminIcon,
  Security as SecurityIcon,
  FormatListBulleted as ListIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { mockUsers } from '@/mock-data/users';
import { useAuth, UserRole } from '@/context/AuthContext';
import { useNotification, NotificationType } from '@/context/NotificationContext';
import { v4 as uuidv4 } from 'uuid';

// Enhanced User type with additional fields
interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  department?: string;
}

// Generate extended mock users from the basic mock users
const generateExtendedUsers = (): ExtendedUser[] => {
  return mockUsers.map(user => ({
    ...user,
    status: 'active',
    lastLogin: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
    department: ['Data Management', 'IT', 'Product', 'Quality Assurance'][Math.floor(Math.random() * 4)]
  }));
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  
  // Dialog states
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>(UserRole.VIEWER);
  const [formDepartment, setFormDepartment] = useState('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const theme = useTheme();
  const { user, hasPermission } = useAuth();
  const { addNotification } = useNotification();
  
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const extendedUsers = generateExtendedUsers();
      setUsers(extendedUsers);
      setFilteredUsers(extendedUsers);
      
      setIsLoading(false);
    };
    
    loadUsers();
  }, []);
  
  useEffect(() => {
    // Apply search filter
    if (users.length === 0) return;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        user => 
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          (user.department && user.department.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get role label and color
  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return { label: 'Admin', color: 'error' as const };
      case UserRole.DATA_STEWARD:
        return { label: 'Data Steward', color: 'primary' as const };
      case UserRole.DYNPRO_TEAM_MEMBER:
        return { label: 'Dynpro Team', color: 'warning' as const };
      case UserRole.VIEWER:
        return { label: 'Viewer', color: 'success' as const };
      default:
        return { label: role, color: 'default' as const };
    }
  };
  
  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Open add user dialog
  const handleAddUserClick = () => {
    // Reset form
    setFormName('');
    setFormEmail('');
    setFormRole(UserRole.VIEWER);
    setFormDepartment('');
    setFormErrors({});
    
    setAddUserDialogOpen(true);
  };
  
  // Open edit user dialog
  const handleEditUserClick = (user: ExtendedUser) => {
    setSelectedUser(user);
    
    // Populate form
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDepartment(user.department || '');
    setFormErrors({});
    
    setEditUserDialogOpen(true);
  };
  
  // Open delete user dialog
  const handleDeleteUserClick = (user: ExtendedUser) => {
    setSelectedUser(user);
    setDeleteUserDialogOpen(true);
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formName.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  // Handle add user submit
  const handleAddUserSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new user
    const newUser: ExtendedUser = {
      id: uuidv4(),
      name: formName,
      email: formEmail,
      role: formRole,
      avatar: `https://i.pravatar.cc/150?u=${formEmail}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      department: formDepartment || undefined
    };
    
    // Add to users list
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Show notification
    addNotification({
      type: NotificationType.SUCCESS,
      title: 'User Added',
      message: `User "${formName}" has been added successfully.`
    });
    
    setIsSubmitting(false);
    setAddUserDialogOpen(false);
  };
  
  // Handle edit user submit
  const handleEditUserSubmit = async () => {
    if (!validateForm() || !selectedUser) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update user
    const updatedUser: ExtendedUser = {
      ...selectedUser,
      name: formName,
      email: formEmail,
      role: formRole,
      department: formDepartment || undefined
    };
    
    // Update users list
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id ? updatedUser : user
    );
    setUsers(updatedUsers);
    
    // Show notification
    addNotification({
      type: NotificationType.SUCCESS,
      title: 'User Updated',
      message: `User "${formName}" has been updated successfully.`
    });
    
    setIsSubmitting(false);
    setEditUserDialogOpen(false);
  };
  
  // Handle delete user submit
  const handleDeleteUserSubmit = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Remove from users list
    const updatedUsers = users.filter(user => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    
    // Show notification
    addNotification({
      type: NotificationType.SUCCESS,
      title: 'User Deleted',
      message: `User "${selectedUser.name}" has been deleted successfully.`
    });
    
    setIsSubmitting(false);
    setDeleteUserDialogOpen(false);
  };
  
  // Check if current user can edit/delete a user
  const canModifyUser = (targetUser: ExtendedUser): boolean => {
    if (!user) return false;
    
    // Admins can modify anyone except themselves
    if (user.role === UserRole.ADMIN) {
      return user.id !== targetUser.id;
    }
    
    return false;
  };
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        User Management
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search users by name, email, role, or department..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddUserClick}
                disabled={!hasPermission(UserRole.ADMIN)}
              >
                Add User
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            <LinearProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={user.avatar} 
                            alt={user.name}
                            sx={{ width: 32, height: 32, mr: 1 }}
                          />
                          <Typography variant="body2">{user.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={roleInfo.label}
                          color={roleInfo.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          color={user.status === 'active' ? 'success' : 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : '-'}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit User">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleEditUserClick(user)}
                              disabled={!canModifyUser(user)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteUserClick(user)}
                              disabled={!canModifyUser(user)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Add User Dialog */}
      <Dialog
        open={addUserDialogOpen}
        onClose={() => !isSubmitting && setAddUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  label="Role"
                  disabled={isSubmitting}
                >
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                  <MenuItem value={UserRole.DATA_STEWARD}>Data Steward</MenuItem>
                  <MenuItem value={UserRole.DYNPRO_TEAM_MEMBER}>Dynpro Team Member</MenuItem>
                  <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setAddUserDialogOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddUserSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isSubmitting ? 'Adding...' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog
        open={editUserDialogOpen}
        onClose={() => !isSubmitting && setEditUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="edit-role-label">Role</InputLabel>
                <Select
                  labelId="edit-role-label"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  label="Role"
                  disabled={isSubmitting}
                >
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                  <MenuItem value={UserRole.DATA_STEWARD}>Data Steward</MenuItem>
                  <MenuItem value={UserRole.DYNPRO_TEAM_MEMBER}>Dynpro Team Member</MenuItem>
                  <MenuItem value={UserRole.VIEWER}>Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditUserDialogOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditUserSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog
        open={deleteUserDialogOpen}
        onClose={() => !isSubmitting && setDeleteUserDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user <strong>{selectedUser?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteUserDialogOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUserSubmit} 
            variant="contained" 
            color="error"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
