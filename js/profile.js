// profile.js
document.addEventListener("DOMContentLoaded", () => {
  const profileSection = document.getElementById("profile-section");
  const downloadsSection = document.getElementById("downloads-section");
  const userMgmtSection = document.getElementById("user-management-section");

  const navProfile = document.getElementById("nav-profile");
  const navDownloads = document.getElementById("nav-downloads");
  const navUsers = document.getElementById("nav-users");

  const userProfileForm = document.getElementById("user-profile-form");
  const passwordForm = document.getElementById("change-password-form");
  const userTableBody = document.getElementById("user-table-body");
  const createUserForm = document.getElementById("create-user-form");
  const downloadList = document.getElementById("download-list");
  const downloadCount = document.getElementById("download-count");

  function showSection(section) {
    profileSection.style.display = "none";
    downloadsSection.style.display = "none";
    userMgmtSection.style.display = "none";

    section.style.display = "block";
  }

  if (navProfile && navDownloads && navUsers) {
    navProfile.addEventListener("click", () => showSection(profileSection));
    navDownloads.addEventListener("click", () => showSection(downloadsSection));
    navUsers.addEventListener("click", () => showSection(userMgmtSection));
  } else {
    console.error("Navigation elements not found. Check your HTML IDs.");
  }

  // Show profile by default
  showSection(profileSection);

  // --- Auth Check ---
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      alert("You must be logged in to access this page.");
      window.location.href = "login.html";
      return;
    }

    const userId = user.uid;

    // --- Load Profile ---
    const userDoc = await db.collection("users").doc(userId).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    userProfileForm.elements["name"].value = userData.name || "Not Available";
    userProfileForm.elements["email"].value = user.email || "Not Available";
    userProfileForm.elements["phone"].value = userData.phone || "Not Available";

    // --- Update Profile ---
    userProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = userProfileForm.elements["name"].value;
      const phone = userProfileForm.elements["phone"].value;

      await db.collection("users").doc(userId).set({ name, phone }, { merge: true });
      alert("Profile updated.");
    });

    // --- Change Password ---
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = passwordForm.elements["new-password"].value;
      try {
        await user.updatePassword(newPassword);
        alert("Password changed successfully.");
      } catch (err) {
        alert("Error: " + err.message);
      }
    });

    // --- Load Downloads ---
    const downloadsSnap = await db.collection("downloads").where("userId", "==", userId).get();
    downloadCount.textContent = downloadsSnap.size;
    downloadList.innerHTML = "";

    downloadsSnap.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${data.bookTitle} - ${new Date(data.timestamp.toDate()).toLocaleString()}`;
      downloadList.appendChild(li);
    });

    // --- Admin User Management ---
    if (userData.role === "admin") {
      loadUsers();
      createUserForm.addEventListener("submit", createNewUser);
    }
  });

  // --- Load All Users (Admin) ---
  async function loadUsers() {
    const snapshot = await db.collection("users").get();
    userTableBody.innerHTML = "";

    snapshot.forEach(doc => {
      const user = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${user.name || "-"}</td>
        <td>${user.email || "-"}</td>
        <td>${user.role || "user"}</td>
        <td>
          <button onclick="viewUser('${doc.id}')">View</button>
          <button onclick="editUser('${doc.id}')">Edit</button>
          <button onclick="deleteUser('${doc.id}')">Delete</button>
        </td>
      `;

      userTableBody.appendChild(tr);
    });
  }

  // --- Create New User (Admin) ---
  async function createNewUser(e) {
    e.preventDefault();
    const name = createUserForm.elements["name"].value;
    const email = createUserForm.elements["email"].value;
    const phone = createUserForm.elements["phone"].value;
    const role = createUserForm.elements["role"].value;

    // Check for duplicate email
    const duplicateCheck = await db.collection("users").where("email", "==", email).get();
    if (!duplicateCheck.empty) {
      alert("Email already exists.");
      return;
    }

    const newDoc = await db.collection("users").add({
      name, email, phone, role
    });

    alert("New user created.");
    createUserForm.reset();
    loadUsers();
  }

  // --- View, Edit, Delete User (Admin) ---
  window.viewUser = async (id) => {
    const doc = await db.collection("users").doc(id).get();
    const data = doc.data();
    alert(`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nRole: ${data.role}`);
  };

  window.editUser = async (id) => {
    const newName = prompt("Enter new name:");
    const newPhone = prompt("Enter new phone:");

    if (newName && newPhone) {
      await db.collection("users").doc(id).update({
        name: newName,
        phone: newPhone
      });
      alert("User updated.");
      loadUsers();
    }
  };

  window.deleteUser = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await db.collection("users").doc(id).delete();
      alert("User deleted.");
      loadUsers();
    }
  };
});
