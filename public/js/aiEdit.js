const editPage = async () => {
  const editPageResult = document.getElementById("editPageResult");
  const pageName = document.getElementById("editPagePageOriName").value;
  const newPageName = document.getElementById("editPagePageName").value;
  const description = document.getElementById("editPageDescription").value;

  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/editPage`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify({
          pageName: pageName,
          newPageName: newPageName,
          description: description,
        }),
      }
    );

    const data = await response.json();

    if (data) {
      editPageResult.innerHTML = data.success;
      editPageResult.style.color = "green";
    } else {
      editPageResult.innerHTML = data.error;
      editPageResult.style.color = "red";
    }
  } catch (error) {
    editPageResult.innerHTML = error.error;
    editPageResult.style.color = "red";
  }
};

const deletePage = async () => {
  const editPageResult = document.getElementById("editPageResult");
  const pageName = document.getElementById("editPagePageOriName").value;

  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/deletePage`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
        body: JSON.stringify({
          pageName: pageName,
        }),
      }
    );

    const data = await response.json();

    if (data) {
      editPageResult.innerHTML = data.success;
      editPageResult.style.color = "green";
    } else {
      editPageResult.innerHTML = data.error;
      editPageResult.style.color = "red";
    }
  } catch (error) {
    editPageResult.innerHTML = error.error;
    editPageResult.style.color = "red";
  }
};

const editContext = async (id) => {
  const pageName = document.getElementById("editContextPageName").value;
  const text = document.getElementById(`editContextContext-${id}`).value;
  const resultContainer = document.getElementById(`editContextResult-${id}`);
  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/editContext`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
        body: JSON.stringify({
          pageName: pageName,
          id: id,
          text: text,
        }),
      }
    );
    const data = await response.json();
    if (data) {
      resultContainer.innerHTML = data.success;
      resultContainer.style.color = "green";
    } else {
      resultContainer.innerHTML = data.error;
      resultContainer.style.color;
    }
  } catch (error) {
    resultContainer.innerHTML = error.error;
    resultContainer.style.color = "red";
  }
};

const deleteContext = async (id) => {
  const pageName = document.getElementById("editContextPageName").value;
  const resultContainer = document.getElementById(`editContextResult-${id}`);
  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/deleteContext`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
        body: JSON.stringify({
          pageName: pageName,
          id: id,
        }),
      }
    );
    const data = await response.json();
    if (data) {
      resultContainer.innerHTML = data.success;
      resultContainer.style.color = "green";
    } else {
      resultContainer.innerHTML = data.error;
      resultContainer.style.color;
    }
  } catch (error) {
    resultContainer.innerHTML = error.error;
    resultContainer.style.color = "red";
  }
};

const editPageOnSelect = (name) => {
  const editPagePageName = document.getElementById("editPagePageName");
  const editPageDescription = document.getElementById("editPageDescription");
  editPagePageName.value = pageNames.find((page) => page.name === name).name;
  editPageDescription.value = pageNames.find((page) => page.name === name).desc;
};

const editContextOnSelect = async (name) => {
  const editContextPageName = document.getElementById(
    "editContextPageName"
  ).value;
  const editContextContainer = document.getElementById(
    "editContextContextContainer"
  );

  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/getPageContext`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ pageName: name }),
      }
    );

    const data = await response.json();

    if (data) {
      let contextList = "";
      data.contexts.forEach((context) => {
        contextList += `
        <div class="mb-3">
                <label for="editContextContext" class="form-label"
                  >Edit the context:</label
                >
                <textarea
                  id="editContextContext-${context.id}"
                  name="editContextContext"
                  placeholder="Enter the context"
                  style="background-color: #e9ecef"
                  class="form-control"
                  required
                >${context.text}</textarea>
              </div>
              <button
                id="editContextButton-${context.id}"
                type="button"
                class="btn btn-primary w-100 fw-semibold rounded text-center"
                style="height: 50px"
              >
                Edit
              </button>
              <button
                id="deleteContextButton-${context.id}"
                type="button"
                class="btn btn-danger w-100 fw-semibold rounded text-center mt-2 mb-3"
                style="height: 50px"
              >
                Delete
              </button>
              <div id="editContextResult-${context.id}" class="text-center"></div>`;
      });
      editContextContainer.innerHTML = contextList;

      data.contexts.forEach((context) => {
        document
          .getElementById(`editContextButton-${context.id}`)
          .addEventListener("click", () => editContext(context.id));
        document
          .getElementById(`deleteContextButton-${context.id}`)
          .addEventListener("click", () => deleteContext(context.id));
      });
    } else {
      editContextContainer.innerHTML = data.error;
      editContextContainer.style.color = "red";
    }
  } catch (error) {
    editContextContainer.innerHTML = error.error;
    editContextContainer.style.color = "red";
  }
};

const loadPageNames = () => {
  const editPagePageOriName = document.getElementById("editPagePageOriName");
  const editContextPageName = document.getElementById("editContextPageName");
  const pageSelections = pageNames.map((pageName) => {
    return `<option value="${pageName.name}">${pageName.name}</option>`;
  });
  editPagePageOriName.innerHTML = pageSelections;
  editContextPageName.innerHTML = pageSelections;
};

document.addEventListener("DOMContentLoaded", () => {
  if (pageNames.length > 0) {
    loadPageNames();
  }
});
