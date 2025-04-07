// profile.js - Complete Profile Management System
document.addEventListener('DOMContentLoaded', () => {
    console.log('Profile module initialized');

    // ======================
    // DOM Elements
    // ======================
    const elements = {
        // Profile Section
        profileSection: document.getElementById('section-profile'),
        profileDisplay: document.getElementById('profile-display'),
        profileEditForm: document.getElementById('edit-profile-form'),
        editProfileBtn: document.getElementById('edit-profile'),
        saveProfileBtn: document.getElementById('save-profile'),
        cancelEditBtn: document.getElementById('cancel-edit'),
        changePasswordBtn: document.getElementById('change-password'),

        // User Management (Admin)
        userManagementSection: document.getElementById('section-user-management'),
        userList: document.getElementById('user-list'),
        userSearch: document.getElementById('user-search'),
        addUserModal: document.getElementById('add-user-modal'),
        addUserForm: document.getElementById('add-user-form'),
        openAddUserModalBtn: document.getElementById('open-add-user-modal'),
        closeAddUserModalBtn: document.getElementById('close-add-user-modal'),

        // Activity Section
        activitySection: document.getElementById('section-activity'),
        activityList: document.getElementById('activity-list'),
        filterEmail: document.getElementById('filter-email'),
        filterDate: document.getElementById('filter-date')
    };

    // Current User Data
    let currentUser = null;
    let isAdmin = false;

    // ======================
    // Firebase Initialization (using your existing auth/db)
    // ======================
    const { auth, db } = window; // Reuse your existing instances

    // ======================
    // Core Functions
    // ======================

    /**
     * Load and display user profile data
     * @param {string} uid - User ID
     */
    async function loadProfile(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Update profile display
                document.getElementById('profile-name').textContent = `${userData.firstName} ${userData.lastName}`;
                document.getElementById('profile-email').textContent = userData.email;
                document.getElementById('profile-age').textContent = userData.age || 'Not set';
                document.getElementById('profile-location').textContent = userData.location || 'Not set';
                document.getElementById('profile-join-date').textContent = 
                    userData.joinDate?.toDate().toLocaleDateString() || 'Unknown';
                document.getElementById('profile-status').textContent = 
                    userData.role === 'admin' ? 'Admin' : 'User';

                // Pre-fill edit form
                if (elements.profileEditForm) {
                    elements.profileEditForm.querySelector('[name="firstName"]').value = userData.firstName;
                    elements.profileEditForm.querySelector('[name="lastName"]').value = userData.lastName;
                    elements.profileEditForm.querySelector('[name="age"]').value = userData.age || '';
                    elements.profileEditForm.querySelector('[name="location"]').value = userData.location || '';
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
        }
    }

    /**
     * Update user profile in Firestore
     * @param {string} uid - User ID
     */
    async function updateProfile(uid) {
        try {
            const formData = {
                firstName: elements.profileEditForm.querySelector('[name="firstName"]').value,
                lastName: elements.profileEditForm.querySelector('[name="lastName"]').value,
                age: parseInt(elements.profileEditForm.querySelector('[name="age"]').value),
                location: elements.profileEditForm.querySelector('[name="location"]').value
            };

            await db.collection('users').doc(uid).update(formData);
            await loadProfile(uid); // Refresh profile data
            toggleProfileEdit(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert('Error updating profile');
        }
    }

    /**
     * Toggle profile edit mode
     * @param {boolean} isEditing - Whether to show edit form
     */
    function toggleProfileEdit(isEditing) {
        if (elements.profileDisplay) elements.profileDisplay.classList.toggle('hidden', isEditing);
        if (elements.profileEditForm) elements.profileEditForm.classList.toggle('hidden', !isEditing);
        if (elements.editProfileBtn) elements.editProfileBtn.classList.toggle('hidden', isEditing);
    }

    /**
     * Load all users for admin management
     */
    async function loadAllUsers() {
        try {
            const querySnapshot = await db.collection('users').get();
            if (elements.userList) {
                elements.userList.innerHTML = '';
                
                querySnapshot.forEach(doc => {
                    const user = doc.data();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="py-2 px-4 border-b">${user.firstName} ${user.lastName}</td>
                        <td class="py-2 px-4 border-b">${user.email}</td>
                        <td class="py-2 px-4 border-b">${user.age || '-'}</td>
                        <td class="py-2 px-4 border-b">${user.location || '-'}</td>
                        <td class="py-2 px-4 border-b">${user.role || 'user'}</td>
                        <td class="py-2 px-4 border-b">
                            <button class="reset-pw bg-blue-500 text-white px-2 py-1 rounded" 
                                    data-email="${user.email}">Reset PW</button>
                            <button class="delete-user bg-red-500 text-white px-2 py-1 rounded ml-2" 
                                    data-id="${doc.id}">Delete</button>
                        </td>
                    `;
                    if (elements.userList) elements.userList.appendChild(row);
                });

                // Add event listeners to new buttons
                document.querySelectorAll('.reset-pw').forEach(btn => {
                    btn.addEventListener('click', (e) => resetPassword(e.target.dataset.email));
                });
                
                document.querySelectorAll('.delete-user').forEach(btn => {
                    btn.addEventListener('click', (e) => deleteUserAccount(e.target.dataset.id));
                });
            }
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }

    /**
     * Add new user (admin only)
     */
    async function addNewUser(userData) {
        try {
            // Create auth user
            const { user } = await auth.createUserWithEmailAndPassword(
                userData.email, 
                userData.password
            );
            
            // Add to Firestore
            await db.collection('users').doc(user.uid).set({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                age: parseInt(userData.age),
                location: userData.location,
                role: userData.role || 'user',
                joinDate: new Date()
            });
            
            return true;
        } catch (error) {
            console.error("Error adding user:", error);
            return false;
        }
    }

    /**
     * Delete user account (admin only)
     * @param {string} userId - User ID to delete
     */
    async function deleteUserAccount(userId) {
        if (confirm('Are you sure you want to permanently delete this user?')) {
            try {
                // Delete from Firestore
                await db.collection('users').doc(userId).delete();
                
                // Delete from Auth (admin must be recently signed in)
                const userToDelete = await auth.getUser(userId);
                await auth.deleteUser(userToDelete.uid);
                
                await loadAllUsers(); // Refresh list
                alert('User deleted successfully');
            } catch (error) {
                console.error("Error deleting user:", error);
                alert('Error deleting user');
            }
        }
    }

    /**
     * Reset user password (admin only)
     * @param {string} email - User email
     */
    async function resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            alert(`Password reset email sent to ${email}`);
        } catch (error) {
            console.error("Error sending reset email:", error);
            alert('Error sending password reset');
        }
    }

    /**
     * Load activity logs for current user
     * @param {string} uid - User ID
     */
    async function loadActivityLogs(uid) {
        try {
            const querySnapshot = await db.collection('activity_logs')
                .where('userId', '==', uid)
                .get();
                
            if (elements.activityList) {
                elements.activityList.innerHTML = '';
                
                querySnapshot.forEach(doc => {
                    const log = doc.data();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="py-2 px-4 border-b">${log.bookTitle}</td>
                        <td class="py-2 px-4 border-b">${log.action}</td>
                        <td class="py-2 px-4 border-b">${log.timestamp?.toDate().toLocaleString() || 'Unknown'}</td>
                    `;
                    elements.activityList.appendChild(row);
                });
            }
        } catch (error) {
            console.error("Error loading activity logs:", error);
        }
    }

    // ======================
    // Event Listeners
    // ======================

    // Profile Edit
    if (elements.editProfileBtn) {
        elements.editProfileBtn.addEventListener('click', () => toggleProfileEdit(true));
    }

    if (elements.cancelEditBtn) {
        elements.cancelEditBtn.addEventListener('click', () => toggleProfileEdit(false));
    }

    if (elements.profileEditForm) {
        elements.profileEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (currentUser) await updateProfile(currentUser.uid);
        });
    }

    // Change Password
    if (elements.changePasswordBtn) {
        elements.changePasswordBtn.addEventListener('click', () => {
            const email = currentUser?.email;
            if (email) {
                auth.sendPasswordResetEmail(email)
                    .then(() => alert('Password reset email sent!'))
                    .catch(error => console.error("Error sending reset email:", error));
            }
        });
    }

    // User Management (Admin)
    if (elements.openAddUserModalBtn) {
        elements.openAddUserModalBtn.addEventListener('click', () => {
            if (elements.addUserModal) elements.addUserModal.classList.remove('hidden');
        });
    }

    if (elements.closeAddUserModalBtn) {
        elements.closeAddUserModalBtn.addEventListener('click', () => {
            if (elements.addUserModal) elements.addUserModal.classList.add('hidden');
        });
    }

    if (elements.addUserForm) {
        elements.addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(elements.addUserForm);
            const userData = Object.fromEntries(formData.entries());
            
            if (await addNewUser(userData)) {
                elements.addUserForm.reset();
                if (elements.addUserModal) elements.addUserModal.classList.add('hidden');
                await loadAllUsers();
            }
        });
    }

    // Activity Logs Filter
    if (elements.filterEmail) {
        elements.filterEmail.addEventListener('input', () => {
            // Implement filter logic as needed
        });
    }

    // ======================
    // Auth State Observer
    // ======================
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            // Load profile data
            await loadProfile(user.uid);
            
            // Check admin status
            const userDoc = await db.collection('users').doc(user.uid).get();
            isAdmin = userDoc.exists && userDoc.data().role === 'admin';
            
            // Load appropriate sections
            if (isAdmin) {
                if (elements.userManagementSection) elements.userManagementSection.classList.remove('hidden');
                await loadAllUsers();
            }
            
            // Load activity logs
            if (elements.activitySection) elements.activitySection.classList.remove('hidden');
            await loadActivityLogs(user.uid);
        }
    });
});