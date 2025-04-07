console.log("📄 profile.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    console.log("🔌 Firebase initialized?", typeof firebase !== "undefined");

    // Initialize admin profile data
    auth.onAuthStateChanged(user => {
        if (user) {
            loadAdminProfile(user.uid);
            checkAdminStatus(user.uid).then(isAdmin => {
                if (isAdmin) {
                    loadUserManagementData();
                    setupCreateUserForm();
                }
            });
        }
    });

    // Add this function to your profile.js
    function showChangePasswordModal() {
      document.getElementById('change-password-modal').classList.remove('hidden');
    }

    // Also add the close handler if not already present
    document.getElementById('cancel-password-change')?.addEventListener('click', () => {
      document.getElementById('change-password-modal').classList.add('hidden');
    });

    // ✅ Enhanced Create User Form Handler

    function setupCreateUserForm() {
      const createUserForm = document.getElementById('create-user-form');
      const firstNameInput = document.getElementById('new-first-name');
      const lastNameInput = document.getElementById('new-last-name');
      const emailInput = document.getElementById('new-user-email');
      const passwordInput = document.getElementById('new-user-password');
      const ageInput = document.getElementById('new-age');
      const locationInput = document.getElementById('new-location');
  
      // → Removed roleSelect check
      if (!createUserForm || !firstNameInput || !lastNameInput || !emailInput || !passwordInput || !ageInput || !locationInput) {
          console.warn("Required form elements missing");
          return;
      }
  
      createUserForm.addEventListener('submit', async (e) => {
          e.preventDefault();
  
          const firstName = firstNameInput.value;
          const lastName = lastNameInput.value;
          const email = emailInput.value;
          const password = passwordInput.value;
          const age = ageInput.value;
          const location = locationInput.value;
  
          try {
              // → Updated admin check (now checks for role === "admin")
              const currentUser = auth.currentUser;
              const currentUserDoc = await db.collection('users').doc(currentUser.uid).get();
              if (!currentUserDoc.exists || currentUserDoc.data().role !== "admin") {
                  throw new Error('Only admins can create users');
              }
  
              // Create the new user
              const userCredential = await auth.createUserWithEmailAndPassword(email, password);
              const newUser = userCredential.user;
  
              // → Hardcoded role: "user"
              await db.collection('users').doc(newUser.uid).set({
                  firstName,
                  lastName,
                  email,
                  age,
                  location,
                  role: "user",  // → Default role
                  createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
  
              alert('User created successfully');
              createUserForm.reset();
              document.getElementById('create-user-modal').classList.add('hidden');
              loadUserManagementData();
          } catch (error) {
              console.error('Full error:', error);  // → Better logging
              alert(`Error: ${error.message || 'See console for details'}`);
          }
      });
  }

    // Load Admin Profile Data
    async function loadAdminProfile(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Display user data
                document.getElementById('admin-first-name-text').textContent = userData.firstName || 'Not set';
                document.getElementById('admin-first-name').value = userData.firstName || '';
                
                document.getElementById('admin-last-name-text').textContent = userData.lastName || 'Not set';
                document.getElementById('admin-last-name').value = userData.lastName || '';
                
                document.getElementById('admin-email-text').textContent = auth.currentUser.email;
                
                document.getElementById('admin-age-text').textContent = userData.age || 'Not set';
                document.getElementById('admin-age').value = userData.age || '';
                
                document.getElementById('admin-location-text').textContent = userData.location || 'Not set';
                document.getElementById('admin-location').value = userData.location || '';
            }
        } catch (error) {
            console.error("Error loading admin profile:", error);
            alert("Error loading profile data");
        }
    }

    // Toggle Edit Mode
    function toggleEditMode() {
        document.querySelectorAll('[id$="-text"]').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('[id$="-name"], [id$="-age"], [id$="-location"]').forEach(el => {
            el.classList.remove('hidden');
        });
        document.getElementById('edit-admin-profile').classList.add('hidden');
        document.getElementById('save-admin-profile').classList.remove('hidden');
    }

    // Save Admin Profile
    async function saveAdminProfile(e) {
        e.preventDefault();
        
        const userId = auth.currentUser.uid;
        const updates = {
            firstName: document.getElementById('admin-first-name').value,
            lastName: document.getElementById('admin-last-name').value,
            age: document.getElementById('admin-age').value,
            location: document.getElementById('admin-location').value,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            await db.collection('users').doc(userId).set(updates, { merge: true });
            
            // Update displayed values
            document.getElementById('admin-first-name-text').textContent = updates.firstName;
            document.getElementById('admin-last-name-text').textContent = updates.lastName;
            document.getElementById('admin-age-text').textContent = updates.age;
            document.getElementById('admin-location-text').textContent = updates.location;
            
            // Switch back to view mode
            document.querySelectorAll('[id$="-text"]').forEach(el => el.classList.remove('hidden'));
            document.querySelectorAll('[id$="-name"], [id$="-age"], [id$="-location"]').forEach(el => {
                el.classList.add('hidden');
            });
            document.getElementById('edit-admin-profile').classList.remove('hidden');
            document.getElementById('save-admin-profile').classList.add('hidden');
            
            alert('Profile updated successfully!');
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile");
        }
    }

    // Check Admin Status
    async function checkAdminStatus(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            return userDoc.exists && userDoc.data().isAdmin === true;
        } catch (error) {
            console.error("Error checking admin status:", error);
            return false;
        }
    }
    
    // Add this near your other event listeners
    document.getElementById('show-create-user-modal')?.addEventListener('click', () => {
      document.getElementById('create-user-modal').classList.remove('hidden');
    });

    document.getElementById('cancel-create-user')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('create-user-modal').classList.add('hidden');
    });

    // Load User Management Data
    async function loadUserManagementData() {
        console.log("🚀 Running loadUserManagementData...");
        try {
          const usersSnapshot = await db.collection('users').get();
          const userList = document.getElementById('user-list');
            
            if (!userList) {
                console.warn("User list table not found");
                return;
            }
            
            userList.innerHTML = '';
            
            let counter = 1;
            usersSnapshot.forEach(doc => {
                const user = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${counter++}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.firstName || ''} ${user.lastName || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.email || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.isAdmin ? 'Admin' : 'User'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.age || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.location || ''}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button data-user-id="${doc.id}" class="view-user-btn text-blue-600 hover:text-blue-900 mr-2">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button data-user-id="${doc.id}" class="edit-user-btn text-green-600 hover:text-green-900 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button data-user-id="${doc.id}" class="delete-user-btn text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                userList.appendChild(row);
            });

            // Add event listeners to buttons
            document.querySelectorAll('.view-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => viewUser(e.target.closest('button').getAttribute('data-user-id')));
            });
            
            document.querySelectorAll('.edit-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => editUser(e.target.closest('button').getAttribute('data-user-id')));
            });
            
            document.querySelectorAll('.delete-user-btn').forEach(btn => {
                btn.addEventListener('click', (e) => deleteUser(e.target.closest('button').getAttribute('data-user-id')));
            });
        } catch (error) {
            console.error("Error loading user data:", error);
            alert("Error loading user list");
        }
    }

    // View User Details
    async function viewUser(userId) {
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const user = userDoc.data();
                
                document.getElementById('view-full-name').textContent = `${user.firstName || ''} ${user.lastName || ''}`;
                document.getElementById('view-email').textContent = user.email || '';
                document.getElementById('view-age').textContent = user.age || '';
                document.getElementById('view-location').textContent = user.location || '';
                
                document.getElementById('view-user-modal').classList.remove('hidden');
            }
        } catch (error) {
            console.error("Error viewing user:", error);
            alert("Error loading user details");
        }
    }

    // Edit User (placeholder - implement as needed)
    async function editUser(userId) {
        alert("Edit user functionality would go here for user: " + userId);
    }

    // Delete User
    async function deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        
        try {
            await db.collection('users').doc(userId).delete();
            alert("User deleted successfully");
            loadUserManagementData();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Error deleting user");
        }
    }

    // Initialize all modal handlers
    function setupAllHandlers() {
      // Create user modal
      document.getElementById('show-create-user-modal')?.addEventListener('click', () => {
          document.getElementById('create-user-modal').classList.remove('hidden');
      });

      document.getElementById('cancel-create-user')?.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('create-user-modal').classList.add('hidden');
      });

      // Change password modal
      document.getElementById('change-password-admin')?.addEventListener('click', () => {
          document.getElementById('change-password-modal').classList.remove('hidden');
      });

      document.getElementById('cancel-password-change')?.addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('change-password-modal').classList.add('hidden');
      });
    }

    // Initialize UI event listeners
    document.getElementById('edit-admin-profile')?.addEventListener('click', toggleEditMode);
    document.getElementById('save-admin-profile')?.addEventListener('click', saveAdminProfile);
    document.getElementById('change-password-admin')?.addEventListener('click', showChangePasswordModal);
    document.getElementById('close-view-user')?.addEventListener('click', () => {
        document.getElementById('view-user-modal').classList.add('hidden');
    });
    document.getElementById('cancel-password-change')?.addEventListener('click', () => {
        document.getElementById('change-password-modal').classList.add('hidden');
    });

    // Change Password Handler
    document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            alert("New passwords don't match!");
            return;
        }
        
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email, 
            currentPassword
        );
        
        try {
            await user.reauthenticateWithCredential(credential);
            await user.updatePassword(newPassword);
            
            alert("Password changed successfully!");
            document.getElementById('change-password-modal').classList.add('hidden');
            e.target.reset();
        } catch (error) {
            console.error("Error changing password:", error);
            alert("Error changing password: " + error.message);
        }
    });
});