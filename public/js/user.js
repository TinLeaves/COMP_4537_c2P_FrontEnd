// Fetch user data after login
async function fetchUserData() {
  const response = await fetch(
    "https://comp4537c2pfrontend-production.up.railway.app/getUserStats",
    {
      method: "GET",
    }
  );

  if (response.status === 200) {
    const data = await response.json();
    console.log(data);

    document.getElementById("userEmail").textContent = data.user__email;
    document.getElementById("apiCallsUsed").textContent = data.request_count;
    document.getElementById("apiCallsRemaining").textContent = data.token_count;

    if (data.token_count <= 0) {
      document.getElementById("warningMessage").textContent =
        "You have reached your free API usage limit.";
    }
  } else {
    window.location.href = "/login";
  }
}

function logout() {
  localStorage.removeItem("jwtToken");
  window.location.href = "/logout";
}

document.addEventListener("DOMContentLoaded", function () {
  fetchUserData();
});
