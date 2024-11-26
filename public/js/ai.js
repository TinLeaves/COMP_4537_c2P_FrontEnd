const BOT_ROUTES = {
  PAGES: () => '/api/v1/bot/page/',
  QUERY_PAGE: (pageName) => `/api/v1/bot/page/?name=${pageName}`,
  CONTEXT: (pageName) => `/api/v1/bot/page/${pageName}/`,
  QUERY_CONTEXT: (pageName, contextId) => `/api/v1/bot/page/${pageName}/context/?id=${contextId}`,
  ASK: (pageName) => `/api/v1/bot/page/${pageName}/ask/`,
}

class PageError extends Error {};
class ContextError extends Error {}
class AskError extends Error {}

function doSomething() {
    const token = localStorage.getItem('jwtToken');
  
    fetch('/api_route_name', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (response.status === 401) {
        return refreshAccessToken().then(() => getProtectedData()); 
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
    });
  }


function refreshAccessToken() {
return fetch('/api/refresh-token', {
    method: 'POST',
    credentials: 'include' // Include cookies in the request
})
.then(response => response.json())
.then(data => {
    if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    } else {
    throw new Error('Failed to refresh token');
    }
});
}

const getPages = async () => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.PAGES(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    const data = await response.json();

    if (response.status === 200) {
      if (data.pages) {
        return data.pages;
      }
    }  else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new PageError(error);
  }
}

const getContext = async (pageName) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.CONTEXT(pageName), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
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
}

const askBot = async (pageName, question) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.ASK(pageName), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({question: question}),
    });

    const data = await response.json();

    if (response.status === 200) {
      if (data.response) {
        return data.response;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new AskError(error);
  }
}

const createPage = async (pageName, description) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.PAGES(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({name: pageName, description: description}),
    });

    const data = await response.json();

    if (response.status === 201) {
      if (data.success) {
        return data.success;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new PageError(error);
  }
}

const createContext = async (pageName, text) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.CONTEXT(pageName), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({text: data}),
    });

    const data = await response.json();

    if (response.status === 201) {
      if (data.success) {
        return data.success;
      }
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    throw new ContextError(error);
  }
}

const deletePage = async (pageName) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.QUERY_PAGE(pageName), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
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
}

const deleteContext = async (pageName, contextId) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.QUERY_CONTEXT(pageName, contextId), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
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
}

const patchPage = async (currentPageName, newPageName, newDescription) => {
  try {
    const token = localStorage.getItem('jwtToken');

    const body = {};

    if (currentPageName) {
      body.name = newPageName;
    } else {
      throw new Error('Current page name is required');
    }

    if (newDescription) {
      body.description = newDescription;
    }

    if (newPageName) {
      body.new_name = newPageName;
    }

    const response = await fetch(BOT_ROUTES.PAGES(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
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
}

const patchContext = async (pageName, contextId, text) => {
  try {
    const token = localStorage.getItem('jwtToken');
    const response = await fetch(BOT_ROUTES.CONTEXT(pageName), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
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
}