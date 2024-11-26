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

function doSomething() {
  const token = localStorage.getItem("jwtToken");

  fetch("/api_route_name", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        return refreshAccessToken().then(() => getProtectedData());
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
    });
}

function refreshAccessToken() {
  return fetch("/api/refresh-token", {
    method: "POST",
    credentials: "include", // Include cookies in the request
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      } else {
        throw new Error("Failed to refresh token");
      }
    });
}

const getPages = async () => {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(BOT_ROUTES.PAGES(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    const data = await response.json();

    if (response.status === 200) {
      if (data.pages) {
        return data.pages;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new PageError(error);
  }
};

const getContext = async (pageName) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(BOT_ROUTES.CONTEXT(pageName), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "GET",
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
    const response = await fetch(`http://localhost:3000/askBot`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ pageName: pageName, question: question }),
    });

    const data = await response.json();

    if (data?.response) {
      answerContainer.innerHTML = data.response.map((answer) => {
        return `<li><p>${answer.text}</p><p>Score: ${answer.score} - ${answer.document}</p></li>`;
      });
    } else {
      answerContainer.innerHTML = data.error;
      answerContainer.style.color = "red";
    }
  } catch (error) {
    answerContainer.innerHTML = error.error;
    answerContainer.style.color = "red";
  }
};

const createPage = async () => {
  const createPageResult = document.getElementById("createPageResult");
  const pageName = document.getElementById("createPagePageName").value;
  const description = document.getElementById("createPageDescription").value;

  try {
    const response = await fetch(`http://localhost:3000/createPage`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ pageName: pageName, description: description }),
    });

    const data = await response.json();

    if (data) {
      createPageResult.innerHTML = data.success;
      createPageResult.style.color = "green";
    } else {
      createPageResult.innerHTML = data.error;
      createPageResult.style.color = "red";
    }
  } catch (error) {
    createPageResult.innerHTML = error.error;
    createPageResult.style.color = "red";
  }
};

const createContext = async () => {
  const createContextResult = document.getElementById("createContextResult");
  const pageName = document.getElementById("createContextPageName").value;
  const context = document.getElementById("createContextContext").value;

  try {
    const response = await fetch(`http://localhost:3000/createContext`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ pageName: pageName, context: context }),
    });

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

const deletePage = async (pageName) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(BOT_ROUTES.QUERY_PAGE(pageName), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "DELETE",
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

const patchContext = async (pageName, contextId, text) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await fetch(BOT_ROUTES.CONTEXT(pageName), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify({
        id: contextId,
        text: text,
      }),
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
    throw new ContextError(error);
  }
};

const loadPageNames = () => {
  const createContextPageName = document.getElementById(
    "createContextPageName"
  );
  const askQuestionPageName = document.getElementById("askQuestionPageName");
  const pageSelections = pageNames.map((pageName) => {
    return `<option value="${pageName.name}">${pageName.name}</option>`;
  });
  createContextPageName.innerHTML = pageSelections;
  askQuestionPageName.innerHTML = pageSelections;
};

document.addEventListener("DOMContentLoaded", () => {
  if (pageNames.length > 0) {
    loadPageNames();
  }
});
