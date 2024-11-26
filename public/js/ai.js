const askBot = async () => {
  const answerContainer = document.getElementById("answers");
  const pageName = document.getElementById("askQuestionPageName").value;
  const question = document.getElementById("question").value;
  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/askBot`,
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

const createPage = async () => {
  const createPageResult = document.getElementById("createPageResult");
  const pageName = document.getElementById("createPagePageName").value;
  const description = document.getElementById("createPageDescription").value;

  try {
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/createPage`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ pageName: pageName, description: description }),
      }
    );

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
    const response = await fetch(
      `https://comp4537c2pfrontend-production.up.railway.app/createContext`,
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
