import { test, expect } from '@playwright/test';

const uniqueId = Date.now();
const projectCreatePayload = {
  name: `create-testing-api-${uniqueId}`,
  organization_uuid: "0bfbb346-b0c9-4f8d-8699-fe66d0fac4f9",
  iam: {},
  users: [],
  project_members: []
};

const projectUpdatePayload = {
  name: `create-testing-api-updated-${uniqueId}`,
  icon: null,
  organization_uuid: "0bfbb346-b0c9-4f8d-8699-fe66d0fac4f9",
  project_members_added: [],
  project_members_deleted: [],
  project_members_updated: []
};

class SimpleAPIClient {
  async axiosPost({ baseURL, path, data, token, isErrorExpected }) {
    const response = await fetch(`${baseURL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const resData = await response.json().catch(() => ({}));
    return { status: response.status, data: resData };
  }

  async axiosPut({ baseURL, path, data, token, isErrorExpected }) {
    const response = await fetch(`${baseURL}/${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data)
    });
    const resData = await response.json().catch(() => ({}));
    return { status: response.status, data: resData };
  }

  async axiosDelete({ baseURL, path, token, isErrorExpected }) {
    const response = await fetch(`${baseURL}/${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const resData = await response.json().catch(() => ({}));
    return { status: response.status, data: resData };
  }
}

const commandAPI = new SimpleAPIClient();

async function postLogin({ data, baseURL = 'https://api.demo.awanio.com/v2', isErrorExpected = false }) {
  return await commandAPI.axiosPost({ baseURL, path: 'accounts/login', data, isErrorExpected });
}

async function postProjectCreate({ data, token, baseURL = 'https://api.demo.awanio.com/v2', isErrorExpected = false }) {
  return await commandAPI.axiosPost({ baseURL, path: 'projects', data, isErrorExpected, token });
}

async function putProjectUpdate({ uuid, data, token, baseURL = 'https://api.demo.awanio.com/v2', isErrorExpected = false }) {
  return await commandAPI.axiosPut({ baseURL, path: `projects/${uuid}`, data, isErrorExpected, token });
}

async function deleteProject({ uuid, token, baseURL = 'https://api.demo.awanio.com/v2', isErrorExpected = false }) {
  return await commandAPI.axiosDelete({ baseURL, path: `projects/${uuid}`, isErrorExpected, token });
}

const result = {};

test.describe.serial('Awanio Project API Testing - CRUD Flow', () => {

  test('Create Project Test', async () => {
    await test.step('Login as user to get token', async (loginStep) => {
      const loginRes = await postLogin({
        data: { username: "zhrahprn", password: "Zz010904," }
      });
      
      loginStep.attach(`Expect status to be 200, got ${loginRes.status}`, 'text/plain');
      expect(loginRes.status).toBe(200); //[cite: 1] Assert status code dulu sebelum destructure
      
      result.token = loginRes.data.token || loginRes.data.data?.token;
      expect(result.token).toBeTruthy();
    });

    await test.step('Create new project and save generated UUID', async (createStep) => {
      const createRes = await postProjectCreate({
        token: result.token,
        data: projectCreatePayload
      });

      createStep.attach(`Response Body: ${JSON.stringify(createRes.data)}`, 'text/plain');
      expect(createRes.status, `Gagal membuat project. Error: ${JSON.stringify(createRes.data)}`).toBe(200);

      result.projectUuid = createRes.data.data?.uuid || createRes.data.uuid;
      expect(result.projectUuid).toBeTruthy();
    });
  });

  test('Update Project Test', async () => {

    if (!result.token || !result.projectUuid) {
      throw new Error("Token atau Project UUID tidak ditemukan! Pastikan test Create dijalankan terlebih dahulu secara berurutan.");
    }

    await test.step('Update project data using saved token and UUID', async (updateStep) => {
      const updateRes = await putProjectUpdate({
        uuid: result.projectUuid, 
        token: result.token,      
        data: projectUpdatePayload
      });

      updateStep.attach(`Expect status to be 200, got ${updateRes.status}`, 'text/plain');
      expect(updateRes.status).toBe(200); 
    });
  });

  test('Delete Project Test', async () => {
    if (!result.token || !result.projectUuid) {
      throw new Error("Token atau Project UUID tidak ditemukan! Pastikan test Create dijalankan terlebih dahulu secara berurutan.");
    }

    await test.step('Delete project using saved token and UUID', async (deleteStep) => {
      const deleteRes = await deleteProject({
        uuid: result.projectUuid, 
              token: result.token       
      });

      deleteStep.attach(`Expect status to be 200, got ${deleteRes.status}`, 'text/plain');
      expect(deleteRes.status).toBe(200); 
    });
  });

});