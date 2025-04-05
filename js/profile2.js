// js/profile.js
document.addEventListener('DOMContentLoaded', () => {
    // Admin Profile Display Elements
    const adminFirstNameText = document.getElementById('admin-first-name-text');
    const adminLastNameText = document.getElementById('admin-last-name-text');
    const adminEmailText = document.getElementById('admin-email-text');
    const adminAgeText = document.getElementById('admin-age-text');
    const adminLocationText = document.getElementById('admin-location-text');

    // Admin Profile Edit Input Elements
    const adminFirstNameInput = document.getElementById('admin-first-name');
    const adminLastNameInput = document.getElementById('admin-last-name');
    const adminAgeInput = document.getElementById('admin-age');
    const adminLocationInput = document.getElementById('admin-location');

    // Admin Action Buttons
    const editAdminProfileButton = document.getElementById('edit-admin-profile');
    const saveAdminProfileButton = document.getElementById('save-admin-profile');
    const changePasswordAdminButton = document.getElementById('change-password-admin');
    const logoutButton = document.getElementById('logout');

    // User Management Elements
    const showCreateUserFormButton = document.getElementById('show-create-user-form');
    const createUserForm = document.getElementById('create-user-form');
    const userListElement = document.getElementById('user-list');

    // Download Section
    const downloadListElement = document.getElementById('download-list');
    const remainingDownloadsElement = document.getElementById('remaining-downloads');

    // (Optional: add more references as needed based on your HTML)
});

    // Check if user is logged in
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
    
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
    
        if (!userData || userData.role !== 'admin') {
            window.location.href = 'profile.html';
            return;
        }
    
        try {
            await displayAdminProfile(user, userData);
            await displayDownloadHistory(user.uid);
            await displayRemainingDownloads(user.uid);
            await displayBookList();
            await fetchAndRenderUserList();
    
            setupCreateUserForm();
            setupPasswordChange();
            setupAdminProfileEditing();
            setupUserSearch();
    
        } catch (error) {
            console.error('Initialization error:', error);
        }
    });
    
    async function displayAdminProfile(user, data) {
        adminFirstNameText.textContent = data.firstName || 'N/A';
        adminLastNameText.textContent = data.lastName || 'N/A';
        adminEmailText.textContent = user.email || 'N/A';
        adminAgeText.textContent = data.age || 'N/A';
        adminLocationText.textContent = data.location || 'N/A';
    
        adminFirstNameInput.value = data.firstName || '';
        adminLastNameInput.value = data.lastName || '';
        adminAgeInput.value = data.age || '';
        adminLocationInput.value = data.location || '';
    }
    
    async function displayDownloadHistory(userId) {
        const snapshot = await db.collection('downloads').where('userId', '==', userId).get();
        downloadListElement.innerHTML = '';
        snapshot.forEach(doc => {
            const li = document.createElement('li');
            li.className = 'list-disc pl-5';
            li.textContent = doc.data().bookTitle;
            downloadListElement.appendChild(li);
        });
    }
    
    async function displayRemainingDownloads(userId) {
        const doc = await db.collection('users').doc(userId).get();
        remainingDownloadsElement.textContent = doc.exists ? doc.data().remainingDownloads || 'N/A' : 'N/A';
    }
    
    async function displayBookList() {
        const snapshot = await db.collection('books').get();
        bookListElement.innerHTML = '';
        snapshot.forEach(doc => {
            const li = document.createElement('li');
            li.className = 'list-disc pl-5';
            li.textContent = doc.data().title;
            bookListElement.appendChild(li);
        });
    }
    
    async function fetchAndRenderUserList(querySnapshot = null) {
        if (!querySnapshot) {
            querySnapshot = await db.collection('users').get();
        }
    
        userListElement.innerHTML = '';
        querySnapshot.forEach((doc, index) => {
            appendUserToTable(doc.data(), doc.id, index);
        });
    }
    
    function appendUserToTable(user, userId, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="py-2 px-4 border-b">${index + 1}</td>
            <td class="py-2 px-4 border-b">${user.firstName} ${user.lastName}</td>
            <td class="py-2 px-4 border-b">${user.email}</td>
            <td class="py-2 px-4 border-b">${user.age}</td>
            <td class="py-2 px-4 border-b">${user.location}</td>
            <td class="py-2 px-4 border-b">
                <button class="edit-user bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button class="view-user bg-blue-500 text-white px-2 py-1 rounded">View</button>
                <button class="delete-user bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                <button class="restrict-user bg-gray-500 text-white px-2 py-1 rounded">Restrict</button>
            </td>
        `;
        userListElement.appendChild(row);
    
        row.querySelector('.edit-user').addEventListener('click', () => showEditUserModal(user, userId));
        row.querySelector('.view-user').addEventListener('click', () => showViewUserModal(user));
        row.querySelector('.delete-user').addEventListener('click', () => deleteUser(userId, user.email));
        row.querySelector('.restrict-user').addEventListener('click', () => restrictUser(userId));
    }
    
    function setupCreateUserForm() {
        showCreateUserFormButton.addEventListener('click', () => {
            createUserForm.classList.toggle('hidden');
        });
    
        createUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('new-first-name').value;
            const lastName = document.getElementById('new-last-name').value;
            const email = document.getElementById('new-user-email').value;
            const password = document.getElementById('new-user-password').value;
            const age = document.getElementById('new-age').value;
            const location = document.getElementById('new-location').value;
    
            try {
                const { user } = await auth.createUserWithEmailAndPassword(email, password);
                await db.collection('users').doc(user.uid).set({
                    firstName, lastName, email, age, location, role: 'user'
                });
                alert('User created!');
                createUserForm.reset();
                createUserForm.classList.add('hidden');
                fetchAndRenderUserList();
            } catch (error) {
                console.error('Error creating user:', error);
                alert('Error creating user: ' + error.message);
            }
        });
    }
    
    function setupPasswordChange() {
        changePasswordAdminButton.addEventListener('click', async () => {
            const newPassword = prompt('Enter new password:');
            if (newPassword) {
                try {
                    await auth.currentUser.updatePassword(newPassword);
                    alert('Password updated!');
                } catch (error) {
                    console.error('Password update error:', error);
                    alert('Error: ' + error.message);
                }
            }
        });
    }
    
    function setupAdminProfileEditing() {
        editAdminProfileButton.addEventListener('click', () => toggleAdminEditMode(true));
    
        saveAdminProfileButton.addEventListener('click', async () => {
            const updates = {
                firstName: adminFirstNameInput.value,
                lastName: adminLastNameInput.value,
                age: adminAgeInput.value,
                location: adminLocationInput.value
            };
    
            try {
                await db.collection('users').doc(auth.currentUser.uid).update(updates);
                alert('Profile updated!');
                displayAdminProfile(auth.currentUser, updates);
                toggleAdminEditMode(false);
            } catch (error) {
                console.error('Profile update error:', error);
            }
        });
    }
    
    function toggleAdminEditMode(editMode) {
        [adminFirstNameText, adminLastNameText, adminAgeText, adminLocationText].forEach(el => el.classList.toggle('hidden', editMode));
        [adminFirstNameInput, adminLastNameInput, adminAgeInput, adminLocationInput].forEach(el => el.classList.toggle('hidden', !editMode));
        editAdminProfileButton.classList.toggle('hidden', editMode);
        saveAdminProfileButton.classList.toggle('hidden', !editMode);
    }
    
    function showEditUserModal(user, userId) {
        document.getElementById('edit-user-first-name').value = user.firstName || '';
        document.getElementById('edit-user-last-name').value = user.lastName || '';
        document.getElementById('edit-user-age').value = user.age || '';
        document.getElementById('edit-user-location').value = user.location || '';
        editUserModal.classList.remove('hidden');
    
        saveUserChangesButton.onclick = async () => {
            const updates = {
                firstName: document.getElementById('edit-user-first-name').value,
                lastName: document.getElementById('edit-user-last-name').value,
                age: document.getElementById('edit-user-age').value,
                location: document.getElementById('edit-user-location').value
            };
    
            try {
                await db.collection('users').doc(userId).update(updates);
                alert('User updated!');
                editUserModal.classList.add('hidden');
                fetchAndRenderUserList();
            } catch (error) {
                console.error('Error updating user:', error);
            }
        };
    }
    
    function showViewUserModal(user) {
        document.getElementById('view-user-full-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('view-user-email').textContent = user.email || 'N/A';
        document.getElementById('view-user-age').textContent = user.age || 'N/A';
        document.getElementById('view-user-location').textContent = user.location || 'N/A';
        viewUserModal.classList.remove('hidden');
    }
    
    async function deleteUser(userId, email) {
        if (confirm(`Delete user: ${email}?`)) {
            try {
                await db.collection('users').doc(userId).delete();
                alert('User deleted!');
                fetchAndRenderUserList();
            } catch (error) {
                console.error('Delete user error:', error);
            }
        }
    }
    
    async function restrictUser(userId) {
        if (confirm('Restrict this user from further access?')) {
            try {
                await db.collection('users').doc(userId).update({ restricted: true });
                alert('User restricted!');
            } catch (error) {
                console.error('Restrict user error:', error);
            }
        }
    }
    
    function setupUserSearch() {
        searchUserInput.addEventListener('input', async (e) => {
            const query = e.target.value.toLowerCase();
            const snapshot = await db.collection('users').get();
            const filtered = snapshot.docs.filter(doc => {
                const user = doc.data();
                return (
                    user.firstName.toLowerCase().includes(query) ||
                    user.lastName.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
                );
            });
            fetchAndRenderUserList({ forEach: (fn) => filtered.forEach((doc, i) => fn({ data: () => doc.data(), id: doc.id }, i)) });
        });
    }
    

// Cancel button: hides the create user form and resets it
document.getElementById('cancel-create-user').addEventListener('click', () => {
    const createUserForm = document.getElementById('create-user-form');
    createUserForm.reset();
    createUserForm.classList.add('hidden');
});

// View user details popup using Firestore
async function viewUserDetails(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            alert(`User Details:\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nAge: ${data.age}\nLocation: ${data.location}`);
        } else {
            alert('User not found.');
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Failed to fetch user details.');
    }
}

const createUserForm = document.getElementById('create-user-form');

// Cancel button: hides the create user form and resets it
document.getElementById('cancel-create-user').addEventListener('click', () => {
    createUserForm.reset();
    createUserForm.classList.add('hidden');
});

// Initialize the create user form for fresh entry
function initializeCreateUserForm() {
    document.getElementById('new-first-name').value = '';
    document.getElementById('new-last-name').value = '';
    document.getElementById('new-user-email').value = '';
    document.getElementById('new-user-password').value = '';
    document.getElementById('new-age').value = '';
    document.getElementById('new-location').value = '';
    createUserForm.classList.remove('hidden');
    createUserForm.onsubmit = createUser; // Hook the submit action
}

function createUser(e) {
    e.preventDefault();

    const firstName = document.getElementById('new-first-name').value.trim();
    const lastName = document.getElementById('new-last-name').value.trim();
    const email = document.getElementById('new-user-email').value.trim();
    const password = document.getElementById('new-user-password').value;
    const age = document.getElementById('new-age').value.trim();
    const location = document.getElementById('new-location').value.trim();

    if (!firstName || !lastName || !email || !password || !age || !location) {
        alert('Please fill in all fields.');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            const userId = userCredential.user.uid;

            await db.collection('users').doc(userId).set({
                firstName,
                lastName,
                email,
                age,
                location,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'user'
            });

            alert('User created successfully!');
            createUserForm.reset();
            createUserForm.classList.add('hidden');

            // Refresh user list if exists
            if (typeof fetchUserList === 'function') {
                userListElement.innerHTML = '';
                fetchUserList();
            }
        })
        .catch((error) => {
            console.error('Error creating user:', error.message);
            alert('Error creating user: ' + error.message);
        });
}

