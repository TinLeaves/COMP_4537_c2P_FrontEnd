// Fetch admin data and user information
async function fetchAdminData() {
  const response = await fetch(
    "https://comp4537c2pfrontend-production.up.railway.app/getAllUsersStats",
    {
      method: "GET",
    }
  );
  if (response.status === 200) {
    const { userStats } = await response.json();
    console.log(userStats);

    const userTableBody = document
      .getElementById("userTable")
      .getElementsByTagName("tbody")[0];
    userStats.forEach((user) => {
      const row = userTableBody.insertRow();
      row.insertCell(0).textContent = user.user__email;
      row.insertCell(1).textContent = user.request_count;
      row.insertCell(2).textContent = user.token_count;
    });
  } else {
    window.location.href = "/login";
  }
}

function logout() {
  localStorage.removeItem("jwtToken");
  window.location.href = "/login";
}

document.addEventListener("DOMContentLoaded", function () {
  fetchAdminData();
});
