// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');

    // Get DOM elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section-content');
    const createUserModal = document.getElementById('create-user-modal');
    const showCreateUserModalButton = document.getElementById('show-create-user-modal');
    const cancelCreateUserButton = document.getElementById('cancel-create-user');
    const userListElement = document.getElementById('user-list');

    // Initialize navigation
    function initializeNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const targetSection = link.getAttribute('data-section');
                sections.forEach(section => {
                    if (section.id === targetSection) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });

        // Show the first section by default
        if (sections.length > 0) {
            sections[0].classList.remove('hidden');
        }
    }

    // User Management Functions
    function initializeUserManagement() {
        if (showCreateUserModalButton) {
            showCreateUserModalButton.addEventListener('click', () => {
                createUserModal.classList.remove('hidden');
            });
        }

        if (cancelCreateUserButton) {
            cancelCreateUserButton.addEventListener('click', () => {
                createUserModal.classList.add('hidden');
            });
        }
    }

    function fetchUserList() {
        if (!userListElement) return;

        function appendUserToTable(user, index) {
            const userRow = document.createElement('tr');
            userRow.innerHTML = `
                <td class="py-2 px-4 border-b">${index + 1}</td>
                <td class="py-2 px-4 border-b">${user.firstName} ${user.lastName}</td>
                <td class="py-2 px-4 border-b">${user.email}</td>
                <td class="py-2 px-4 border-b">${user.age}</td>
                <td class="py-2 px-4 border-b">${user.location}</td>
                <td class="py-2 px-4 border-b">
                    <button class="edit-user bg-yellow-500 text-white px-2 py-1 rounded mt-2">Edit</button>
                    <button class="view-user bg-blue-500 text-white px-2 py-1 rounded mt-2">View</button>
                    <button class="delete-user bg-red-500 text-white px-2 py-1 rounded mt-2">Delete</button>
                </td>
            `;
            userListElement.appendChild(userRow);

            // Add event listeners for the buttons
            userRow.querySelector('.edit-user').addEventListener('click', () => {
                showEditUserModal(user);
            });

            userRow.querySelector('.view-user').addEventListener('click', () => {
                showViewUserModal(user);
            });

            userRow.querySelector('.delete-user').addEventListener('click', () => {
                deleteUser(user.id);
            });
        }

        db.collection('users').get()
            .then((querySnapshot) => {
                userListElement.innerHTML = ''; // Clear existing list
                querySnapshot.forEach((doc, index) => {
                    const userData = doc.data();
                    appendUserToTable(userData, index);
                });
            })
            .catch((error) => {
                console.error('Error fetching user list:', error);
            });
    }

    function showEditUserModal(user) {
        const editUserModal = document.getElementById('edit-user-modal');
        document.getElementById('edit-first-name').value = user.firstName;
        document.getElementById('edit-last-name').value = user.lastName;
        document.getElementById('edit-user-email').value = user.email;
        document.getElementById('edit-age').value = user.age;
        document.getElementById('edit-location').value = user.location;
        editUserModal.classList.remove('hidden');

        document.getElementById('cancel-edit-user').addEventListener('click', () => {
            editUserModal.classList.add('hidden');
        });

        document.getElementById('edit-user-form').onsubmit = (e) => {
            e.preventDefault();
            // Update user logic here
            editUserModal.classList.add('hidden');
        };
    }

    function showViewUserModal(user) {
        const viewUserModal = document.getElementById('view-user-modal');
        const userDetails = `
            <strong>Full Name:</strong> ${user.firstName} ${user.lastName}<br>
            <strong>Email:</strong> ${user.email}<br>
            <strong>Age:</strong> ${user.age}<br>
            <strong>Location:</strong> ${user.location}
        `;
        document.getElementById('view-user-details').innerHTML = userDetails;
        viewUserModal.classList.remove('hidden');

        document.getElementById('close-view-user').addEventListener('click', () => {
            viewUserModal.classList.add('hidden');
        });
    }

    function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            db.collection('users').doc(userId).delete()
                .then(() => {
                    alert('User deleted successfully');
                    fetchUserList(); // Refresh the list
                })
                .catch((error) => {
                    console.error('Error deleting user:', error);
                    alert('Error deleting user');
                });
        }
    }

    // Auth state observer
    auth.onAuthStateChanged((user) => {
        if (user) {
            if (user.email === 'admin@example.com') { // Replace with actual admin email
                // Show admin dashboard
                document.querySelector('[data-section="admin-profile"]').classList.remove('hidden');
            } else {
                // Redirect non-admin users
                window.location.href = 'profile.html';
            }
        } else {
            window.location.href = 'index.html';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetSection = link.getAttribute('data-section');
            sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });

    // Show the first section by default
    if (sections.length > 0) {
        sections[0].classList.remove('hidden');
    }

    // Fetch and display user list
    fetchUserList();

    // Initialize navigation
    initializeNavigation();
});

// Initialize admin functionality
function initAdmin() {
    const auth = firebase.auth();
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Verify admin status
                const userDoc = await db.collection('users').doc(user.uid).get();
                
                if (!userDoc.exists || !userDoc.data().isAdmin) {
                    window.location.href = 'profile.html';
                    return;
                }
                
                // Load admin data
                loadUserList();
                loadAdminProfile(user.uid);
                
            } catch (error) {
                console.error("Admin init error:", error);
                alert("Error loading admin dashboard");
            }
        } else {
            window.location.href = 'index.html';
        }
    });
}

async function loadUserList() {
    try {
        const snapshot = await db.collection('users')
            .where('isAdmin', '==', false)
            .get();
            
        const userList = document.getElementById('user-list');
        if (userList) {
            userList.innerHTML = '';
            
            snapshot.forEach(doc => {
                const user = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${doc.id}</td>
                    <td>${user.firstName} ${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="view-btn" data-id="${doc.id}">View</button>
                    </td>
                `;
                userList.appendChild(row);
            });
        }
    } catch (error) {
        console.error("Error loading users:", error);
        alert("Error loading user list");
    }
}
