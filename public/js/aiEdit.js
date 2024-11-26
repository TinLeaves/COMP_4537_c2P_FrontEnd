const BOT_ROUTES = {
  PAGES: () => "/api/v1/bot/page/",
  QUERY_PAGE: (pageName) => `/api/v1/bot/page/?name=${pageName}`,
  CONTEXT: (pageName) => `/api/v1/bot/page/${pageName}/`,
  QUERY_CONTEXT: (pageName, contextId) =>
    `/api/v1/bot/page/${pageName}/context/?id=${contextId}`,
  ASK: (pageName) => `/api/v1/bot/page/${pageName}/ask/`,
};

class PageError extends Error {}
class ContextError extends Error {}
class AskError extends Error {}

const getContext = async (pageName) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(BOT_ROUTES.CONTEXT(pageName), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });

    const data = await response.json();

    if (response.status === 200) {
      if (data.contexts) {
        return data.contexts;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new ContextError(error);
  }
};

const askBot = async () => {
  const answerContainer = document.getElementById("answers");
  const pageName = document.getElementById("askQuestionPageName").value;
  const question = document.getElementById("question").value;
  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/askBot`,
      // `http://localhost:3000/askBot`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ pageName: pageName, question: question }),
      }
    );

    const data = await response.json();

    if (data?.response) {
      let responseList = "";
      data.response.forEach((answer) => {
        responseList += `<li><p>${answer.text}</p><p>Score: ${answer.score} - ${answer.document}</p></li>`;
      });
      answerContainer.innerHTML = responseList;
    } else {
      answerContainer.innerHTML = data.error;
      answerContainer.style.color = "red";
    }
  } catch (error) {
    answerContainer.innerHTML = error.error;
    answerContainer.style.color = "red";
  }
};

const editPage = async () => {
  const editPageResult = document.getElementById("editPageResult");
  const pageName = document.getElementById("editPagePageOriName").value;
  const newPageName = document.getElementById("editPagePageName").value;
  const description = document.getElementById("editPageDescription").value;

  try {
    const response = await fetch(
      // `https://comp4537c2pfrontend-production.up.railway.app/editPage`,
      `http://localhost:3000/editPage`,
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
      // `https://comp4537c2pfrontend-production.up.railway.app/editPage`,
      `http://localhost:3000/deletePage`,
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

const createContext = async () => {
  const createContextResult = document.getElementById("createContextResult");
  const pageName = document.getElementById("createContextPageName").value;
  const context = document.getElementById("createContextContext").value;

  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/createContext`,
      // `http://localhost:3000/createContext`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ pageName: pageName, context: context }),
      }
    );

    const data = await response.json();

    if (data) {
      createContextResult.innerHTML = data.success;
      createContextResult.style.color = "green";
    } else {
      createContextResult.innerHTML = data.error;
      createContextResult.style.color = "red";
    }
  } catch (error) {
    createContextResult.innerHTML = error.error;
    createContextResult.style.color = "red";
  }
};

// const deletePage = async (pageName) => {
//   try {
//     const token = localStorage.getItem("jwtToken");
//     const response = await fetch(BOT_ROUTES.QUERY_PAGE(pageName), {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       method: "DELETE",
//     });

//     const data = await response.json();

//     if (response.status === 200) {
//       if (data.success) {
//         return data.success;
//       }
//     } else {
//       throw new Error(data.error);
//     }
//   } catch (error) {
//     throw new PageError(error);
//   }
// };

const deleteContext = async (pageName, contextId) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(
      BOT_ROUTES.QUERY_CONTEXT(pageName, contextId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (response.status === 200) {
      if (data.success) {
        return data.success;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new ContextError(error);
  }
};

const patchPage = async (currentPageName, newPageName, newDescription) => {
  try {
    const token = localStorage.getItem("jwtToken");

    const body = {};

    if (currentPageName) {
      body.name = newPageName;
    } else {
      throw new Error("Current page name is required");
    }

    if (newDescription) {
      body.description = newDescription;
    }

    if (newPageName) {
      body.new_name = newPageName;
    }

    const response = await fetch(BOT_ROUTES.PAGES(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.status === 200) {
      if (data.success) {
        return data.success;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new PageError(error);
  }
};

const editContext = async (id) => {
  const pageName = document.getElementById("editContextPageName").value;
  const text = document.getElementById(`editContextContext-${id}`).value;
  const resultContainer = document.getElementById(`editContextResult-${id}`);
  try {
    const response = await fetch(
      // `https://comp4537c2pfrontend-production.up.railway.app/editContext`,
      `http://localhost:3000/editContext`,
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
      // `https://comp4537c2pfrontend-production.up.railway.app/getPageContext`,
      `http://localhost:3000/getPageContext`,
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
